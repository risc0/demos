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
use serde::Deserialize;
use std::io::Read;

risc0_zkvm::guest::entry!(main);

#[derive(Deserialize)]
struct Input {
    iss: IdentityProvider,
    jwt: String,
}

fn main() {
    // Read user input
    let mut input_str: String = String::new();
    env::stdin()
        .read_to_string(&mut input_str)
        .expect("could not read input string");

    // Deserialize user input
    let input: Input =
        serde_json::from_str(&input_str.as_str()).expect("could not deserialize input");

    // Validate the JWT
    let (email, public_key): (String, String) = input
        .iss
        .validate(&input.jwt)
        .expect("failed to validate and decode");

    // Commit the email and public key to the journal
    env::commit(&(email, public_key));
}
