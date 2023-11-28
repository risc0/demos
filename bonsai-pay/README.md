# This directory contains the source code for a RISC Zero demo applicaiton called bonsai-pay.

## Bonsai Pay Starter Guide

The Bonsai Pay demo application demonstrates integrating existing web security standards and authentication protocols within the Ethereum blockchain utilizing zero-knowledge proofs provided by the RISC Zero zkVM. This repository is intended for demonstration purposes only and should not be used in production settings.

### Getting Started

#### Client

Navigate to the `app` directory. This directory contains the front-end client application.

To run the client application, you will need to setup the `.env` file according to the
`.env.example` provided.

Install the Node packages:

```bash
pnpm i
```

Run the application in development mode:

```bash
pnpm run dev
```

You can now navigate to the localhost and assigned port in your web browser.

#### Relay

Navigate to the `zkvm` directory. This directory contains the guest zkVM crates for
OIDC validation and the Bonsai Relay server, constructed using the `bonsai-sdk`.

To run the relay server, you will need to setup the `.env` file according
to the `.env.example` provided.

Install and run the relay server with info logging: 

```bash
RUST_LOG=info cargo run 
```

#### Contracts

This directory contains the smart contracts for the application. Testing and
deploying requires Foundry.

To deploy and test the smart contracts, you will need to setup the `.env` file
according to the `.env.example` provided.

To test and deploy the contracts, run anvil. 

```bash
anvil
```

To deploy the contracts to the local node, run the deployment script
`Deploy.s.sol`. 

```bash
forge script script/Deploy.s.sol --rpc-url http://localhost:8545
```


## Warning / Security Notice

**Bonsai Pay** is provided as an example / demo application in it's current form.
* **IT HAS NOT BEEN AUDITED**</span> and is **KNOWN** to contain security vulnerabilities:</font>
  * Versions committed prior to Nov 14, 2023 [leaked recipient email addresses](https://github.com/risc0/demos/security/advisories/GHSA-49mm-xg2c-r46j) that were readable in on chain transactions.
  * The [OIDC validation is insufficient](https://github.com/risc0/demos/security/advisories/GHSA-m9r5-6wx3-g33h) timer is not validated] which could lead to:
     * Burning of transactions
     * Transactions living beyond expected life-times
     * other issues

This code is provided as-is as a benefit to the public good, however should not be used with out a comprehensive security analysis.
