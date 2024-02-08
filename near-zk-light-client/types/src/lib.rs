//! Duplicated types from `near/nearcore` repo. There are dependencies pulled in with the primitives
//! crate that are incompatible with risc0 1.69 toolchain.

mod approval;
mod crypto;
mod hash;
mod serde_dec;
mod validator_stake;

pub use approval::ApprovalInner;
use crypto::Signature;
pub use hash::CryptoHash;
pub use validator_stake::ValidatorStakeView;

use borsh::{BorshDeserialize, BorshSerialize};

#[derive(Debug, BorshDeserialize, BorshSerialize)]
pub enum PrevBlockContext {
    Proof {
        journal: Vec<u8>,
    },
    Block {
        prev_block: LightClientBlockLiteView,
        current_bps: Vec<ValidatorStakeView>,
    },
}

/// Height of the block.
pub type BlockHeight = u64;

/// Epoch identifier -- wrapped hash, to make it easier to distinguish.
/// EpochId of epoch T is the hash of last block in T-2
/// EpochId of first two epochs is 0
#[derive(
    Debug,
    Clone,
    Default,
    Hash,
    Eq,
    PartialEq,
    PartialOrd,
    Ord,
    derive_more::AsRef,
    BorshSerialize,
    BorshDeserialize,
    serde::Serialize,
    serde::Deserialize,
)]
#[as_ref(forward)]
pub struct EpochId(pub CryptoHash);

pub fn combine_hash(hash1: &CryptoHash, hash2: &CryptoHash) -> CryptoHash {
    CryptoHash::hash_borsh((hash1, hash2))
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone, BorshDeserialize, BorshSerialize)]
pub struct LightClientBlockLiteView {
    pub prev_block_hash: CryptoHash,
    pub inner_rest_hash: CryptoHash,
    pub inner_lite: BlockHeaderInnerLiteView,
}

impl LightClientBlockLiteView {
    pub fn hash(&self) -> CryptoHash {
        let block_header_inner_lite: BlockHeaderInnerLite = self.inner_lite.clone().into();
        combine_hash(
            &combine_hash(
                &CryptoHash::hash_bytes(&borsh::to_vec(&block_header_inner_lite).unwrap()),
                &self.inner_rest_hash,
            ),
            &self.prev_block_hash,
        )
    }
}

#[derive(
    PartialEq,
    Eq,
    Debug,
    Clone,
    BorshDeserialize,
    BorshSerialize,
    serde::Serialize,
    serde::Deserialize,
)]
pub struct BlockHeaderInnerLiteView {
    pub height: BlockHeight,
    pub epoch_id: CryptoHash,
    pub next_epoch_id: CryptoHash,
    pub prev_state_root: CryptoHash,
    pub outcome_root: CryptoHash,
    /// Legacy json number. Should not be used.
    pub timestamp: u64,
    #[serde(with = "serde_dec")]
    pub timestamp_nanosec: u64,
    pub next_bp_hash: CryptoHash,
    pub block_merkle_root: CryptoHash,
}

impl From<BlockHeaderInnerLiteView> for BlockHeaderInnerLite {
    fn from(view: BlockHeaderInnerLiteView) -> Self {
        BlockHeaderInnerLite {
            height: view.height,
            epoch_id: EpochId(view.epoch_id),
            next_epoch_id: EpochId(view.next_epoch_id),
            prev_state_root: view.prev_state_root,
            prev_outcome_root: view.outcome_root,
            timestamp: view.timestamp_nanosec,
            next_bp_hash: view.next_bp_hash,
            block_merkle_root: view.block_merkle_root,
        }
    }
}

#[derive(BorshSerialize, BorshDeserialize, serde::Serialize, Debug, Clone, Eq, PartialEq)]
pub struct BlockHeaderInnerLite {
    /// Height of this block.
    pub height: BlockHeight,
    /// Epoch start hash of this block's epoch.
    /// Used for retrieving validator information
    pub epoch_id: EpochId,
    pub next_epoch_id: EpochId,
    /// Root hash of the state at the previous block.
    pub prev_state_root: CryptoHash,
    /// Root of the outcomes of transactions and receipts from the previous chunks.
    pub prev_outcome_root: CryptoHash,
    /// Timestamp at which the block was built (number of non-leap-nanoseconds since January 1, 1970 0:00:00 UTC).
    pub timestamp: u64,
    /// Hash of the next epoch block producers set
    pub next_bp_hash: CryptoHash,
    /// Merkle root of block hashes up to the current block.
    pub block_merkle_root: CryptoHash,
}

#[derive(
    PartialEq,
    Eq,
    Debug,
    Clone,
    BorshDeserialize,
    BorshSerialize,
    serde::Serialize,
    serde::Deserialize,
)]
pub struct LightClientBlockView {
    pub prev_block_hash: CryptoHash,
    pub next_block_inner_hash: CryptoHash,
    pub inner_lite: BlockHeaderInnerLiteView,
    pub inner_rest_hash: CryptoHash,
    pub next_bps: Option<Vec<ValidatorStakeView>>,
    pub approvals_after_next: Vec<Option<Box<Signature>>>,
}
