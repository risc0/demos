use methods::{FACTORS_ELF, FACTORS_ID};
use risc0_zkvm::{default_prover, ExecutorEnv, ProverOpts};

fn main() -> anyhow::Result<()> {
    // Initialize tracing. In order to view logs, run `RUST_LOG=info cargo run`
    tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::filter::EnvFilter::from_default_env())
        .init();

    let env = ExecutorEnv::builder().write(&7u64)?.write(&9u64)?.build()?;

    // Obtain the default prover.
    let prover = default_prover();

    // Produce a receipt by proving the specified ELF binary.
    let receipt = prover
        .prove_with_opts(env, FACTORS_ELF, &ProverOpts::groth16())?
        .receipt;

    let journal = receipt.journal;
    let groth16_receipt = receipt.inner.groth16().unwrap();

    // Write receipt to a file as JSON
    let receipt_json = serde_json::to_string(&(groth16_receipt, journal))?;
    std::fs::write("../snark-receipt.json", receipt_json)?;

    // Write FACTORS_ID to a file as JSON
    let factors_id_json = serde_json::to_string(&FACTORS_ID)?;
    std::fs::write("../factors_id.json", factors_id_json)?;

    Ok(())
}
