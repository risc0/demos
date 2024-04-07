use risc0_zkvm::guest::env;
use stwo::{core::prover::StarkProof, fibonacci::Fibonacci};

fn main() {
    let (fib, proof): (Fibonacci, StarkProof) = env::read();

    fib.verify(proof).unwrap();
}
