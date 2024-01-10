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
    default_executor, serde::to_vec, ExecutorEnv, MemoryImage, Program, GUEST_MAX_MEM, PAGE_SIZE,
    VERSION,
};
use serde::{Deserialize, Serialize};
use std::{
    collections::HashMap,
    sync::{atomic::AtomicUsize, Arc},
};
use tokio::sync::{mpsc, RwLock};
use tokio_stream::wrappers::UnboundedReceiverStream;
use warp::{filters::ws::Message, http::StatusCode, reply::with_header, Filter};

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

    /// JWT token for authentication
    #[arg(short, long)]
    jwt: Option<String>,

    /// Identity Provider (e.g., "Google")
    #[arg(long, default_value = "Google")]
    provider: Option<String>,
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

#[derive(Deserialize)]
struct AuthRequest {
    code: String,
}

#[derive(Deserialize)]
struct TokenResponse {
    access_token: String,
}

async fn auth_handler(
    auth_request: AuthRequest,
    users: Users,
) -> Result<impl warp::Reply, warp::Rejection> {
    info!("auth");
    let client_id = dotenv::var("CLIENT_ID").expect("CLIENT_ID not found in .env file");
    let client_secret = dotenv::var("CLIENT_SECRET").expect("CLIENT_SECRET not found in .env file");
    let redirect_uri = dotenv::var("REDIRECT_URI").expect("REDIRECT_URI not found in .env file");

    info!("Request: {:?}", &client_id);

    let params = [
        ("client_id", client_id.as_str()),
        ("client_secret", client_secret.as_str()),
        ("code", auth_request.code.as_str()),
        ("redirect_uri", redirect_uri.as_str()),
        ("grant_type", "authorization_code"),
    ];

    let client = reqwest::Client::new();
    let res = client
        .post("https://api.id.me/oauth/token")
        .form(&params)
        .send()
        .await
        .map_err(|e| warp::reject::not_found())?;

    let body = res.text().await.map_err(|e| warp::reject::not_found())?;
    info!("ID.me token endpoint response: {}", body);

    let token_response: TokenResponse =
        serde_json::from_str(&body).map_err(|e| warp::reject::not_found())?;

    let jwt_token = token_response.access_token;

    let cookie_value = format!("session={}; Path=/; Max-Age=3600", jwt_token);

    Ok(with_header(
        "Authenticated successfully",
        "Set-Cookie",
        cookie_value,
    ))
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

fn run_local_exec(provider: IdentityProvider, jwt: String) {
    let program =
        Program::load_elf(JWT_VALIDATE_ELF, GUEST_MAX_MEM as u32).expect("Failed to load ELF");
    let image =
        MemoryImage::new(&program, PAGE_SIZE as u32).expect("Failed to create Memory Image");
    let image_id = hex::encode(image.compute_id());
    info!("ImageId = {image_id}");
    let mut builder = ExecutorEnv::builder();
    builder.session_limit(None).write(&(provider, jwt)).unwrap();

    let env = builder.build().expect("Failed to build Executor");

    default_executor()
        .execute(env, image)
        .expect("Failed to execute");
}

async fn handle_connection(ws: warp::ws::WebSocket, users: Users) {
    info!("New connection");

    let id = NEXT_USER_ID.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
    info!("ID: {} | Connection ID assigned", id);

    let (user_ws_tx, mut user_ws_rx) = ws.split();

    let (tx, rx) = mpsc::unbounded_channel();

    let rx = UnboundedReceiverStream::new(rx);
    tokio::spawn(rx.forward(user_ws_tx));

    users.write().await.insert(id, tx);

    while let Some(result) = user_ws_rx.next().await {
        match result {
            Ok(text) => {
                if text.as_bytes().is_empty() {
                    info!("ID: {} | Received empty text message, ignoring", id);
                    continue;
                }

                info!("ID: {} | Received text message from user", id);
                let msg = match text.to_str() {
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

                let provider = IdentityProvider::Google;
                let jwt = jwt_req.jwt;

                info!("ID: {} | Running Bonsai", id);

                match run_bonsai(id, provider, jwt).await {
                    Ok(res) => {
                        let wrapped_proof = SnarkReceiptWrapper {
                            snark: &res.snark,
                            post_state_digest: &res.post_state_digest,
                            journal: &res.journal,
                        };

                        let proof_string = serde_json::to_string(&wrapped_proof)
                            .expect("Failed to convert proof to string");

                        info!("ID: {} | Sending proof back to user", id);

                        let mut users = users.write().await;

                        // Locate the sender associated with the originating user and send the proof back to that user
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
                                serde_json::to_string(&e.to_string())
                                    .expect("Failed to convert to string"),
                            ))) {
                                error!("ID: {} | Failed to send proof back to user", id);
                            }
                        } else {
                            error!("ID: {} | Failed to locate user", id);
                        }
                    }
                };
            }
            Err(e) => {
                error!("ID: {} | WebSocket error: {}", id, e);
                break;
            }
        }
    }

    // Handle user disconnection
    disconnect_user(id, &users).await;
}

async fn disconnect_user(id: usize, users: &Users) {
    info!("ID: {} | Disconnected", id);
    users.write().await.remove(&id);
}

async fn run_server(host: String, port: String) {
    dotenv().ok();

    let users = Users::default();
    let users = warp::any().map(move || users.clone());

    // Add a route for /auth
    let auth_route = warp::post()
        .and(warp::path::end())
        .and(warp::body::json())
        .and(users.clone())
        .and_then(auth_handler);

    let routes = auth_route.or(warp::path::end()
        .and(warp::ws())
        .and(users)
        .and(warp::header::optional::<String>("X-Real-IP"))
        .map(|ws: warp::ws::Ws, users, ip: Option<String>| {
            info!("remote_ip: {}", ip.unwrap_or_default());
            ws.on_upgrade(move |socket| handle_connection(socket, users))
        }));

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
    dotenv().ok();

    let cli = Args::parse();

    if cli.executor {
        let jwt = cli
            .jwt
            .ok_or_else(|| anyhow!("JWT is required in local executor mode"))?;
        let provider_str = cli
            .provider
            .ok_or_else(|| anyhow!("Identity provider is required in local executor mode"))?;

        let provider = match provider_str.to_lowercase().as_str() {
            "google" => IdentityProvider::Google,
            _ => return Err(anyhow!("Unsupported identity provider")),
        };

        info!("Running Local Executor Mode with JWT and Provider");
        run_local_exec(provider, jwt);
        return Ok(());
    }

    let host = cli
        .host
        .ok_or_else(|| anyhow!("Host is required when in server mode"))?;
    let port = cli
        .port
        .ok_or_else(|| anyhow!("Port is required when in server mode"))?;

    info!("Running in server mode");
    run_server(host, port).await;

    return Ok(());
}
