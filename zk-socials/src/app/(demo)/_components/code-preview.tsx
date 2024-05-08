"use client";

import { cn } from "@risc0/ui/cn";
import { Highlight, themes } from "prism-react-renderer";

const codeBlock = `
use oidc_validator::IdentityProvider;
use risc0_zkvm::{
    guest::env,
    sha::rust_crypto::{Digest as _, Sha256},
};
use serde::{Deserialize, Serialize};
use std::io::Read;

risc0_zkvm::guest::entry!(main);

#[derive(Deserialize)]
struct Input {
    iss: IdentityProvider,
    jwks: String,
    jwt: String,
}

#[derive(Serialize)]
struct Output {
    email: String,
    public_key: String,
    expiration: String,
    issued_at: String,
    jwks: String,
}

fn main() {
    // Read user input
    let mut input_str: String = String::new();
    env::stdin()
        .read_to_string(&mut input_str)
        .expect("could not read input string");

    // Deserialize user input
    let input: Input = serde_json::from_str(&input_str).expect("could not deserialize input");

    // Validate the JWT
    let (email, public_key, expiration, issued_at, jwks) = input
        .iss
        .validate(&input.jwt, &input.jwks)
        .expect("failed to validate and decode");

    // Hash the email and issuer jwks
    let email = hex::encode(Sha256::digest(email.as_bytes()));
    let jwks = hex::encode(Sha256::digest(jwks.as_bytes()));

    // Commit the output to the public journal
    env::commit(&Output {
        email,
        public_key,
        expiration,
        issued_at,
        jwks,
    });
}
`;

export function CodePreview() {
  return (
    <Highlight theme={themes.vsDark} code={codeBlock} language="rust">
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
