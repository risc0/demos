use ::bonsai_sdk::alpha::responses::SnarkReceipt;
use methods::{FACTORS_ELF, FACTORS_ID};
// use risc0_zkvm::{default_prover, ExecutorEnv};
use anyhow::Result;
use bonsai_sdk::alpha as bonsai_sdk;
use risc0_zkvm::{compute_image_id, serde::to_vec, CompactReceipt, InnerReceipt, Receipt};
use std::time::Duration;

fn run_stark2snark(session_id: String) -> Result<SnarkReceipt> {
    let client = bonsai_sdk::Client::from_env(risc0_zkvm::VERSION)?;

    let snark_session = client.create_snark(session_id)?;
    eprintln!("Created snark session: {}", snark_session.uuid);
    loop {
        let res = snark_session.status(&client)?;
        match res.status.as_str() {
            "RUNNING" => {
                eprintln!("Current status: {} - continue polling...", res.status,);
                std::thread::sleep(Duration::from_secs(8));
                continue;
            }
            "SUCCEEDED" => {
                let snark_receipt = res.output.unwrap();
                eprintln!("Snark proof!: {snark_receipt:?}");

                return Ok(snark_receipt);
            }
            _ => {
                panic!(
                    "Workflow exited: {} err: {}",
                    res.status,
                    res.error_msg.unwrap_or_default()
                );
            }
        }
    }
}

fn run_bonsai() -> Result<()> {
    let client = bonsai_sdk::Client::from_env(risc0_zkvm::VERSION)?;

    // Compute the image_id, then upload the ELF with the image_id as its key.
    let image_id = hex::encode(compute_image_id(FACTORS_ELF)?);
    client.upload_img(&image_id, FACTORS_ELF.to_vec())?;

    // Prepare input data and upload it.
    let input_data = to_vec(&(7u64, 9u64))?;
    let input_data = bytemuck::cast_slice(&input_data).to_vec();
    let input_id = client.upload_input(input_data)?;

    // Add a list of assumptions
    let assumptions: Vec<String> = vec![];

    // Start a session running the prover
    let session = client.create_session(image_id, input_id, assumptions)?;
    let receipt = loop {
        let res = session.status(&client)?;
        if res.status == "RUNNING" {
            eprintln!(
                "Current status: {} - state: {} - continue polling...",
                res.status,
                res.state.unwrap_or_default()
            );
            std::thread::sleep(Duration::from_secs(5));
            continue;
        } else if res.status == "SUCCEEDED" {
            // Download the receipt, containing the output
            let receipt_url = res
                .receipt_url
                .expect("API error, missing receipt on completed session");

            let receipt_buf = client.download(&receipt_url)?;
            let receipt: Receipt = bincode::deserialize(&receipt_buf)?;
            receipt
                .verify(FACTORS_ID)
                .expect("Receipt verification failed");
            break receipt;
        } else {
            panic!(
                "Workflow exited: {} - | err: {}",
                res.status,
                res.error_msg.unwrap_or_default()
            );
        }
    };

    // Optionally run stark2snark
    let snark = run_stark2snark(session.uuid)?;
    let snark_receipt = Receipt::new(
        InnerReceipt::Compact(CompactReceipt {
            seal: snark.snark.to_vec(),
            // TODO this feels very weird to have to do this
            claim: receipt.get_claim()?,
        }),
        snark.journal,
    );

    // Preflight verify just to make sure everything is correct
    snark_receipt.verify(FACTORS_ID)?;

    // Write receipt to a file as JSON
    let receipt_json = serde_json::to_string(&receipt)?;
    std::fs::write("../stark-receipt.json", receipt_json)?;

    // Write stark receipt to a file as JSON
    let receipt_json = serde_json::to_string(&snark_receipt)?;
    std::fs::write("../snark-receipt.json", receipt_json)?;

    // Write FACTORS_ID to a file as JSON
    let factors_id_json = serde_json::to_string(&FACTORS_ID)?;
    std::fs::write("../factors_id.json", factors_id_json)?;

    Ok(())
}

fn main() -> anyhow::Result<()> {
    // Initialize tracing. In order to view logs, run `RUST_LOG=info cargo run`
    tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::filter::EnvFilter::from_default_env())
        .init();

    run_bonsai()?;

    Ok(())
}
