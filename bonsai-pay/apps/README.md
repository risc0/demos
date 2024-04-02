# Publisher/Subscriber Application

The Publisher/Subscriber application is a simple application that listens for incoming JWT tokens, sends a proof request to the [Bonsai] proving service, and publishes the received proofs to a deployed Bonsai Pay contract on Ethereum. This application is useful for integrating the Bonsai proving service with a deployed Bonsai Pay contract and UI. 

## Getting Started

The [`pubsub` CLI][pubsub], is an application that listens for JWT tokens via HTTP, sends an off-chain proof request to the [Bonsai] proving service, and publishes the received proofs to the deployed Bonsai Pay contract.

### Usage

Run the `pubsub` with:

```sh
cargo run --bin pubsub
```

```text
$ cargo run --bin pubsub -- --help

Usage: pubsub --chain-id <CHAIN_ID> --eth-wallet-private-key <ETH_WALLET_PRIVATE_KEY> --rpc-url <RPC_URL> --contract <CONTRACT> 

Options:
      --chain-id <CHAIN_ID>
          Ethereum chain ID
      --eth-wallet-private-key <ETH_WALLET_PRIVATE_KEY>
          Ethereum Node endpoint [env: ETH_WALLET_PRIVATE_KEY=]
      --rpc-url <RPC_URL>
          Ethereum Node endpoint
      --contract <CONTRACT>
          Bonsai Pay's contract address on Ethereum
  -h, --help
          Print help
  -V, --version
          Print version
```

The server listens on `http://localhost:8080` for incoming requests with a JWT token in the X-Auth-Token header. Upon receiving a token, it sends a proof request to Bonsai and publishes the received proof to the specified contract on Ethereum.

#### Example Request

```sh
curl -H "X-Auth-Token: <JWT_TOKEN>" http://localhost:8080/auth
```

## Library

A small rust [library] containing utility functions to help with sending off-chain proof requests to the Bonsai proving service and publish the received proofs directly to a deployed app contract on Ethereum.

[pubsub]: ./src/bin/pubsub.rs
[Bonsai]: https://dev.bonsai.xyz/
[library]: ./src/lib.rs
