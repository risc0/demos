use borsh::{BorshDeserialize, BorshSerialize};
use methods::{LIGHT_CLIENT_ELF, LIGHT_CLIENT_ID};
use near_jsonrpc_client::{methods as rpc_methods, JsonRpcClient};
use near_jsonrpc_primitives::types::chunks::ChunkReference;
use near_primitives::types::{BlockId, BlockReference, Finality};
use near_zk_types::{
    BlockCommitData, LightClientBlockLiteView, LightClientBlockView, PrevBlockContext,
    ValidatorStakeView,
};
use outcome_methods::{OUTCOME_ELF, OUTCOME_ID};
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

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize tracing. In order to view logs, run `RUST_LOG=info cargo run`
    tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::filter::EnvFilter::from_default_env())
        .init();
    let client = JsonRpcClient::connect("https://rpc.mainnet.near.org");

    // Get the current block (just to get current height, maybe a better way to do this?)
    let cur_block = client
        .call(rpc_methods::block::RpcBlockRequest {
            block_reference: BlockReference::Finality(Finality::Final),
        })
        .await?;

    // Get protocol config to retrieve epoch length.
    let protocol_config = client
        .call(
            rpc_methods::EXPERIMENTAL_protocol_config::RpcProtocolConfigRequest {
                block_reference: BlockReference::Finality(Finality::Final),
            },
        )
        .await?;

    // Pick a start height from 2 epochs back, with some buffer for the latency of requests.
    let start_height = cur_block.header.height - (protocol_config.epoch_length * 3) - 7;

    // Get a block from a previous epoch (really just need the hash, but this is what the rpc has).
    let start_block = client
        .call(rpc_methods::block::RpcBlockRequest {
            block_reference: BlockReference::BlockId(BlockId::Height(start_height)),
        })
        .await?;

    let light_client_block = client
        .call(
            rpc_methods::next_light_client_block::RpcLightClientNextBlockRequest {
                last_block_hash: start_block.header.hash,
            },
        )
        .await?
        .expect("No valid light client block at this epoch");

    let current_bps = round_trip_borsh(
        light_client_block
            .next_bps
            .expect("light client block from previous epoch should have next_bps"),
    )?;

    let mut prev_context = PrevBlockContext::Block {
        prev_block: LightClientBlockLiteView {
            inner_lite: round_trip_borsh(light_client_block.inner_lite)?,
            prev_block_hash: round_trip_borsh(light_client_block.prev_block_hash)?,
            inner_rest_hash: round_trip_borsh(light_client_block.inner_rest_hash)?,
        },
        current_bps,
    };

    // Obtain the default prover.
    let prover = default_prover();

    // Verify a few recent light client blocks.
    let mut prev_proof: Option<Receipt> = None;
    let mut last_block_hash = light_client_block.prev_block_hash;
    for _ in 0..2 {
        let block = client
            .call(
                rpc_methods::next_light_client_block::RpcLightClientNextBlockRequest {
                    last_block_hash,
                },
            )
            .await?
            .expect("should retrieve light client blocks for past epochs");
        println!(
            "proving block at height {}, epoch {}",
            block.inner_lite.height, block.inner_lite.epoch_id
        );
        let mut builder = ExecutorEnv::builder();
        if let Some(ref receipt) = prev_proof {
            // Verifying a proof recursively requires adding the previous proof as an assumption.
            builder.add_assumption(receipt.clone());
        }

        let borsh_buffer = borsh::to_vec(&(&LIGHT_CLIENT_ID, &prev_context, &block))?;
        let env = builder.write_slice(&borsh_buffer).build()?;

        // Produce a receipt by proving the specified ELF binary.
        let receipt = prover.prove(env, LIGHT_CLIENT_ELF)?;

        receipt.verify(LIGHT_CLIENT_ID)?;

        let block_commit_data: BlockCommitData = borsh::from_slice(&receipt.journal.bytes)?;

        // Update the previous context to verify off the last proof.
        prev_context = PrevBlockContext::Proof {
            journal: receipt.journal.bytes.clone(),
        };
        prev_proof = Some(receipt);
        last_block_hash =
            near_primitives::hash::CryptoHash(block_commit_data.new_block_lite.hash().0);
    }

    // Retrieve some transactions in the latest block to prove.
    let chunk_id = cur_block.chunks.first().unwrap().chunk_hash;
    let chunk = client
        .call(rpc_methods::chunk::RpcChunkRequest {
            chunk_reference: ChunkReference::ChunkHash { chunk_id },
        })
        .await?;

    let prev_proof = prev_proof.unwrap();

    for transaction in chunk.transactions.into_iter().take(3) {
        println!("proving {:?}", transaction);
        // Get execution proof outcome.
        let rpc_outcome = client
            .call(
                rpc_methods::light_client_proof::RpcLightClientExecutionProofRequest {
                    id: near_primitives::types::TransactionOrReceiptId::Transaction {
                        transaction_hash: transaction.hash,
                        sender_id: transaction.signer_id,
                    },
                    light_client_head: last_block_hash,
                },
            )
            .await?;

        let outcome_proof = near_zk_types::RpcLightClientExecutionProofResponse {
            outcome_proof: round_trip_borsh(rpc_outcome.outcome_proof)?,
            outcome_root_proof: round_trip_borsh(rpc_outcome.outcome_root_proof)?,
            block_header_lite: round_trip_borsh(rpc_outcome.block_header_lite)?,
            block_proof: round_trip_borsh(rpc_outcome.block_proof)?,
        };

        // Verify proof, composing with light client proof
        let mut builder = ExecutorEnv::builder();

        // Add light client proof as assumption.
        builder.add_assumption(prev_proof.clone());

        let borsh_buffer = borsh::to_vec(&(&prev_proof.journal.bytes, &outcome_proof))?;
        let env = builder.write_slice(&borsh_buffer).build()?;

        // Produce a receipt by proving the specified ELF binary.
        let receipt = prover.prove(env, OUTCOME_ELF)?;

        receipt.verify(OUTCOME_ID)?;
    }

    Ok(())
}

// Conversions simply because near primitives types had bloat that could not be compiled in the
// zkvm. Just round trip serializing for dev expedience, not necessary.
// TODO get rid of this
fn round_trip_borsh<R>(origin: impl BorshSerialize) -> anyhow::Result<R>
where
    R: BorshDeserialize,
{
    let serialized = borsh::to_vec(&origin)?;
    Ok(borsh::from_slice(&serialized)?)
}
