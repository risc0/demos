# zk-KYC Demonstration Application
> WARNING: this project is experimental and should not be used for any production use cases. Use at your own risk.

The zk-KYC demo application allows individuals to verify and mint their identity as an NFT enabling onchain identity verification with zero-knowledge proofs.

This demo leverages [ID.me](https://www.id.me/) to generate a client authentication token. The token includes a nonce that is associated with the user's connected wallet address, employing principles from the [OpenPubkey: Augmenting OpenID Connect with User held Signing Keys](https://eprint.iacr.org/2023/296) paper. The JWT's integrity is then verified within the guest using ID.me's public RS256 signing [certificates](https://api.id.me/oidc/.well-known/jwks). Subsequently, the guest generates a cryptographic proof of the JWT's integrity and issues a receipt. This receipt, containing the SNARK, an obfuscated identifier, and the user's address, can be validated on the onchain for ERC721 token minting or other transactions, if valid.

For detailed information about the RISC Zero zkVM, refer to our developer [documentation](https://dev.risczero.com/api).

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

Next, you will need to install the `cargo risczero` tool.
We'll use [`cargo binstall`][cargo-binstall] to get `cargo-risczero` installed, and then install the `risc0` toolchain.
See [RISC Zero installation] for more details.

```sh
cargo install cargo-binstall
cargo binstall cargo-risczero
cargo risczero install
```

### ID.me Developer Account

This demo requires a ID.me developer account. You will also need an account to generate a client ID and secret to enable Sign-In-With-ID.me with OIDC. You can find more information about ID.me integration [here](https://developers.id.me/documentation) and the corresponding OIDC documentation [here](https://developers.id.me/documentation/federated-protocols/oidc).

### Etherscan API Key

You will need an Etherscan API key to verify the contract's source code. You can get one [here](https://etherscan.io/apis). This is not required, but is helpful for verifying the contract source code and generating the ABI bindings with [`wagmi`](https://wagmi.sh), which is used in the zk-KYC UI.

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

### Deploying the zk-KYC Contract

To deploy the zk-KYC contract, you will need to set the following environment variables. You can read more about deploying with Foundry scripts [here](https://book.getfoundry.sh/tutorials/solidity-scripting?highlight=Deploy#deploying-our-contract). Please note that the contracts are unaudited and should not be used in production chains.

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

- Start the publisher/subscriber app with the configured variables.

  ```sh
  cargo run --bin pubsub -- --chain-id <DEPLOYED_CHAIN_ID> \
    --eth-wallet-private-key <YOUR_PUBLISHER_PRIVATE_KEY> \
    --rpc-url <YOUR_RPC_PROVIDER> \
    --contract <DEPLOYED_BONSAI_PAY_CONTRACT_ADDRESS>
  ```

- Start the UI.

  ```sh
  cd ui
  pnpm i 
  pnpm run dev
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

