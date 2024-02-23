// Copyright 2024 RISC Zero, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

#![no_main]
use std::str::FromStr;

use alloy_primitives::{Address, U256};
use alloy_sol_types::SolType;
use oidc_validator::IdentityProvider;
use risc0_zkvm::guest::env;

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
