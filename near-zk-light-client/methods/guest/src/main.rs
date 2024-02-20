#![no_main]

use near_zk_types::{
    ApprovalInner, CryptoHash, LightClientBlockLiteView, LightClientBlockView, PrevBlockContext,
    ValidatorStakeView,
};
use risc0_zkvm::guest::env;
use sha2::{Digest, Sha256};

risc0_zkvm::guest::entry!(main);

type CommitData = (
    [u32; 8],
    CryptoHash,
    LightClientBlockLiteView,
    Vec<ValidatorStakeView>,
);

fn main() {
    let mut reader = env::stdin();
    let (guest_id, prev_block_context, new_block): (
        [u32; 8],
        PrevBlockContext,
        LightClientBlockView,
    ) = borsh::from_reader(&mut reader).unwrap();

    let (first_block_hash, last_known_block, current_bps) = match prev_block_context {
        PrevBlockContext::Proof { journal } => {
            env::verify(guest_id, &journal).expect("Failed to verify recursive journal");
            let (prev_id, hash, last_known_block, current_bps): CommitData =
                borsh::from_slice(&journal).expect("Invalid journal format");
            assert_eq!(guest_id, prev_id, "Guest program IDs do not match");
            (hash, last_known_block, current_bps)
        }
        PrevBlockContext::Block {
            prev_block,
            current_bps,
        } => (prev_block.hash(), prev_block, current_bps),
    };

    // Numbers for each step references the spec:
    // https://github.com/near/NEPs/blob/c7d72138117ed0ab86629a27d1f84e9cce80848f/specs/ChainSpec/LightClient.md
    // (1) Verify that the block height is greater than the last known block.
    if new_block.inner_lite.height <= last_known_block.inner_lite.height {
        panic!("New block must be at least the height of the last known block");
    }

    // (2) Verify that the new block is in the same epoch or in the next epoch known to the last
    // known block.
    if new_block.inner_lite.epoch_id != last_known_block.inner_lite.epoch_id
        && new_block.inner_lite.epoch_id != last_known_block.inner_lite.next_epoch_id
    {
        panic!("New block must either be in the same epoch or the next epoch from the last known block");
    }

    let mut block_producers: Vec<ValidatorStakeView> = current_bps;
    if new_block.approvals_after_next.len() < block_producers.len() {
        panic!("Number of approvals for next epoch must be at least the number of current block producers");
    }

    // (4) and (5)
    // (4) `approvals_after_next` contains valid signatures on the block producer approval messages.
    // (5) The signatures present represent more than 2/3 of the total stake.
    let mut total_stake: u128 = 0;
    let mut approved_stake: u128 = 0;
    let approval_height = new_block.inner_lite.height + 2;

    let new_block_lite = LightClientBlockLiteView {
        inner_lite: new_block.inner_lite,
        prev_block_hash: new_block.prev_block_hash,
        inner_rest_hash: new_block.inner_rest_hash,
    };
    let current_block_hash = new_block_lite.hash();

    let mut block_hasher = Sha256::new();
    block_hasher.update(&new_block.next_block_inner_hash);
    block_hasher.update(&current_block_hash);
    let next_block_hash = block_hasher.finalize();

    for (approval, block_producer) in new_block
        .approvals_after_next
        .into_iter()
        .zip(block_producers.iter())
    {
        let block_producer = match block_producer {
            ValidatorStakeView::V1(block_producer) => block_producer,
        };
        let stake = block_producer.stake;

        total_stake = total_stake
            .checked_add(stake)
            .expect("total stake overflow");

        let Some(signature) = approval else {
            continue;
        };

        approved_stake = approved_stake
            .checked_add(stake)
            .expect("approved stake overflow");

        let approval_message = &ApprovalInner::Endorsement(CryptoHash(
            next_block_hash
                .as_slice()
                .try_into()
                .expect("Invalid hash length"),
        ))
        .get_data_for_sig(approval_height);

        if !signature.verify(&approval_message, &block_producer.public_key) {
            panic!(
                "Invalid approval message signature for validator {}",
                block_producer.account_id
            );
        }
    }

    // (5) Calculates the 2/3 threshold and checks that the approved stake accumulated above
    // exceeds it.
    let threshold = total_stake.checked_mul(2).expect("total stake overflow") / 3;
    if approved_stake <= threshold {
        panic!("Approved stake does not exceed the 2/3 threshold");
    }

    // (6) Verify that if the new block is in the next epoch, the hash of the next block producers
    // equals the `next_bp_hash` provided in that block.
    if new_block_lite.inner_lite.epoch_id == last_known_block.inner_lite.next_epoch_id {
        // (3) If the block is in a new epoch, then `next_bps` must be present.
        let Some(next_bps) = new_block.next_bps else {
            panic!("New block must include next block producers if a new epoch starts");
        };

        let bps_hash = CryptoHash::hash_borsh_iter(next_bps.iter());

        assert_eq!(
            bps_hash, new_block_lite.inner_lite.next_bp_hash,
            "Next block producers hash doesn't match"
        );

        // Update block producers to be committed.
        block_producers = next_bps;
    }

    borsh::to_writer(
        &mut env::journal(),
        &(
            // Note: guest_id shouldn't be needed if only verifying one block. Handling optional
            // values in practice would unnecessarily complicate things.
            // TODO double check not having guest id be optional is correct.
            &guest_id,
            &first_block_hash,
            &new_block_lite,
            &block_producers,
        ),
    )
    .unwrap();
}
