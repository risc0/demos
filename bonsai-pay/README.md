# Bonsai Pay Demo

This demo uses Google Sign-In to generate a client authentication token. The token includes a nonce that contains the user's connected wallet address, aligning with similar principles described in the [OpenPubkey: Augmenting OpenID Connect with User held Signing Keys](https://eprint.iacr.org/2023/296) paper. The JWT's integrity is verified within the guest [zkVM Program] using Google's public RS256 signing [certificates](https://www.googleapis.com/oauth2/v3/certs). The guest uses [Bonsai] to run the [RISC Zero zkVM], generating a cryptographic proof of the JWT's integrity, issuing a receipt that comprises the SNARK, an obfuscated identifier, and the user's address. The finalized proof is posted onchain and verified with the [RISC Zero Verifier] and used for arbitrary transactions, if valid. 

> **Note: This software is not production ready. Do not use in production.**

This is based on the [Bonsai Foundry Template] for writing an application using [RISC Zero] and Ethereum.

This repository implements the application on Ethereum utilizing RISC Zero as a [coprocessor] to the smart contract application. Prove computation with the [RISC Zero zkVM] and verify the results in your Ethereum contract. 

Check out the [developer FAQ] for more information on zkVM application design.

## Dependencies

First, [install Rust] and [Foundry], and then restart your terminal.

```sh
# Install Rust
curl https://sh.rustup.rs -sSf | sh
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
```

Next, use the [RISC Zero installation] instructions to install `v1.0.5` of the RISC Zero zkVM. 
> Note: This demo only works with `v1.0.5`.

### Google Cloud Platform

This demo requires a Google Cloud Platform account. You will also need an account to generate a client ID to enable Sign-In-With-Google with OIDC via Google Cloud Identity Platform. You can find more information on how to set up Google Sign-In [here](https://developers.google.com/identity/sign-in/web/sign-in) and [here](https://developers.google.com/identity/protocols/oauth2/openid-connect).

### Etherscan API Key

You will need an Etherscan API key to verify the contract's source code. You can get one [here](https://etherscan.io/apis). This is not required, but is helpful for verifying the contract source code and generating the ABI bindings with [`wagmi`](https://wagmi.sh), which is used in the Bonsai Pay UI.

Now you have all the tools you need to develop and deploy an application with [RISC Zero].

## Quick Start

- Builds for zkVM program, the publisher app, and any other Rust code.

  ```sh
  cargo build
  ```

- Build your Solidity smart contracts

  > NOTE: `cargo build` needs to run first to generate the `ImageID.sol` contract.

  ```sh
  forge build
  ```

- Create a `.env` and update the necessary environment variables as shown in the [`.env.example`] file, for the UI.

  ```sh
  cp ui/.env.example ui/.env
  ```

### Run the Tests

- Tests your zkVM program.

  ```sh
  cargo test
  ```

- Test your Solidity contracts, integrated with your zkVM program.

  ```sh
  RISC0_DEV_MODE=true forge test -vvv 
  ```

### Configuring Bonsai

***Note:*** *To request an API key [complete the form here](https://bonsai.xyz/apply).*

With the Bonsai proving service, you can produce a [Groth16 SNARK proof] that is verifiable on-chain.
You can get started by setting the following environment variables with your API key and associated URL.

```bash
export BONSAI_API_KEY="YOUR_API_KEY" # see form linked above
export BONSAI_API_URL="BONSAI_URL" # provided with your api key
```

Now if you run `forge test` with `RISC0_DEV_MODE=false`, the test will run as before, but will additionally use the fully verifying `RiscZeroGroth16Verifier` contract instead of `MockRiscZeroVerifier` and will request a SNARK receipt from Bonsai.

```sh
RISC0_DEV_MODE=false forge test -vvv
```

### Deploying the Bonsai Pay Contract

To deploy the Bonsai Pay contract, you will need to set the following environment variables. You can read more about deploying with Foundry scripts [here](https://book.getfoundry.sh/tutorials/solidity-scripting?highlight=Deploy#deploying-our-contract). Please note that the contracts are unaudited and should not be used in production chains.

```bash
export ETH_WALLET_PRIVATE_KEY="YOUR_PRIVATE_KEY"
```

You can deploy the contract using the forge deploy script. 
  
  ```sh
  forge script script/Deploy.s.sol \ 
    --rpc-url <YOUR_RPC_URL> \
    --broadcast \
    --etherscan-api-key <YOUR_ETHERSCAN_API_KEY> \
    --verify 
  ```

### Running the Application

Copy the `.env.example` file to `.env` and update the variables as needed.

- Start the publisher/subscriber app with the configured variables.

  ```sh
  cargo run --bin pubsub 
  ```

- Start the UI.

  ```sh
  cd ui
  pnpm i 
  pnpm run dev
  ```

## Project Structure

Below are the primary files in the project directory

```text
.
├── Cargo.toml                      // Configuration for Cargo and Rust
├── foundry.toml                    // Configuration for Foundry
├── apps
│   ├── Cargo.toml
│   └── src
│       └── lib.rs                  // Utility functions
│       └── bin                     
│           └── pubsub.rs           // Publish program results and act as a backend server for proof requests from Bonsai Pay UI
├── contracts
│   ├── BonsaiPay.sol               // Bonsai Pay smart contract
│   └── ImageID.sol                 // Generated contract with the image ID for your zkVM program
├── methods
│   ├── Cargo.toml
│   ├── guest
│   │   ├── Cargo.toml
│   │   └── src
│   │       └── bin                 
│   │           └── jwt_validator.rs  // JWT validation guest program 
│   └── src
│       └── lib.rs                  // Compiled image IDs and tests for guest program
└── tests
│   ├── BonsaiPay.t.sol             // BonsaiPay tests for the contract
│   └── Elf.sol                     // Generated contract with paths the guest program ELF files.
└── oidc-validator
│   ├── Cargo.toml
│   └── src
│       └── lib.rs                  // OIDC JWT validation library
│       └── certs.rs                // JWT validation certificates
└── ui
    └── ...                         // React frontend UI for Bonsai Pay
```

[Bonsai]: https://dev.bonsai.xyz/
[Foundry]: https://getfoundry.sh/
[Groth16 SNARK proof]: https://www.risczero.com/news/on-chain-verification
[RISC Zero Verifier]: https://github.com/risc0/risc0/blob/release-0.21/bonsai/ethereum/contracts/IRiscZeroVerifier.sol
[RISC Zero installation]: https://dev.risczero.com/api/zkvm/install
[RISC Zero zkVM]: https://dev.risczero.com/zkvm
[RISC Zero]: https://www.risczero.com/
[Sepolia]: https://www.alchemy.com/overviews/sepolia-testnet
[cargo-binstall]: https://github.com/cargo-bins/cargo-binstall#cargo-binaryinstall
[coprocessor]: https://www.risczero.com/news/a-guide-to-zk-coprocessors-for-scalability
[developer FAQ]: https://dev.risczero.com/faq#zkvm-application-design
[install Rust]: https://doc.rust-lang.org/cargo/getting-started/installation.html
[zkVM program]: ./methods/guest/
[Bonsai Foundry Template]: https://github.com/risc0/bonsai-foundry-template
[`.env.example`]: ./ui/.env.example
