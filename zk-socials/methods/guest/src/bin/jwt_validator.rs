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

use alloy_primitives::{Address, FixedBytes};
use alloy_sol_types::SolValue;
use oidc_validator::IdentityProvider;
use risc0_zkvm::guest::env;
use risc0_zkvm::sha::rust_crypto::{Digest as _, Sha256};
use std::io::Read;

alloy_sol_types::sol! {
    struct ClaimsData {
        address msg_sender;
        bytes32 claim_id;
    }
    struct Input {
        uint256 identity_provider;
        string jwt;
    }
}

fn main() {
    let mut input_bytes = Vec::<u8>::new();
    env::stdin().read_to_end(&mut input_bytes).unwrap();

    let input: Input = <Input>::abi_decode(&input_bytes, true).unwrap();

    let identity_provider: IdentityProvider = input.identity_provider.into();
    let jwt: String = input.jwt;

    let (claim_id, msg_sender) = identity_provider.validate(&jwt).unwrap();
    let msg_sender: Address = Address::parse_checksummed(msg_sender, None).unwrap();
    let claim_id: FixedBytes<32> =
        FixedBytes::from_slice(Sha256::digest(claim_id.as_bytes()).as_slice());
    let output = ClaimsData {
        msg_sender,
        claim_id,
    };
    let output = output.abi_encode();

    env::commit_slice(&output);
}
