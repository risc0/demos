// Copyright 2023 RISC Zero, Inc.
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

use std::io::Read;

use alloy_primitives::Address;
use alloy_sol_types::{SolType, SolValue};
use oidc_validator::IdentityProvider;
use risc0_zkvm::guest::env;
use risc0_zkvm::sha::rust_crypto::{Digest as _, Sha256};

alloy_sol_types::sol! {
    struct ClaimsData {
        address addr;
        bytes identity;
    }
}
fn main() {
    let (identity_provider, jwt): (IdentityProvider, String) = env::read();

    let (identity, addr) = identity_provider.validate(&jwt).unwrap();
    let addr = Address::parse_checksummed(addr, None).unwrap();
    let identity = hex::encode(Sha256::digest(identity)).as_bytes().to_vec();
    let output = ClaimsData { addr, identity };
    let output = output.abi_encode();

    env::commit_slice(&output);
}
