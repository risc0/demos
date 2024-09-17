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

use alloy_primitives::U256;
use alloy_sol_types::{sol, SolInterface, SolValue};
use anyhow::Context;
use apps::{BonsaiProver, TxSender};
use dotenv::dotenv;
use log::info;
use methods::JWT_VALIDATOR_ELF;
use std::env;
use tokio::sync::oneshot;
use warp::Filter;

sol! {
    interface IBonsaiPay {
        function claim(address payable to, bytes32 claim_id, bytes calldata seal);
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

const HEADER_XAUTH: &str = "X-Auth-Token";

async fn handle_jwt_authentication(token: String) -> Result<(), warp::Rejection> {
    if token.is_empty() {
        return Err(warp::reject::reject());
    }

    info!("Token received: {}", token);

    let (tx, rx) = oneshot::channel();

    // Spawn a new thread for the Bonsai Prover computation
    std::thread::spawn(move || {
        prove_and_send_transaction(token, tx);
    });

    match rx.await {
        Ok(_result) => Ok(()),
        Err(_) => Err(warp::reject::reject()),
    }
}

fn prove_and_send_transaction(token: String, tx: oneshot::Sender<(Vec<u8>, Vec<u8>)>) {
    dotenv().ok();

    let input = Input {
        identity_provider: U256::ZERO, // Google as the identity provider
        jwt: token,
    };

    let (journal, seal) = BonsaiProver::prove(JWT_VALIDATOR_ELF, &input.abi_encode())
        .expect("failed to prove on bonsai");

    println!("journal: {:?}", journal);
    println!("seal: {:?}", seal);

    // let input = input.abi_encode();

    let chain_id: u64 = env::var("CHAIN_ID")
        .expect("CHAIN_ID must be set")
        .parse()
        .expect("CHAIN_ID must be a valid u64");
    let rpc_url = env::var("RPC_URL").expect("RPC_URL must be set");
    let eth_wallet_private_key =
        env::var("ETH_WALLET_PRIVATE_KEY").expect("ETH_WALLET_PRIVATE_KEY must be set");
    let contract = env::var("CONTRACT_ADDRESS").expect("CONTRACT_ADDRESS must be set");

    let tx_sender = TxSender::new(chain_id, &rpc_url, &eth_wallet_private_key, &contract)
        .expect("failed to create tx sender");

    let claims = ClaimsData::abi_decode(&journal, true)
        .context("decoding journal data")
        .expect("failed to decode");

    info!("Claim ID: {:?}", claims.claim_id);
    info!("Msg Sender: {:?}", claims.msg_sender);

    let calldata = IBonsaiPay::IBonsaiPayCalls::claim(IBonsaiPay::claimCall {
        to: claims.msg_sender,
        claim_id: claims.claim_id,
        seal: seal.clone(),
    })
    .abi_encode();

    // Send the calldata to Ethereum.
    let runtime = tokio::runtime::Runtime::new().expect("failed to start new tokio runtime");
    runtime
        .block_on(tx_sender.send(calldata))
        .expect("failed to send tx");

    tx.send((journal, seal))
        .expect("failed to send over channel");
}

fn jwt_authentication_filter() -> impl Filter<Extract = ((),), Error = warp::Rejection> + Clone {
    warp::any()
        .and(warp::header::<String>(HEADER_XAUTH))
        .and_then(handle_jwt_authentication)
}

fn auth_filter() -> impl Filter<Extract = impl warp::Reply, Error = warp::Rejection> + Clone {
    let cors = warp::cors()
        .allow_any_origin()
        .allow_methods(vec!["GET", "POST", "DELETE"])
        .allow_headers(vec!["content-type", "x-auth-token"])
        .max_age(3600);

    warp::path("auth")
        .and(warp::get())
        .and(warp::path::end())
        .and(jwt_authentication_filter().untuple_one())
        .map(|| warp::reply())
        .with(cors)
}

#[tokio::main]
async fn main() {
    env_logger::init();

    let api = auth_filter();

    warp::serve(api).run(([127, 0, 0, 1], 8080)).await;
}
