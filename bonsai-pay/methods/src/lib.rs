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

//! Generated crate containing the image ID and ELF binary of the build guest.
include!(concat!(env!("OUT_DIR"), "/methods.rs"));

#[cfg(test)]
mod tests {
    use alloy_primitives::{Address, FixedBytes, U256};
    use alloy_sol_types::SolValue;
    use risc0_zkvm::sha::rust_crypto::{Digest as _, Sha256};
    use risc0_zkvm::{default_executor, ExecutorEnv};

    // Mimic the `ClaimsData` and `Input` structs from the guest code.
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

    #[test]
    fn test_validate_jwt() {
        let jwt = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ijg3OTJlN2MyYTJiN2MxYWI5MjRlMTU4YTRlYzRjZjUxIn0.eyJlbWFpbCI6InRlc3RAZW1haWwuY29tIiwibm9uY2UiOiIweDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAifQ.TPUrmStwY2iuqMLXn3WvpiJY1W-bbrU12WGuv0nK9NJ6Q0bT8D_Ags8qj8LPOGGE1CdHn2isBcHgSxaEbNbW8Pz0fVWpFiehj8BwrC47Rld5dwazsxghF84D3q2So5ZBQslWqq1PRGEFKfx4AOgnS375oKi2jAZ3jN_58UNdgtUUdFhuOGHvGbWnr_fEWIbrEcfNFIWahngQ2dbU-sSNZFZ5L3L46bXUkBlbGGNztr6OiAHUwxqH2A02h1EceUol2m6_GTvPfdXKzd0Z34CJNW_loAEheH69hkmkGPbt3ta_XAFWRHgmVN7gFjErRmPiB818YgAFBBIuhZnjvGmC5Q";
        let input_data: Input = Input {
            identity_provider: U256::from(1),
            jwt: jwt.to_string(),
        };
        let env = ExecutorEnv::builder()
            .write_slice(&input_data.abi_encode())
            .build()
            .unwrap();

        // NOTE: Use the executor to run tests without proving.
        let session_info = default_executor().execute(env, super::IS_EVEN_ELF).unwrap();

        let output = ClaimsData::abi_decode(&session_info.journal.bytes, true).unwrap();

        let test_claim_id =
            FixedBytes::from_slice(Sha256::digest("test@email.com".as_bytes()).as_slice());

        assert_eq!(output.claim_id, test_claim_id);
        assert_eq!(
            output.msg_sender,
            Address::parse_checksummed("0x0000000000000000000000000000000000000000", None).unwrap()
        );
    }
}
