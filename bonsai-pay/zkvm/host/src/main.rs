use anyhow::{anyhow, Context, Result};
use bonsai_sdk::alpha::responses::SnarkReceipt;
use clap::Parser;
use futures::StreamExt;
use host::seal_serializer::SnarkReceiptWrapper;
use log::{error, info};
use methods::JWT_VALIDATE_ELF;
use oidc_validator::IdentityProvider;
use pretty_env_logger;
use risc0_zkvm::{
    default_executor, serde::to_vec, Executor, ExecutorEnv, MemoryImage, Program, GUEST_MAX_MEM,
    PAGE_SIZE, VERSION,
};
use serde::{Deserialize, Serialize};
use std::{
    collections::HashMap,
    sync::{atomic::AtomicUsize, Arc},
};
use tokio::sync::{mpsc, RwLock};
use tokio_stream::wrappers::UnboundedReceiverStream;
use warp::{filters::ws::Message, Filter};

use dotenv::dotenv;

static NEXT_USER_ID: AtomicUsize = AtomicUsize::new(1);

type Users = Arc<RwLock<HashMap<usize, mpsc::UnboundedSender<Result<Message, warp::Error>>>>>;

#[derive(Parser)]
#[command(author, version, about, long_about = None)]
struct Args {
    /// Host to bind to when using server mode
    #[arg(short = 'n', long, default_value = "127.0.0.1")]
    host: Option<String>,

    /// Port to bind to when using server mode
    #[arg(short, long, default_value = "8181")]
    port: Option<String>,

    /// Run local executor for testing and benchmarking
    #[arg(short = 'x', long, default_value_t = false)]
    executor: bool,
}

