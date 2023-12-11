> ⚠️ This is an archived demonstration project and is not actively maintained. 

# Bonsai Pay Demonstration Application

The Bonsai Pay demonstration showcases the integration of established web security standards and authentication protocols with the Ethereum blockchain, employing zero-knowledge proofs from the RISC Zero zkVM. The application enables users to deposit and withdraw testnet Ethereum and ERC-20 tokens by cryptographically proving their Google account and Ethereum address ownership. Designed solely for demonstration, this application is **not intended for production use**.

This demo uses Google Sign-In to generate a client authentication token. The token includes a nonce that contains the user's connected wallet address, aligning with similar principles described in the [OpenPubkey: Augmenting OpenID Connect with User held Signing Keys](https://eprint.iacr.org/2023/296) paper. The JWT's integrity is verified within the guest using Google's public RS256 signing [certificates](https://www.googleapis.com/oauth2/v3/certs). The guest then generates a cryptographic proof of the JWT's integrity, issuing a receipt that comprises the SNARK, an obfuscated identifier, and the user's address. The receipt contents can be further validated on the onchain and used to for arbitrary transactions, if valid. 

For more information about the RISC Zero zkVM, please see our developer
[documentation](https://dev.risczero.com/api).

### Getting Started

#### Application Setup

First, go to the `app` directory, which houses the front-end client application.

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

In the `zkvm` directory, you'll find the guest zkVM crates for OIDC validation and the Bonsai Relay server, powered by the `bonsai-sdk`.

Set up the `.env` file for the relay server as per the `.env.example`.

To start the relay server with information logging, execute:

```bash
RUST_LOG=info cargo run 
```

#### Smart Contracts

The `contracts` directory includes the smart contracts needed for the application. Use Foundry for testing and deployment.

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
