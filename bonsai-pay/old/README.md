# Bonsai Pay Demonstration Application 

This demo uses Google Sign-In to generate a client authentication token. The token includes a nonce that contains the user's connected wallet address, aligning with similar principles described in the [OpenPubkey: Augmenting OpenID Connect with User held Signing Keys](https://eprint.iacr.org/2023/296) paper. The JWT's integrity is verified within the guest using Google's public RS256 signing [certificates](https://www.googleapis.com/oauth2/v3/certs). The guest then generates a cryptographic proof of the JWT's integrity, issuing a receipt that comprises the SNARK, an obfuscated identifier, and the user's address. The receipt contents can be further validated on the onchain and used to for arbitrary transactions, if valid. 

For more information about the RISC Zero zkVM, please see our developer
[documentation](https://dev.risczero.com/api).

Read our [blog post](https://www.risczero.com/news/bonsai-pay) about the Bonsai Pay Demo release!

### Getting Started

#### Project Structure

Bonsai Pay is composed of three components, all serving together to form the end-user application.

- [`zkvm`]: This houses the host, guest, and OIDC library.
    - [`zkvm/host`]: The entry point for the web socket client built with the [bonsai-sdk] crate. 
    - [`zkvm/methods`]: The guest source code that is ran and proven with the zkVM.
    - [`zkvm/oidc-validator`]: The library for implementing JWT validation in the guest and host using [jwt-compact] crate.
- [`contracts`]: This serves as the [foundry] project for the associated smart contracts, scripts, and tests.
- [`app`]: This directory holds the front-end react application, for the end user to interact with.

[`zkvm`]: zkvm/
[`zkvm/host`]: zkvm/host
[`zkvm/methods`]: zkvm/methods
[`zkvm/oidc-validator`]: zkvm/oidc-validator
[`contracts`]: conrtacts/
[`app`]: app/
[bonsai-sdk]: https://crates.io/crates/bonsai-sdk
[jwt-compact]: https://github.com/slowli/jwt-compact
[foundry]: https://github.com/foundry-rs/foundry

#### Application Setup

First, go to the [`app`] directory, which houses the front-end client application.

To launch the client application, configure the `.env` file based on the provided `.env.example`.

Install Node packages using:

```bash
pnpm i
```

Then, start the application in development mode with:

```bash
pnpm run dev
```

The application is now accessible through your local web browser.

#### Relay Configuration

In the [`zkvm`] directory, you'll find the guest zkVM crates for OIDC validation and the Bonsai Relay server, powered by the `bonsai-sdk`.

Set up the `.env` file for the relay server as per the `.env.example`.

To start the relay server with information logging, execute:

```bash
RUST_LOG=info cargo run 
```

#### Smart Contracts

The [`contracts`] directory includes the smart contracts needed for the application. Use Foundry for testing and deployment.

Configure the `.env` file according to `.env.example`.

To test and deploy the contracts, initiate anvil:

```bash
anvil
```

For deploying the contracts to a local node, use the `Deploy.s.sol` script:

```bash
forge script script/Deploy.s.sol --rpc-url http://localhost:8545
```

## Security Notice

Bonsai Pay, as a sample application, is not suitable for production environments. It is important to note that:
* The application **HAS NOT BEEN AUDITED** and is **KNOWN TO HAVE SECURITY ISSUES**:
  * Prior to November 14, 2023, versions exposed recipient email addresses in testnet transactions (see [security advisory](https://github.com/risc0/demos/security/advisories/GHSA-49mm-xg2c-r46j)).
  * The [OIDC validation process is inadequate](https://github.com/risc0/demos/security/advisories/GHSA-m9r5-6wx3-g33h), as it does not verify the temporal JWT claims in the guest, potentially allowing the reuse of expired tokens.

This code is made available for public benefit but requires a thorough security analysis before any practical use.
