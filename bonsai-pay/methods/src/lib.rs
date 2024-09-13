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
    use alloy_primitives::U256;
    use alloy_sol_types::{sol, SolValue};
    use risc0_zkvm::{default_executor, ExecutorEnv};

    sol! {
        interface IBonsaiPay {
            function claim(address payable to, bytes32 claim_id, bytes32 post_state_digest, bytes calldata seal);
        }

        struct Input {
            uint256 identity_provider;
            string jwt;
        }

        struct ClaimsData {
            address msg_sender;
            bytes32 claim_id;
        }
    }

    #[test]
    fn test_jwt_validator() {
        let jwt: &str = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ijg3OTJlN2MyYTJiN2MxYWI5MjRlMTU4YTRlYzRjZjUxIn0.eyJlbWFpbCI6InRlc3RAZW1haWwuY29tIiwibm9uY2UiOiIweDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAifQ.TPUrmStwY2iuqMLXn3WvpiJY1W-bbrU12WGuv0nK9NJ6Q0bT8D_Ags8qj8LPOGGE1CdHn2isBcHgSxaEbNbW8Pz0fVWpFiehj8BwrC47Rld5dwazsxghF84D3q2So5ZBQslWqq1PRGEFKfx4AOgnS375oKi2jAZ3jN_58UNdgtUUdFhuOGHvGbWnr_fEWIbrEcfNFIWahngQ2dbU-sSNZFZ5L3L46bXUkBlbGGNztr6OiAHUwxqH2A02h1EceUol2m6_GTvPfdXKzd0Z34CJNW_loAEheH69hkmkGPbt3ta_XAFWRHgmVN7gFjErRmPiB818YgAFBBIuhZnjvGmC5Q";

        let input = Input {
            identity_provider: U256::from(1),
            jwt: jwt.to_string(),
        };

        let env = ExecutorEnv::builder()
            .write_slice(&input.abi_encode())
            .build()
            .unwrap();

        let session_info = default_executor()
            .execute(env, super::JWT_VALIDATOR_ELF)
            .unwrap();

        let output = ClaimsData::abi_decode(&session_info.journal.bytes, true).unwrap();

        assert_eq!(
            output.msg_sender.to_string(),
            "0x0000000000000000000000000000000000000000"
        );

        assert_eq!(
            output.claim_id.to_string(),
            "0x73062d872926c2a556f17b36f50e328ddf9bff9d403939bd14b6c3b7f5a33fc2"
        );
    }
}
