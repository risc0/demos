use alloy_consensus::Header;
use alloy_primitives::Bytes;
use alloy_rlp::Decodable;
use alloy_trie::Nibbles;
use arrayvec::ArrayVec;
use risc0_zkvm::guest::env;

fn main() {
    // Read the program inputs through a framed slice of bytes
    let mut len: u32 = 0;
    env::read_slice(core::slice::from_mut(&mut len));
    let mut bytes = vec![0u8; len as usize];
    env::read_slice(&mut bytes);

    let (encoded_header, encoded_index, proof_tx, proof_nodes): (
        Vec<u8>,
        ArrayVec<u8, 9>,
        Vec<u8>,
        Vec<Bytes>,
    ) = postcard::from_bytes(&bytes).expect("failed to deserialize input");

    // Note: this is a bit of a hack to input rlp encoded bytes, but alloy header serialization is
    // broken for non-self describing serialization protocols.
    let header: Header = Header::decode(&mut &encoded_header[..]).unwrap();

    let block_hash = header.hash_slow();

    alloy_trie::proof::verify_proof(
        header.transactions_root,
        Nibbles::unpack(&encoded_index),
        Some(proof_tx.clone()),
        proof_nodes.iter(),
    )
    .unwrap();

    // Commit that the encoded transaction is included in the block.
    env::commit(&(block_hash, proof_tx));
}
