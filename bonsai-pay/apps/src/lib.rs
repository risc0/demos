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

// The following library provides utility functions to help with sending
// off-chain proof requests to the Bonsai proving service and publish the
// received proofs directly to a deployed app contract on Ethereum.
//
// Please note that both `risc0_zkvm` and `bonsai_sdk` crates are still
// under active development. As such, this library might change to adapt to
// the upstream changes.

use std::time::Duration;

use alloy_primitives::FixedBytes;
use anyhow::{Context, Result};
use ethers::prelude::*;
use reqwest::Request;
use risc0_ethereum_contracts::groth16::abi_encode;
use risc0_zkvm::{compute_image_id, default_prover, ExecutorEnv, Receipt};

pub struct TxSender {
    chain_id: u64,
    client: SignerMiddleware<Provider<Http>, Wallet<k256::ecdsa::SigningKey>>,
    contract: Address,
}

impl TxSender {
    /// Creates a new `TxSender`.
    pub fn new(chain_id: u64, rpc_url: &str, private_key: &str, contract: &str) -> Result<Self> {
        let provider = Provider::<Http>::try_from(rpc_url)?;
        let wallet: LocalWallet = private_key.parse::<LocalWallet>()?.with_chain_id(chain_id);
        let client = SignerMiddleware::new(provider.clone(), wallet.clone());
        let contract = contract.parse::<Address>()?;

        Ok(TxSender {
            chain_id,
            client,
            contract,
        })
    }

    /// Send a transaction with the given calldata.
    pub async fn send(&self, calldata: Vec<u8>) -> Result<Option<TransactionReceipt>> {
        let tx = TransactionRequest::new()
            .chain_id(self.chain_id)
            .to(self.contract)
            .from(self.client.address())
            .data(calldata);

        log::info!("Transaction request: {:?}", &tx);

        let tx = self.client.send_transaction(tx, None).await?.await?;

        log::info!("Transaction receipt: {:?}", &tx);

        Ok(tx)
    }
}

pub struct BonsaiProver {}
impl BonsaiProver {
    pub fn prove(elf: &[u8], input: &[u8]) -> Result<(Vec<u8>, Vec<u8>)> {
        let client = bonsai_sdk::blocking::Client::from_env(risc0_zkvm::VERSION)?;

        let image_id = compute_image_id(elf)?;
        let image_id_hex = image_id.to_string();
        client.upload_img(&image_id_hex, elf.to_vec())?;
        log::info!("Image ID: 0x{}", image_id_hex);

        let input_id = client.upload_input(input.to_vec())?;

        // Start a session running the prover.
        let session = client.create_session(image_id_hex, input_id, vec![], false)?;
        log::info!("Created session: {}", session.uuid);
        let _receipt = loop {
            let res = session.status(&client)?;
            if res.status == "RUNNING" {
                log::info!(
                    "Current status: {} - state: {} - continue polling...",
                    res.status,
                    res.state.unwrap_or_default()
                );
                std::thread::sleep(Duration::from_secs(15));
                continue;
            }
            if res.status == "SUCCEEDED" {
                // Download the receipt, containing the output.
                let receipt_url = res
                    .receipt_url
                    .context("API error, missing receipt on completed session")?;

                let receipt_buf = client.download(&receipt_url)?;
                let receipt: Receipt = bincode::deserialize(&receipt_buf)?;

                break receipt;
            }

            panic!(
                "Workflow exited: {} - | err: {}",
                res.status,
                res.error_msg.unwrap_or_default()
            );
        };

        // Fetch the snark.
        let snark_session = client.create_snark(session.uuid)?;
        log::info!("Created snark session: {}", snark_session.uuid);
        let snark_receipt = loop {
            let res = snark_session.status(&client)?;
            match res.status.as_str() {
                "RUNNING" => {
                    log::info!("Current status: {} - continue polling...", res.status,);
                    std::thread::sleep(Duration::from_secs(15));
                    continue;
                }
                "SUCCEEDED" => {
                    break res.output.context("No snark generated :(")?;
                }
                _ => {
                    panic!(
                        "Workflow exited: {} err: {}",
                        res.status,
                        res.error_msg.unwrap_or_default()
                    );
                }
            }
        };

        let snark_url = snark_receipt;
        log::debug!("Snark url!: {snark_url:?}");

        let receipt = reqwest::blocking::get(snark_url)?;

        let receipt: Receipt = bincode::deserialize(&receipt.bytes()?)?;

        println!("receipt: {:?}", receipt);

        let seal = &receipt.inner.groth16().unwrap().seal;

        let abi_encoded_seal = abi_encode(seal.to_vec()).unwrap();

        let journal = receipt.journal.bytes;

        Ok((journal, abi_encoded_seal))
    }
}
