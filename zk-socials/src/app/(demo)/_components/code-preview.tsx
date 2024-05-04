"use client";

import { cn } from "@risc0/ui/cn";
import { Highlight, themes } from "prism-react-renderer";

const codeBlock = `
#![no_main]

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
  email: Vec<u8>,
  public_key: String,
  jwks: Vec<u8>,
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
  let (email, public_key, jwks): (String, String, String) = input
    .iss
    .validate(&input.jwt, &input.jwks)
    .expect("failed to validate and decode");

  // Hash the email and issuer jwks
  let email = Sha256::digest(email.as_bytes()).to_vec();
  let jwks = Sha256::digest(jwks.as_bytes()).to_vec();

  // Commit the output to the public journal
  env::commit(&Output {
    email,
    public_key,
    jwks,
  });
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
