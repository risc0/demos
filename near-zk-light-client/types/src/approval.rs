use crate::CryptoHash;
use borsh::{BorshDeserialize, BorshSerialize};
use near_primitives_core::types::BlockHeight;

/// The part of the block approval that is different for endorsements and skips
#[derive(BorshSerialize, BorshDeserialize, serde::Serialize, Debug, Clone, PartialEq, Eq, Hash)]
pub enum ApprovalInner {
    Endorsement(CryptoHash),
    Skip(BlockHeight),
}

impl ApprovalInner {
    pub fn get_data_for_sig(&self, target_height: BlockHeight) -> Vec<u8> {
        [
            borsh::to_vec(self).unwrap().as_ref(),
            target_height.to_le_bytes().as_ref(),
        ]
        .concat()
    }
}
