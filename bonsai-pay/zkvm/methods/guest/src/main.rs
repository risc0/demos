#![no_main]
use std::str::FromStr;

use alloy_primitives::Address;
use alloy_sol_types::SolType;
use oidc_validate::IdentityProvider;
use risc0_zkvm::guest::env;

risc0_zkvm::guest::entry!(main);

alloy_sol_types::sol! {
    struct ClaimsData {
        address addr;
        bytes ident;
    }
}

pub fn main() {
    let (provider, jwt): (IdentityProvider, String) = env::read();
    let (ident, addr) = provider.validate(&jwt).unwrap();
    let addr = Address::from_str(&addr).unwrap();
    let ident = ident.as_bytes().to_vec();

    let output = ClaimsData { addr, ident };
    let output = ClaimsData::encode(&output);

    env::commit_slice(&output);
}
