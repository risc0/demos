use super::crypto::PublicKey;
use super::serde_dec;
use borsh::{BorshDeserialize, BorshSerialize};
use near_primitives_core::types::{AccountId, Balance};
use serde::Deserialize;

#[derive(
    BorshSerialize, BorshDeserialize, serde::Serialize, Deserialize, Debug, Clone, Eq, PartialEq,
)]
#[serde(tag = "validator_stake_struct_version")]
pub enum ValidatorStakeView {
    V1(ValidatorStakeViewV1),
}

#[derive(
    BorshSerialize,
    BorshDeserialize,
    Debug,
    Clone,
    Eq,
    PartialEq,
    serde::Serialize,
    serde::Deserialize,
)]
pub struct ValidatorStakeViewV1 {
    pub account_id: AccountId,
    pub public_key: PublicKey,
    #[serde(with = "serde_dec")]
    pub stake: Balance,
}
