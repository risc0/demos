use methods::{SOCIAL_VALIDATOR_ELF, SOCIAL_VALIDATOR_PATH};
use risc0_zkvm::compute_image_id;

fn main() {
    let image = compute_image_id(SOCIAL_VALIDATOR_ELF).unwrap();
    let image_id = hex::encode(image);

    println!("Image ID: {}", image_id);
    println!("ELF Image Path: {}", SOCIAL_VALIDATOR_PATH);
}

#[cfg(test)]
mod tests {

    use methods::{SOCIAL_VALIDATOR_ELF, SOCIAL_VALIDATOR_ID};
    use oidc_validator::IdentityProvider;
    use risc0_zkvm::{default_prover, ExecutorEnv};
    use serde::Serialize;

    #[derive(Serialize)]
    struct Input {
        iss: IdentityProvider,
        jwt: String,
    }

    #[ignore] // TODO: Figure out why this is broken when it works
    #[test]
    fn test_prove_jwt_validation() {
        tracing_subscriber::fmt()
            .with_env_filter(tracing_subscriber::filter::EnvFilter::from_default_env())
            .init();

        let input_str = "{'iss':'Test;,'jwt':'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ijg3OTJlN2MyYTJiN2MxYWI5MjRlMTU4YTRlYzRjZjUxIn0.eyJlbWFpbCI6InRlc3RAZW1haWwuY29tIiwibm9uY2UiOiIweDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAifQ.TPUrmStwY2iuqMLXn3WvpiJY1W-bbrU12WGuv0nK9NJ6Q0bT8D_Ags8qj8LPOGGE1CdHn2isBcHgSxaEbNbW8Pz0fVWpFiehj8BwrC47Rld5dwazsxghF84D3q2So5ZBQslWqq1PRGEFKfx4AOgnS375oKi2jAZ3jN_58UNdgtUUdFhuOGHvGbWnr_fEWIbrEcfNFIWahngQ2dbU-sSNZFZ5L3L46bXUkBlbGGNztr6OiAHUwxqH2A02h1EceUol2m6_GTvPfdXKzd0Z34CJNW_loAEheH69hkmkGPbt3ta_XAFWRHgmVN7gFjErRmPiB818YgAFBBIuhZnjvGmC5Q'}";

        // let input: Input = Input {
        //     iss: IdentityProvider::Test,
        //     jwt: "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ijg3OTJlN2MyYTJiN2MxYWI5MjRlMTU4YTRlYzRjZjUxIn0.eyJlbWFpbCI6InRlc3RAZW1haWwuY29tIiwibm9uY2UiOiIweDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAifQ.TPUrmStwY2iuqMLXn3WvpiJY1W-bbrU12WGuv0nK9NJ6Q0bT8D_Ags8qj8LPOGGE1CdHn2isBcHgSxaEbNbW8Pz0fVWpFiehj8BwrC47Rld5dwazsxghF84D3q2So5ZBQslWqq1PRGEFKfx4AOgnS375oKi2jAZ3jN_58UNdgtUUdFhuOGHvGbWnr_fEWIbrEcfNFIWahngQ2dbU-sSNZFZ5L3L46bXUkBlbGGNztr6OiAHUwxqH2A02h1EceUol2m6_GTvPfdXKzd0Z34CJNW_loAEheH69hkmkGPbt3ta_XAFWRHgmVN7gFjErRmPiB818YgAFBBIuhZnjvGmC5Q".to_string(),
        // };
        //
        // let input_str = serde_json::to_string(&input).unwrap();

        let env = ExecutorEnv::builder()
            .write(&input_str)
            .unwrap()
            .build()
            .unwrap();

        let prover = default_prover();

        let receipt = prover.prove(env, SOCIAL_VALIDATOR_ELF).unwrap();
        //
        // let output: (String, String) = receipt.journal.decode().expect("could not decode journal");
        //
        // println!("email: {}, public_key: {}", output.0, output.1);
        //
        receipt.verify(SOCIAL_VALIDATOR_ID).unwrap();
    }
}
