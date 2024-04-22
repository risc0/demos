"use client";

import { cn } from "@risc0/ui/cn";
import { Highlight, themes } from "prism-react-renderer";

const codeBlock = `
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
    let mut input_bytes = Vec::u8::new();
    env::stdin().read_to_end(&mut input_bytes).unwrap();

    let input: Input = Input::abi_decode(&input_bytes, true).unwrap();

    let identity_provider: IdentityProvider = input.identity_provider.into();
    let jwt: String = input.jwt;

    let (claim_id, msg_sender) = identity_provider.validate(&jwt).unwrap();
    let msg_sender: Address = Address::parse_checksummed(msg_sender, None).unwrap();
    let claim_id: FixedBytes32 =
        FixedBytes::from_slice(Sha256::digest(claim_id.as_bytes()).as_slice());
    let output = ClaimsData {
        msg_sender,
        claim_id,
    };
    let output = output.abi_encode();

    env::commit_slice(&output);
}
`;

export function CodePreview() {
	return (
		<Highlight theme={themes.vsDark} code={codeBlock} language="typescript">
			{({ className, tokens, getLineProps, getTokenProps }) => (
				<pre className={cn(className, "overflow-x-auto text-[10px]")}>
					{tokens.map((line, index) => (
						<div
							key={`row-${
								// biome-ignore lint/suspicious/noArrayIndexKey: ignore
								index
							}`}
							{...getLineProps({ line })}
						>
							{line.map((token, index) => (
								<span
									key={`token-${
										// biome-ignore lint/suspicious/noArrayIndexKey: ignore
										index
									}`}
									{...getTokenProps({ token })}
								/>
							))}
						</div>
					))}
				</pre>
			)}
		</Highlight>
	);
}
