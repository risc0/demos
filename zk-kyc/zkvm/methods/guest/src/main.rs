#![no_main]
use std::str::FromStr;

use alloy_primitives::{Address, Bytes, U256};
use alloy_sol_types::SolType;
use oidc_validator::IdentityProvider;
use risc0_zkvm::guest::env;
use risc0_zkvm::sha::rust_crypto::{Digest as _, Sha256};

risc0_zkvm::guest::entry!(main);

alloy_sol_types::sol! {
    struct ClaimsData {
        uint256 exp;
        uint256 iat;
        address addr;
    }
}

pub fn main() {
    let (provider, jwt): (IdentityProvider, String) = env::read();
    let public_output = provider.validate(&jwt).unwrap();

    let output = ClaimsData {
        exp: U256::from(public_output.exp),
        iat: U256::from(public_output.iat),
        addr: Address::from_str(&public_output.nonce).unwrap(),
    };

    let output = ClaimsData::abi_encode_sequence(&output);

    env::commit_slice(&output);
}
