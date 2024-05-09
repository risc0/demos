use methods::{STWO_ELF, STWO_ID};
use risc0_zkvm::{default_prover, ExecutorEnv};
use stwo::{
    core::{
        air::{evaluation::PointEvaluationAccumulator, AirExt, Component, ComponentTrace},
        fields::m31::M31,
    },
    fibonacci::Fibonacci,
};

fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::filter::EnvFilter::from_default_env())
        .init();

    const FIB_LOG_SIZE: u32 = 5;
    let fib = Fibonacci::new(FIB_LOG_SIZE, M31::from_u32_unchecked(443693538));
    let trace = fib.get_trace();
    let trace_poly = trace.interpolate();
    let trace = ComponentTrace::new(vec![&trace_poly]);

    let proof = fib.prove()?;
    let oods_point = proof.additional_proof_data.oods_point;

    let (_, mask_values) = fib.air.component.mask_points_and_values(oods_point, &trace);
    let mut evaluation_accumulator = PointEvaluationAccumulator::new(
        proof
            .additional_proof_data
            .composition_polynomial_random_coeff,
        fib.air.composition_log_degree_bound(),
    );
    fib.air.component.evaluate_constraint_quotients_at_point(
        oods_point,
        &mask_values,
        &mut evaluation_accumulator,
    );
    let hz = evaluation_accumulator.finalize();

    assert_eq!(
        proof
            .additional_proof_data
            .composition_polynomial_oods_value,
        hz
    );

    let env = ExecutorEnv::builder().write(&fib)?.write(&proof)?.build()?;

    let prover = default_prover();

    let receipt = prover.prove(env, STWO_ELF)?;

    let (log_size, claim): (u32, M31) = receipt.journal.decode()?;
    assert_eq!(log_size, 5);
    assert_eq!(claim, M31::from_u32_unchecked(443693538));

    receipt.verify(STWO_ID)?;

    Ok(())
}
