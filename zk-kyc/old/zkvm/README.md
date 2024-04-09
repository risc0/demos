# Directory Structure

This directory serves as the root for the Rust code related to zk-KYC  including a web server client ([`zkvm/host`]) to relay proof and authentication requests to the application client, the zkVM guest program that proves the JWT validation execution trace ([`zkvm/methods`]), and the OIDC JWT validation library used in the guest and relay ([`zkvm/oidc-validator`]).

[`zkvm/host`]: zkvm/host
[`zkvm/methods`]: zkvm/methods
[`zkvm/oidc-validator`]: zkvm/oidc-validator
