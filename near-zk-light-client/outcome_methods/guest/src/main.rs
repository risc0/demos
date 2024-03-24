use methods::LIGHT_CLIENT_ID;
use near_zk_types::{
    combine_hash, BlockCommitData, CryptoHash, Direction, MerkleHash, MerklePathItem,
    RpcLightClientExecutionProofResponse,
};
use risc0_zkvm::guest::env;

fn inclusion_proof_verify(
    head_block_root: CryptoHash,
    proof: &RpcLightClientExecutionProofResponse,
) -> bool {
    let block_hash = proof.block_header_lite.hash();
    let block_hash_matches = block_hash == proof.outcome_proof.block_hash;

    let outcome_hash = CryptoHash::hash_borsh(proof.outcome_proof.to_hashes());

    let outcome_verified = verify_outcome(
        &outcome_hash,
        proof.outcome_proof.proof.iter(),
        proof.outcome_root_proof.iter(),
        &proof.block_header_lite.inner_lite.outcome_root,
    );

    let block_verified = verify_block(&head_block_root, proof.block_proof.iter(), &block_hash);

    block_hash_matches && outcome_verified && block_verified
}
pub fn verify_outcome<'a>(
    outcome_hash: &CryptoHash,
    outcome_proof: impl Iterator<Item = &'a MerklePathItem>,
    outcome_root_proof: impl Iterator<Item = &'a MerklePathItem>,
    expected_outcome_root: &CryptoHash,
) -> bool {
    let outcome_root = compute_root_from_path(outcome_proof, *outcome_hash);

    let leaf = CryptoHash::hash_borsh(outcome_root);

    let outcome_root = compute_root_from_path(outcome_root_proof, leaf);

    &outcome_root == expected_outcome_root
}

fn compute_root_from_path<'a>(
    path: impl Iterator<Item = &'a MerklePathItem>,
    item_hash: MerkleHash,
) -> MerkleHash {
    let mut hash_so_far = item_hash;
    for uncle in path {
        match uncle.direction {
            Direction::Left => {
                hash_so_far = combine_hash(&uncle.hash, &hash_so_far);
            }
            Direction::Right => {
                hash_so_far = combine_hash(&hash_so_far, &uncle.hash);
            }
        }
    }
    hash_so_far
}

fn verify_block<'a>(
    block_merkle_root: &CryptoHash,
    block_proof: impl Iterator<Item = &'a MerklePathItem>,
    block_hash: &CryptoHash,
) -> bool {
    verify_hash(*block_merkle_root, block_proof, *block_hash)
}

fn verify_hash<'a>(
    root: MerkleHash,
    path: impl Iterator<Item = &'a MerklePathItem>,
    item_hash: MerkleHash,
) -> bool {
    compute_root_from_path(path, item_hash) == root
}

fn main() {
    let mut reader = env::stdin();
    let (block_proof_journal, proof): (Vec<u8>, RpcLightClientExecutionProofResponse) =
        borsh::from_reader(&mut reader).unwrap();

    env::verify(LIGHT_CLIENT_ID, &block_proof_journal).expect("Failed to verify recursive journal");
    let BlockCommitData {
        block_guest_id,
        new_block_lite,
        ..
    } = borsh::from_slice(&block_proof_journal).expect("Invalid journal format");
    assert_eq!(
        LIGHT_CLIENT_ID, block_guest_id,
        "Block guest ID from recursive proof does not match expected"
    );

    let block_hash = new_block_lite.hash();
    assert!(
        inclusion_proof_verify(block_hash, &proof),
        "Invalid inclusion proof"
    );

    // Commit the tx hash and transaction outcome
    let commit_data = (
        block_hash,
        // TODO maybe commit the first block hash as well?
        proof.outcome_proof.id,
        proof.outcome_proof.outcome,
    );
    borsh::to_writer(&mut env::journal(), &commit_data).unwrap();
}
