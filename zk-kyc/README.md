# zk-KYC Demonstration Application
> WARNING: this project is experimental and should not be used for any production use cases. Use at your own risk.
The zk-KYC demo application allows individuals to verify and mint their identity as an NFT enabling onchain identity verification with zero-knowledge proofs.

This demo leverages ID.me to generate a client authentication token. The token includes a nonce that is associated with the user's connected wallet address, employing principles from the [OpenPubkey: Augmenting OpenID Connect with User held Signing Keys](https://eprint.iacr.org/2023/296) paper. The JWT's integrity is then verified within the guest using ID.me's public RS256 signing [certificates](https://api.id.me/oidc/.well-known/jwks). Subsequently, the guest generates a cryptographic proof of the JWT's integrity and issues a receipt. This receipt, containing the SNARK, an obfuscated identifier, and the user's address, can be validated on the onchain for ERC721 token minting or other transactions, if valid.

For detailed information about the RISC Zero zkVM, refer to our developer [documentation](https://dev.risczero.com/api).

### Getting Started

#### Project Structure

The zk-KYC  Demo consists of three components, forming the complete end-user application:

- [`zkvm`]: This directory contains the host, guest, and OIDC library components.
    - [`zkvm/host`]: The entry point for the web socket client using the [bonsai-sdk] crate. 
    - [`zkvm/methods`]: The guest source code that runs and is proven in the zkVM.
    - [`zkvm/oidc-validator`]: A library for implementing JWT validation in the guest and host using the [jwt-compact] crate.
- [`contracts`]: This directory houses the [foundry] project for smart contracts, scripts, and tests related to ERC721 token minting.
- [`app`]: The front-end react application directory, enabling end-user interaction.

[`zkvm`]: zkvm/
[`zkvm/host`]: zkvm/host
[`zkvm/methods`]: zkvm/methods
[`zkvm/oidc-validator`]: zkvm/oidc-validator
[`contracts`]: contracts/
[`app`]: app/
[bonsai-sdk]: https://crates.io/crates/bonsai-sdk
[jwt-compact]: https://github.com/slowli/jwt-compact
[foundry]: https://github.com/foundry-rs/foundry

#### Application Setup

In order to run this application locally with remote proving, you will need to obtain a [Bonsai API](https://www.bonsai.xyz/) Key. You will also need Node and Rust installed. 

First, head to the [`app`] directory, which hosts the front-end client application.

Configure the `.env` file according to `.env.example` and install Node packages:

```bash
pnpm i
```

Then, initiate the application in development mode:

```bash
pnpm run dev
```

The application will now be available via your local web browser.

#### Relay Configuration

In the [`zkvm`] directory, find the zkVM crates for OIDC validation and the Bonsai Relay server, powered by the `bonsai-sdk`.

Prepare the `.env` file for the relay server as outlined in the `.env.example`.

To start the relay server with information logging, execute:

```bash
RUST_LOG=info cargo run 
```

#### Smart Contracts

The [`contracts`] directory contains the necessary smart contracts for the KYC proof verification and token functionality. Use Foundry for testing and deployment.

After setting up the `.env` file:

Initiate anvil:

```bash
anvil
```

Deploy the contracts to a local node:

```bash
forge script script/Deploy.s.sol --rpc-url http://localhost:8545
```

## Privacy and Security

As a sample application, the ERC721 Token Minting Demo is designed for demonstration purposes and is not suitable for production use. It is important to be aware that:
* The application **HAS NOT BEEN AUDITED** and **MAY CONTAIN SECURITY ISSUES**:
  * The OIDC validation process may be inadequate, as it does not fully verify expiration in the zkVM. 
* The zkVM Reciept is saved to the chain, publicly. This includes the zk-SNARK, Digest, and Journal which contains the issue date, expiration date, and the proof owner address.

This code is shared for the public benefit but necessitates a comprehensive security analysis before any practical application.
