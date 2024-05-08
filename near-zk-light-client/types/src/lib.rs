//! Duplicated types from `near/nearcore` repo. There are dependencies pulled in with the primitives
//! crate that are incompatible with risc0 1.69 toolchain.

mod approval;
mod crypto;
mod hash;
mod merkle;
mod serde_dec;
mod validator_stake;

pub use approval::ApprovalInner;
use crypto::Signature;
pub use hash::CryptoHash;
pub use merkle::{Direction, MerkleHash, MerklePathItem};
use near_primitives_core::types::{AccountId, Balance, Gas};
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

/// Data committed from the zkVM in a light client block verification.
#[derive(Debug, Clone, BorshDeserialize, BorshSerialize)]
pub struct BlockCommitData {
    pub block_guest_id: [u32; 8],
    pub first_block_hash: CryptoHash,
    pub new_block_lite: LightClientBlockLiteView,
    pub block_producers: Vec<ValidatorStakeView>,
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

#[derive(Debug, BorshDeserialize, BorshSerialize)]
pub struct RpcLightClientExecutionProofResponse {
    pub outcome_proof: ExecutionOutcomeWithIdView,
    pub outcome_root_proof: MerklePath,
    pub block_header_lite: LightClientBlockLiteView,
    pub block_proof: MerklePath,
}

#[cfg_attr(feature = "deepsize_feature", derive(deepsize::DeepSizeOf))]
#[derive(BorshSerialize, BorshDeserialize, Debug, PartialEq, Eq, Clone)]
pub struct ExecutionOutcomeWithIdView {
    pub proof: MerklePath,
    pub block_hash: CryptoHash,
    pub id: CryptoHash,
    pub outcome: ExecutionOutcomeView,
}

impl ExecutionOutcomeWithIdView {
    pub fn to_hashes(&self) -> Vec<CryptoHash> {
        self.outcome.to_hashes(self.id)
    }
}

pub type MerklePath = Vec<MerklePathItem>;

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone, PartialEq, Eq)]
pub struct ExecutionOutcomeView {
    /// Logs from this transaction or receipt.
    pub logs: Vec<String>,
    /// Receipt IDs generated by this transaction or receipt.
    pub receipt_ids: Vec<CryptoHash>,
    /// The amount of the gas burnt by the given transaction or receipt.
    pub gas_burnt: Gas,
    /// The amount of tokens burnt corresponding to the burnt gas amount.
    /// This value doesn't always equal to the `gas_burnt` multiplied by the gas price, because
    /// the prepaid gas price might be lower than the actual gas price and it creates a deficit.
    pub tokens_burnt: Balance,
    /// The id of the account on which the execution happens. For transaction this is signer_id,
    /// for receipt this is receiver_id.
    pub executor_id: AccountId,
    /// Execution status. Contains the result in case of successful execution.
    pub status: ExecutionStatusView,
    /// Execution metadata, versioned
    pub metadata: ExecutionMetadataView,
}

impl ExecutionOutcomeView {
    // Same behavior as ExecutionOutcomeWithId's to_hashes.
    pub fn to_hashes(&self, id: CryptoHash) -> Vec<CryptoHash> {
        let mut result = Vec::with_capacity(self.logs.len().saturating_add(2));
        result.push(id);
        result.push(CryptoHash::hash_borsh(&PartialExecutionOutcome::from(self)));
        result.extend(
            self.logs
                .iter()
                .map(|log| CryptoHash::hash_bytes(log.as_bytes())),
        );
        result
    }
}

/// ExecutionOutcome for proof. Excludes logs and metadata
#[derive(BorshSerialize, BorshDeserialize, PartialEq, Clone)]
pub struct PartialExecutionOutcome {
    pub receipt_ids: Vec<CryptoHash>,
    pub gas_burnt: Gas,
    pub tokens_burnt: Balance,
    pub executor_id: AccountId,
    pub status: PartialExecutionStatus,
}

impl From<&ExecutionOutcomeView> for PartialExecutionOutcome {
    fn from(outcome: &ExecutionOutcomeView) -> Self {
        Self {
            receipt_ids: outcome.receipt_ids.clone(),
            gas_burnt: outcome.gas_burnt,
            tokens_burnt: outcome.tokens_burnt,
            executor_id: outcome.executor_id.clone(),
            status: outcome.status.clone().into(),
        }
    }
}

impl From<ExecutionStatusView> for PartialExecutionStatus {
    fn from(status: ExecutionStatusView) -> PartialExecutionStatus {
        match status {
            ExecutionStatusView::Unknown => PartialExecutionStatus::Unknown,
            ExecutionStatusView::Failure(_) => PartialExecutionStatus::Failure,
            ExecutionStatusView::SuccessValue(value) => PartialExecutionStatus::SuccessValue(value),
            ExecutionStatusView::SuccessReceiptId(id) => {
                PartialExecutionStatus::SuccessReceiptId(id)
            }
        }
    }
}

/// ExecutionStatus for proof. Excludes failure debug info.
#[derive(BorshSerialize, BorshDeserialize, PartialEq, Clone)]
pub enum PartialExecutionStatus {
    Unknown,
    Failure,
    SuccessValue(Vec<u8>),
    SuccessReceiptId(CryptoHash),
}

#[derive(Debug, BorshSerialize, BorshDeserialize, PartialEq, Eq, Clone)]
pub enum ExecutionStatusView {
    /// The execution is pending or unknown.
    Unknown,
    /// The execution has failed.
    Failure(String),
    /// The final action succeeded and returned some value or an empty vec encoded in base64.
    SuccessValue(Vec<u8>),
    /// The final action of the receipt returned a promise or the signed transaction was converted
    /// to a receipt. Contains the receipt_id of the generated receipt.
    SuccessReceiptId(CryptoHash),
}

#[derive(
    BorshSerialize,
    BorshDeserialize,
    PartialEq,
    Clone,
    Eq,
    Debug,
    serde::Serialize,
    serde::Deserialize,
)]
pub struct ExecutionMetadataView {
    pub version: u32,
    pub gas_profile: Option<Vec<CostGasUsed>>,
}

#[derive(
    BorshSerialize,
    BorshDeserialize,
    PartialEq,
    Clone,
    Eq,
    Debug,
    serde::Serialize,
    serde::Deserialize,
)]
pub struct CostGasUsed {
    pub cost_category: String,
    pub cost: String,
    #[serde(with = "serde_dec")]
    pub gas_used: Gas,
}
