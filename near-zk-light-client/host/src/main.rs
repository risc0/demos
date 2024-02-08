use methods::{LIGHT_CLIENT_ELF, LIGHT_CLIENT_ID};
use near_zk_types::{
    LightClientBlockLiteView, LightClientBlockView, PrevBlockContext, ValidatorStakeView,
};
use risc0_zkvm::{default_prover, ExecutorEnv, Receipt};
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
struct ExpectedParams {
    is_valid: bool,
}

#[derive(Debug, Deserialize, Serialize)]
struct Params {
    previous_block: LightClientBlockLiteView,
    current_bps: Vec<ValidatorStakeView>,
    new_block: LightClientBlockView,
}

#[derive(Debug, Deserialize, Serialize)]
struct TestCase {
    description: String,
    expected: ExpectedParams,
    params: Params,
}

fn main() -> anyhow::Result<()> {
    // Initialize tracing. In order to view logs, run `RUST_LOG=info cargo run`
    tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::filter::EnvFilter::from_default_env())
        .init();

    // NOTE: These test vectors come from https://github.com/austinabell/near-light-client-tests
    //       and are generated using mainnet data pulled from RPC.
    let contents = include_str!("../../test-vectors/mainnet-80000000-81000000.json");

    let test_cases: Vec<TestCase> = serde_json::from_str(&contents)?;
    let initial_block_params = &test_cases[0].params;
    let mut prev_context: PrevBlockContext = PrevBlockContext::Block {
        prev_block: initial_block_params.previous_block.clone(),
        current_bps: initial_block_params.current_bps.clone(),
    };
    let mut prev_proof: Option<Receipt> = None;

    for test_case in test_cases {
        println!("Test description: {}", test_case.description);
        let test_case = test_case.params;
        let borsh_buffer = borsh::to_vec(&(&LIGHT_CLIENT_ID, &prev_context, &test_case.new_block))?;

        let mut builder = ExecutorEnv::builder();
        if let Some(ref receipt) = prev_proof {
            // Verifying a proof recursively requires adding the previous proof as an assumption.
            builder.add_assumption(receipt.clone());
        }
        let env = builder.write_slice(&borsh_buffer).build()?;

        // Obtain the default prover.
        let prover = default_prover();

        // Produce a receipt by proving the specified ELF binary.
        let receipt = prover.prove(env, LIGHT_CLIENT_ELF)?;

        receipt.verify(LIGHT_CLIENT_ID)?;

        // Update the previous context to verify off the last proof.
        prev_context = PrevBlockContext::Proof {
            journal: receipt.journal.bytes.clone(),
        };
        prev_proof = Some(receipt);
    }

    Ok(())
}
