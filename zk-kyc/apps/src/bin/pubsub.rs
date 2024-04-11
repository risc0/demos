// Copyright 2024 RISC Zero, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
use alloy_primitives::{FixedBytes, U256};
use alloy_sol_types::{sol, SolInterface, SolValue};
use anyhow::Context;
use apps::{BonsaiProver, TxSender};
use clap::Parser;
use log::{info, error};
use methods::JWT_VALIDATOR_ELF;
use serde::Deserialize;
use tokio::sync::oneshot;
use warp::{reject::Reject, reply::with_header, Filter, Rejection};

sol! {
    interface IzkKYC {
        function mint(address payable to, bytes32 claim_id, bytes32 post_state_digest, bytes calldata seal);
    }

    struct Input {
        uint256 identity_provider;
        string jwt;
    }

    struct ClaimsData {
        address msg_sender;
        bytes32 claim_id;
    }
}

/// Arguments of the publisher CLI.
#[derive(Parser, Debug)]
#[clap(author, version, about, long_about = None)]
struct Args {
    /// Ethereum chain ID
    #[clap(long)]
    chain_id: u64,

    /// Ethereum Node endpoint.
    #[clap(long, env)]
    eth_wallet_private_key: String,

    /// Ethereum Node endpoint.
    #[clap(long)]
    rpc_url: String,

    /// Application's contract address on Ethereum
    #[clap(long)]
    contract: String,
}

#[derive(Debug, Deserialize)]
struct AuthorizationCodeRequest {
    code: String,
}

#[derive(Deserialize)]
struct TokenResponse {
    access_token: String,
    token_type: String,
    expires_in: u32,
    scope: String,
    refresh_token: String,
    refresh_expires_in: u32,
    id_token: String,
}

// Custom rejection types
#[derive(Debug)]
struct EmptyTokenRejection;
impl Reject for EmptyTokenRejection {}

#[derive(Debug)]
struct ProverComputationFailedRejection;
impl Reject for ProverComputationFailedRejection {}

#[derive(Debug)]
struct TokenEndpointRequestFailedRejection;
impl Reject for TokenEndpointRequestFailedRejection {}

#[derive(Debug)]
struct TokenResponseReadFailedRejection;
impl Reject for TokenResponseReadFailedRejection {}

#[derive(Debug)]
struct InvalidTokenResponseRejection;
impl Reject for InvalidTokenResponseRejection {}

const HEADER_XAUTH: &str = "X-Auth-Token";

async fn jwt_authentication_handler(token: String) -> Result<impl warp::Reply, Rejection> {
    info!("JWT received");
    if token.is_empty() {
        return Err(warp::reject::custom(EmptyTokenRejection));
    }

    info!("Token received: {}", token);

    let args = Args::parse();
    let (tx, rx) = oneshot::channel();

    // Spawn a new thread for the Bonsai Prover computation
    std::thread::spawn(move || {
        prove_and_send_transaction(args, token, tx);
    });

    match rx.await {
        Ok(_result) => Ok(warp::reply()),
        Err(_) => Err(warp::reject::custom(ProverComputationFailedRejection)),
    }
}

async fn authorization_code_handler(
    auth_request: AuthorizationCodeRequest,
) -> Result<impl warp::Reply, Rejection> {
    info!("Authorization code received");
    let code = auth_request.code;
    let client_id = std::env::var("CLIENT_ID").expect("CLIENT_ID not found in environment");
    let client_secret =
        std::env::var("CLIENT_SECRET").expect("CLIENT_SECRET not found in environment");
    let redirect_uri =
        std::env::var("REDIRECT_URI").expect("REDIRECT_URI not found in environment");

    let params = [
        ("client_id", client_id.as_str()),
        ("client_secret", client_secret.as_str()),
        ("code", code.as_str()),
        ("redirect_uri", redirect_uri.as_str()),
        ("grant_type", "authorization_code"),
    ];

    let client = reqwest::Client::new();
    let res = client
        .post("https://api.idmelabs.com/oauth/token")
        .form(&params)
        .send()
        .await
        .map_err(|e| {
            error!("Token endpoint request failed: {:?}", e);
            warp::reject::custom(TokenEndpointRequestFailedRejection)
        }
        )?;

    let body = res
        .text()
        .await
        .map_err(|_e| warp::reject::custom(TokenResponseReadFailedRejection))?;
    info!("ID.me token endpoint response: {}", body);

    let token_response: TokenResponse =
        serde_json::from_str(&body).map_err(|_e| warp::reject::custom(InvalidTokenResponseRejection))?;

    let id_token = token_response.id_token;
    info!("ID TOKEN: {}", id_token);

    let id_token_cookie = format!("id_token={}; Path=/; Max-Age=3600; ", id_token);

    Ok(with_header(
        "Authenticated successfully",
        "Set-Cookie",
        id_token_cookie,
    ))
}

fn prove_and_send_transaction(
    args: Args,
    token: String,
    tx: oneshot::Sender<(Vec<u8>, FixedBytes<32>, Vec<u8>)>,
) {
    let input = Input {
        identity_provider: U256::ZERO, // ID.me as the identity provider
        jwt: token,
    };

    let (journal, post_state_digest, seal) =
        BonsaiProver::prove(JWT_VALIDATOR_ELF, &input.abi_encode())
            .expect("Failed to prove on Bonsai");

    let tx_sender = TxSender::new(
        args.chain_id,
        &args.rpc_url,
        &args.eth_wallet_private_key,
        &args.contract,
    )
    .expect("Failed to create tx sender");

    let claims = ClaimsData::abi_decode(&journal, true)
        .context("Decoding journal data")
        .expect("Failed to decode");

    info!("Claim ID: {:?}", claims.claim_id);
    info!("Msg Sender: {:?}", claims.msg_sender);

    let calldata = IzkKYC::IzkKYCCalls::mint(IzkKYC::mintCall {
        to: claims.msg_sender,
        claim_id: claims.claim_id,
        post_state_digest,
        seal: seal.clone(),
    })
    .abi_encode();

    // Send the calldata to Ethereum.
    let runtime = tokio::runtime::Runtime::new().expect("Failed to start new tokio runtime");
    runtime
        .block_on(tx_sender.send(calldata))
        .expect("Failed to send tx");

    tx.send((journal, post_state_digest, seal))
        .expect("Failed to send over channel");
}

fn jwt_authentication_filter() -> impl Filter<Extract = (impl warp::Reply,), Error = Rejection> + Clone {
    warp::path("authenticate")
        .and(warp::header::<String>(HEADER_XAUTH))
        .and_then(jwt_authentication_handler)
}

fn authorization_code_filter() -> impl Filter<Extract = (impl warp::Reply,), Error = Rejection> + Clone {
    warp::path("callback")
        .and(warp::get())
        .and(warp::query::<AuthorizationCodeRequest>())
        .and_then(authorization_code_handler)
}

#[tokio::main]
async fn main() {
    env_logger::init();

    let cors = warp::cors()
        .allow_any_origin()
        .allow_methods(vec!["GET", "POST"])
        .allow_headers(vec!["content-type", "x-auth-token"])
        .max_age(3600);

    let jwt_route = jwt_authentication_filter();
    let callback_route = authorization_code_filter();

    let api = jwt_route.or(callback_route).with(cors);

    warp::serve(api).run(([127, 0, 0, 1], 8080)).await;
}
