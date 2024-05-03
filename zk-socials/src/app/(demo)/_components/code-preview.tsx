"use client";

import { cn } from "@risc0/ui/cn";
import { Highlight, themes } from "prism-react-renderer";

const codeBlock = `
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