#[derive(Deserialize)]
struct JwtRequest {
    jwt: String,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct NopRef {
    pub idx: u32,
}

alloy_sol_types::sol! {
    struct ClaimsData {
        address addr;
        bytes ident;
    }
}

async fn run_bonsai(id: usize, provider: IdentityProvider, jwt: String) -> Result<SnarkReceipt> {
    let result = tokio::task::spawn_blocking(move || -> Result<SnarkReceipt> {
        let client = bonsai_sdk::alpha::Client::from_env(VERSION)?;

        // Upload input to Bonsai
        let input_data = to_vec(&(provider, jwt)).unwrap();
        let input_data = bytemuck::cast_slice(&input_data).to_vec();
        let input_id = client.upload_input(input_data)?;

        // Upload image to Bonsai
        let program = Program::load_elf(JWT_VALIDATE_ELF, GUEST_MAX_MEM as u32)?;
        let image = MemoryImage::new(&program, PAGE_SIZE as u32)?;
        let image_id = hex::encode(image.compute_id());
        let image = bincode::serialize(&image).expect("Failed to serialize memory img");
        client.upload_img(&image_id, image)?;

        info!("ID: {} | Image ID: {}", id, image_id);
        info!("ID: {} | Input ID: {}", id, input_id);
        info!("ID: {} | Uploaded image and input to Bonsai", id);
        // Create session
        let session = client.create_session(image_id, input_id)?;

        info!("ID: {} | Session ID: {}", id, session.uuid);
        // Poll session status
        loop {
            let res = session.status(&client)?;
            match res.status.as_str() {
                "RUNNING" => {
                    std::thread::sleep(std::time::Duration::from_secs(5));
                }
                "SUCCEEDED" => {
                    info!("ID: {} | Session {} succeeded.", id, session.uuid);
                    break;
                }
                _ => {
                    error!(
                        "ID: {} | Session {} failed with status: {} | err: {}",
                        id,
                        session.uuid,
                        res.status,
                        res.error_msg.unwrap_or_default()
                    );
                    return Err(anyhow!("Failed to generate proof"));
                }
            }
        }

        let snark_session = client.create_snark(session.uuid)?;

        info!(
            "ID: {} | Start snark session ID: {}",
            id, snark_session.uuid
        );

        // Poll the snark session status
        let receipt = loop {
            let res = snark_session.status(&client)?;
            match res.status.as_str() {
                "RUNNING" => {
                    std::thread::sleep(std::time::Duration::from_secs(5));
                    continue;
                }
                "SUCCEEDED" => {
                    info!(
                        "ID: {} | Snark session {} succeeded.",
                        id, snark_session.uuid
                    );
                    break res.output.context("Missing SNARK on successful workflow")?;
                }
                _ => {
                    error!(
                        "ID: {} | Snark session {} failed with status: {}",
                        id, snark_session.uuid, res.status
                    );
                    return Err(anyhow!("Failed to generate SNARK"));
                }
            }
        };

        Ok(receipt)
    })
    .await??;

    Ok(result)
}

fn run_local_exec(provider: IdentityProvider, jwt: String) -> Result<()> {
    let program = Program::load_elf(JWT_VALIDATE_ELF, GUEST_MAX_MEM as u32).unwrap();
    let image = MemoryImage::new(&program, PAGE_SIZE as u32).unwrap();
    let image_id = hex::encode(image.compute_id());
    info!("ImageId = {image_id}");
    let mut builder = ExecutorEnv::builder();
    builder.session_limit(None).write(&(provider, jwt)).unwrap();

    let env = builder.build().unwrap();

    default_executor().execute(env, image).unwrap();

    Ok(())
}

// Define an asynchronous function to handle new connections
async fn handle_connection(ws: warp::ws::WebSocket, users: Users) {
    info!("New connection");

    let id = NEXT_USER_ID.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
    info!("ID: {} | Connection ID assigned", id);

    // Split the WebSocket into a sender and receiver half
    let (user_ws_tx, mut user_ws_rx) = ws.split();

    // Create an unbounded channel for message passing
    let (tx, rx) = mpsc::unbounded_channel();

    let rx = UnboundedReceiverStream::new(rx);
    tokio::spawn(rx.forward(user_ws_tx));

    users.write().await.insert(id, tx);

    while let Some(result) = user_ws_rx.next().await {
        let msg = match result {
            Ok(msg) => msg,
            Err(e) => {
                error!("ID: {} | WebSocket error: {}", id, e);
                break;
            }
        };

        info!("ID: {} | Received message from user", id);

        let msg = match msg.to_str() {
            Ok(msg) => msg,
            Err(e) => {
                error!("ID: {} | Failed to convert message to string: {:?}", id, e);
                continue;
            }
        };

        let jwt_req = match serde_json::from_str::<JwtRequest>(msg) {
            Ok(jwt_req) => jwt_req,
            Err(e) => {
                error!(
                    "ID: {} | Failed to deserialize message to JWT Request: {}",
                    id, e
                );
                continue;
            }
        };

        info!(
            "ID: {} | JWT: {}...{}",
            id,
            &jwt_req.jwt[..8],
            &jwt_req.jwt[jwt_req.jwt.len() - 32..]
        );

        // Define the identity provider and the jwt from the request
        let provider = IdentityProvider::Google;
        let jwt = jwt_req.jwt;

        info!("ID: {} | Running Bonsai", id);

        // Run the Bonsai function to generate a proof
        match run_bonsai(id, provider, jwt).await {
            Ok(res) => {
                let wrapped_proof = SnarkReceiptWrapper {
                    snark: &res.snark,
                    post_state_digest: &res.post_state_digest,
                    journal: &res.journal,
                };

                let proof_string = serde_json::to_string(&wrapped_proof).unwrap();

                info!("ID: {} | Sending proof back to user", id);

                let mut users = users.write().await;

                // Locate the sender associated with the originating user and send the proof back to that Users
                if let Some(user_tx) = users.get_mut(&id) {
                    if let Err(_disconnected) =
                        user_tx.send(Ok(Message::text(proof_string.clone())))
                    {
                        error!("ID: {} | Failed to send proof back to user", id);
                    }
                } else {
                    error!("ID: {} | Failed to locate user", id);
                }
            }
            Err(e) => {
                error!("ID: {} | Bonsai error: {}", id, e);

                let mut users = users.write().await;

                // Locate the sender associated with the originating user and send the proof back to that users
                if let Some(user_tx) = users.get_mut(&id) {
                    if let Err(_disconnected) = user_tx.send(Ok(Message::text(
                        serde_json::to_string(&e.to_string()).unwrap(),
                    ))) {
                        error!("ID: {} | Failed to send proof back to user", id);
                    }
                } else {
                    error!("ID: {} | Failed to locate user", id);
                }
            }
        };
    }
    // Handle user disconnection
    disconnect_user(id, &users).await;
}

async fn disconnect_user(id: usize, users: &Users) {
    info!("ID: {} | Disconnected", id);
    users.write().await.remove(&id);
}

async fn run_websocket_server(host: String, port: String) {
    dotenv().ok();

    let users = Users::default();
    let users = warp::any().map(move || users.clone());

    let routes = warp::path::end()
        .and(warp::ws())
        .and(users)
        .and(warp::header::optional::<String>("X-Real-IP"))
        .map(|ws: warp::ws::Ws, users, ip: Option<String>| {
            info!("remote_ip: {}", ip.unwrap_or_default());
            ws.on_upgrade(move |socket| handle_connection(socket, users))
        });

    let host: Result<Vec<u8>, std::num::ParseIntError> = host
        .split('.')
        .map(|segment| segment.parse::<u8>())
        .collect();

    let host = host.unwrap();

    let host = std::net::IpAddr::V4(std::net::Ipv4Addr::new(host[0], host[1], host[2], host[3]));

    let port = port.parse::<u16>().unwrap();

    let socket_addr = std::net::SocketAddr::new(host, port);
    warp::serve(routes).run(socket_addr).await;
}

#[tokio::main]
async fn main() -> Result<()> {
    pretty_env_logger::init();

    let cli = Args::parse();

    let host = cli
        .host
        .ok_or_else(|| anyhow!("Host is required when in server mode"))?;
    let port = cli
        .port
        .ok_or_else(|| anyhow!("Port is required when in server mode"))?;

    let local_exec = cli.executor;

    if local_exec {
        const GOOGLE_JWT: &str = r#"eyJhbGciOiJSUzI1NiIsImtpZCI6IjViMzcwNjk2MGUzZTYwMDI0YTI2NTVlNzhjZmE2M2Y4N2M5N2QzMDkiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJuYmYiOjE2OTk5NDU4NzMsImF1ZCI6Ijg3Mzc4NzMzMTI2Mi03YmZsajRmaG91cDFlbmxiMDU1Z2dpcHFjaml1cTY4dS5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsInN1YiI6IjEwODM3ODE1MTk2ODc0Nzg5ODczMyIsIm5vbmNlIjoiMHhlZmRGOTg2MUYzZURjMjQwNDY0M0I1ODgzNzhGRTI0MkZDYWRFNjU4IiwiaGQiOiJyaXNjemVyby5jb20iLCJlbWFpbCI6ImhhbnNAcmlzY3plcm8uY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF6cCI6Ijg3Mzc4NzMzMTI2Mi03YmZsajRmaG91cDFlbmxiMDU1Z2dpcHFjaml1cTY4dS5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsIm5hbWUiOiJIYW5zIE1hcnRpbiIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NJQ0tlRDRnY0g3bnJTaDdncVFUMXJrMG1aUlNTcHlMMjhhTDRyekRKMnA9czk2LWMiLCJnaXZlbl9uYW1lIjoiSGFucyIsImZhbWlseV9uYW1lIjoiTWFydGluIiwiaWF0IjoxNjk5OTQ2MTczLCJleHAiOjE2OTk5NDk3NzMsImp0aSI6IjgxZjIzZTQwNDAwNmZkMmUzMTgxZTliYzkxNDMzZjA0NDNkNGI4MjIifQ.rNsLRtF22R6cvRbDksAAl5p3e1sAFii35xZWHUnVbLV_1ciQV7SpPIg-XkP_kBp7hqnYz1IGFm5Ce2L8Omm-5Z9onK8prsBKoJf5cGVJSwAy9NYtmRPQIcXOfGf6q1i04L_LBxnVnHx1VrL0ji8vJ7Tf99xO1qEjgy_VzhPBaoYJQlMkkundbCs84GUKrTnb7jPbRA8XalY4Wu-LHCl_f_degzRQZKqdRYiSBHUwYaDIX-X6wd3wdQZrlfTrzI1tZAQcwT5vG8rqz2XCx4ENFbnC_AX_2NCSlXAe3IRTH3nb37U38JPHj7d_DwJDhnjwrM4hVlZ9uY43EpoS8YGuvQ"#;

        info!("Running Local Executor Mode");
        run_local_exec(IdentityProvider::Google, GOOGLE_JWT.to_string());
        return Ok(());
    }

    info!("Running in server mode");
    run_websocket_server(host, port).await;

    return Ok(());
}
