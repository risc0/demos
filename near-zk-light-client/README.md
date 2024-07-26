# Near ZK Light Client

> WARNING: this project is experimental and should not be used for any production use cases. Use at your own risk.

This demo contains an example of ZK proving NEAR light client blocks.

Light clients allow for verifying consensus of a network without executing the state machine transactions within. Full nodes require much more storage, compute, and bandwidth which is unnecessary for some use cases.

Light clients form the basis for a lot of different interoperability use cases as well as efficient state sync. For those use cases, it usually relies on either the light client block validation to be done on-chain or for users to verify blocks from an arbitrary point in the past, depending on trust assumptions. This is unfortunate because it's either too computationally or financially expensive and sometimes relies on a trusted provider for certain use cases.

Generating a ZK proof of the light client verification is ideal in this case, especially if recursively proven, because you could only verify a single succinct proof and have guarantees about the correctness of the entire history or range of blocks. This not only dramatically minimizes the compute for users or protocols, but also dramatically minimizes the amount of data to verify, since you don't need to commit data for all validators in the committee, including their signatures on each block.

## Quick Start

First, [install] `v0.20` of the RISC Zero zkVM. 
> Note: This demo only works with `v0.20`.

To build all methods and execute the method within the zkVM, run the following
command:

```bash
cargo run 
```

This is an empty template, and so there is no expected output (until you modify
the code).

### Executing the project locally in development mode

During development, faster iteration upon code changes can be achieved by leveraging [dev-mode], we strongly suggest activating it during your early development phase. Furthermore, you might want to get insights into the execution statistics of your project, and this can be achieved by specifying the environment variable `RUST_LOG="executor=info"` before running your project.

Put together, the command to run your project in development mode while getting execution statistics is:

```bash
RUST_LOG="executor=info" RISC0_DEV_MODE=1 cargo run
```

### Running proofs remotely on Bonsai

_Note: The Bonsai proving service is still in early Alpha; an API key is
required for access. [Click here to request access][bonsai access]._

If you have access to the URL and API key to Bonsai you can run your proofs
remotely. To prove in Bonsai mode, invoke `cargo run` with two additional
environment variables:

```bash
BONSAI_API_KEY="YOUR_API_KEY" BONSAI_API_URL="BONSAI_URL" cargo run
```

## Directory Structure

It is possible to organize the files for these components in various ways.
However, in this starter template we use a standard directory structure for zkVM
applications, which we think is a good starting point for your applications.

```text
project_name
├── Cargo.toml
├── host
│   ├── Cargo.toml
│   └── src
│       └── main.rs                        <-- [Host code goes here]
└── methods
    ├── Cargo.toml
    ├── build.rs
    ├── guest
    │   ├── Cargo.toml
    │   └── src
    │       └── bin
    │           └── method_name.rs         <-- [Guest code goes here]
    └── src
        └── lib.rs
```

## Video Tutorial

For a walk-through of how to build with this template, check out this [excerpt
from our workshop at ZK HACK III][zkhack-iii].

## Questions, Feedback, and Collaborations

We'd love to hear from you on [Discord][discord] or [Twitter][twitter].

[bonsai access]: https://bonsai.xyz/apply
[cargo-risczero]: https://docs.rs/cargo-risczero
[crates]: https://github.com/risc0/risc0/blob/main/README.md#rust-binaries
[dev-docs]: https://dev.risczero.com
[dev-mode]: https://dev.risczero.com/api/zkvm/dev-mode
[discord]: https://discord.gg/risczero
[docs.rs]: https://docs.rs/releases/search?query=risc0
[examples]: https://github.com/risc0/risc0/tree/main/examples
[install]: https://dev.risczero.com/api/zkvm/install
[risc0-build]: https://docs.rs/risc0-build
[risc0-repo]: https://www.github.com/risc0/risc0
[risc0-zkvm]: https://docs.rs/risc0-zkvm
[rustup]: https://rustup.rs
[rust-toolchain]: rust-toolchain.toml
[twitter]: https://twitter.com/risczero
[zkvm-overview]: https://dev.risczero.com/zkvm
[zkhack-iii]: https://www.youtube.com/watch?v=Yg_BGqj_6lg&list=PLcPzhUaCxlCgig7ofeARMPwQ8vbuD6hC5&index=5
