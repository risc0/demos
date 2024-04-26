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

use oidc_validator::IdentityProvider;
use risc0_zkvm::guest::env;
use serde::{Deserialize, Serialize};
use serde_json::from_str;

risc0_zkvm::guest::entry!(main);

#[derive(Deserialize, Serialize)]
struct Input {
    iss: String,
    jwt: String,
}

fn main() {
    let input_str: String = env::read();
    let input: Input = from_str(&input_str).expect("could not deserialize input");
    let identity_provider: IdentityProvider = input.iss.into();
    let (email, public_key): (String, String) = identity_provider
        .validate(&input.jwt)
        .expect("failed to validate and decode");

    env::commit(&(email, public_key));
}
