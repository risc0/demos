#![no_main]
use std::str::FromStr;

use alloy_primitives::Address;
use alloy_sol_types::SolType;
use oidc_validator::IdentityProvider;
use risc0_zkvm::guest::env;
use risc0_zkvm::sha::rust_crypto::{Digest as _, Sha256};

risc0_zkvm::guest::entry!(main);

alloy_sol_types::sol! {
    struct ClaimsData {
        address addr;
    }
}

pub fn main() {
    let (provider, jwt): (IdentityProvider, String) = env::read();
    let addr = provider.validate(&jwt).unwrap();
    let addr = Address::from_str(&addr).unwrap();
    // let ident = hex::encode(Sha256::digest(ident)).as_bytes().to_vec();
    let output = ClaimsData { addr };
    let output = ClaimsData::encode(&output);

    env::commit_slice(&output);
}
