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

// This application demonstrates how to send an off-chain proof request
// to the Bonsai proving service and publish the received proofs directly
// to your deployed app contract.

use alloy_primitives::{bytes::Buf, U256};
use alloy_sol_types::{sol, SolInterface, SolValue};
use anyhow::{Context, Result};
use apps::{BonsaiProver, TxSender};
use clap::Parser;
use log::info;
use methods::IS_EVEN_ELF;
use std::{
    io::{prelude::*, BufReader},
    net::{TcpListener, TcpStream},
};
// `IEvenNumber` interface automatically generated via the alloy `sol!` macro.
sol! {
    interface IEvenNumber {
        function set(uint256 x, bytes32 post_state_digest, bytes calldata seal);
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

    /// The input to provide to the guest binary
    #[clap(short, long)]
    input: U256,
}

fn handle_connection(mut stream: TcpStream) {
    info!("Request made");
    let args = Args::parse();
    let buf_reader = BufReader::new(&mut stream);
    let request_line = buf_reader.lines().next().unwrap().unwrap();

    // Common headers for CORS
    let cors_headers = "Access-Control-Allow-Origin: *\r\nAccess-Control-Allow-Methods: GET, POST, OPTIONS\r\nAccess-Control-Allow-Headers: Content-Type, Authorization";

    if request_line == "GET / HTTP/1.1" {
        let input = args.input.abi_encode();
        let (journal, post_state_digest, seal) =
            BonsaiProver::prove(IS_EVEN_ELF, &input).expect("failed to prove on bonsai");

        info!("Finsihed Proving...");

        // Create a new `TxSender`.
        let tx_sender = TxSender::new(
            args.chain_id,
            &args.rpc_url,
            &args.eth_wallet_private_key,
            &args.contract,
        )
        .expect("failed to create tx sender");
        let x = U256::abi_decode(&journal, true)
            .context("decoding journal data")
            .expect("fauled to decode");

        // Encode the function call for `IEvenNumber.set(x)`.
        let calldata = IEvenNumber::IEvenNumberCalls::set(IEvenNumber::setCall {
            x,
            post_state_digest,
            seal,
        })
        .abi_encode();

        // Send the calldata to Ethereum.
        let runtime = tokio::runtime::Runtime::new().expect("failed to start new tokio runtime");
        runtime
            .block_on(tx_sender.send(calldata))
            .expect("failed to send tx");

        let status_line = "HTTP/1.1 200 OK";
        let contents = "hello, world!";
        let length = contents.len();

        let response = format!(
            "{status_line}\r\n{cors_headers}\r\nContent-Length: {length}\r\n\r\n{contents}"
        );

        stream.write_all(response.as_bytes()).unwrap();
    } else {
        // Include OPTIONS method handling for preflight requests
        if request_line.starts_with("OPTIONS ") {
            let status_line = "HTTP/1.1 204 No Content";
            let response = format!("{status_line}\r\n{cors_headers}\r\n\r\n");
            stream.write_all(response.as_bytes()).unwrap();
        } else {
            let status_line = "HTTP/1.1 404 NOT FOUND";
            let contents = "404 not found";
            let length = contents.len();

            let response = format!(
                "{status_line}\r\n{cors_headers}\r\nContent-Length: {length}\r\n\r\n{contents}"
            );

            stream.write_all(response.as_bytes()).unwrap();
        }
    }
}

fn main() -> Result<()> {
    env_logger::init();

    info!("Starting server...");
    let listener = TcpListener::bind("127.0.0.1:8080").expect("Could not bind to address");

    for stream in listener.incoming() {
        let stream = stream.expect("Failed to establish connection");
        handle_connection(stream);
    }

    Ok(())
}
