# Solidity Contracts

This directory contains the Solidity contracts for an application with [RISC Zero](https://risczero.com) on Ethereum.

The main contract is [`BonsaiPay.sol`](./BonsaiPay.sol), which allows users to deposit funds associated with a claim ID and for recipients to claim those funds by providing a valid proof.

The Solidity libraries for RISC Zero can be found at [github.com/risc0/risc0-ethereum](https://github.com/risc0/risc0-ethereum/tree/main/contracts).

Contracts are built and tested with [forge](https://github.com/foundry-rs/foundry#forge), which is part of the [Foundry](https://getfoundry.sh/) toolkit.

Tests are defined in the `tests` directory in the root of this template.

## BonsaiPay Contract

The `BonsaiPay` contract has the following main functions:

- `deposit(bytes32 claimId)`: Allows users to deposit funds associated with a `claimId`. Emits a `Deposited` event.
- `claim(address payable to, bytes32 claimId, bytes32 postStateDigest, bytes calldata seal)`: Allows recipients to claim funds associated with a `claimId` by providing a valid proof. Emits a `Claimed` event.
- `balanceOf(bytes32 claimId)`: Returns the claimable balance for a given `claimId`.

The contract uses the RISC Zero verifier to validate the proof provided during the claim process. The `ImageID` used for verification is generated during the build process.

## Generated Contracts

As part of the build process, this template generates the `ImageID.sol` and `Elf.sol` contracts.

Running `cargo build` will generate these contracts with up to date references to your guest code.

- `ImageID.sol`: contains the [Image IDs](https://dev.risczero.com/terminology#image-id) for the guests implemented in the [methods](../methods/README.md) directory.
- `Elf.sol`: contains the path of the guest binaries implemented in the [methods](../methods/README.md) directory.

This contract is saved in the `tests` directory in the root of this template.