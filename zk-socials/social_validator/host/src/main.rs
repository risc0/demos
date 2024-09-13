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
    use serde::{Deserialize, Serialize};

    #[derive(Serialize, Deserialize)]
    struct Input {
        iss: IdentityProvider,
        jwks: String,
        jwt: String,
    }

    #[ignore] // TODO: Figure out why this is broken when it works
    #[test]
    fn test_prove_jwt_validation() {
        tracing_subscriber::fmt()
            .with_env_filter(tracing_subscriber::filter::EnvFilter::from_default_env())
            .init();

        let jwks_str = r#"{
            "keys" : [
                {
                  "alg": "RS256",
                  "e": "AQAB",
                  "kty": "RSA",
                  "n": "y-jiMQRB9zDOYbIaCoA4ppJ4prXbLhsM6upxCiip_6niQM_LHcCZxt_cFe88yi29Rgj1iEkOIJgXosydJLAtiOJHh1n7-FdSWEgKn3EfzI_VSncT2jnW6r3TtApzmHdDQnZmRKLB4mGXvnkwK-xzkpTRRM8r-m2A9dAylx0mGMqUabYYNg0n8x3EFG9ciFI5c3JwmMm8bHDw8BkhiHtG09nr7FkrEpn4tbhX9d7OeL-rbYLb2_H49BSX9L4O1vCOqf0cQMpSfhWiw7UjLjECzKlo0HNtELrpubBQbgZc9UbNlfCiaK4QO_fLog_YhY5Taxu05MViQvV_rxCi4ZwddQ",
                  "use": "sig",
                  "kid": "8792e7c2a2b7c1ab924e158a4ec4cf51"
                }
              ]
            }"#;

        let jwt_str = r#"eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ijg3OTJlN2MyYTJiN2MxYWI5MjRlMTU4YTRlYzRjZjUxIn0.eyJlbWFpbCI6InRlc3RAZW1haWwuY29tIiwibm9uY2UiOiIweDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAifQ.TPUrmStwY2iuqMLXn3WvpiJY1W-bbrU12WGuv0nK9NJ6Q0bT8D_Ags8qj8LPOGGE1CdHn2isBcHgSxaEbNbW8Pz0fVWpFiehj8BwrC47Rld5dwazsxghF84D3q2So5ZBQslWqq1PRGEFKfx4AOgnS375oKi2jAZ3jN_58UNdgtUUdFhuOGHvGbWnr_fEWIbrEcfNFIWahngQ2dbU-sSNZFZ5L3L46bXUkBlbGGNztr6OiAHUwxqH2A02h1EceUol2m6_GTvPfdXKzd0Z34CJNW_loAEheH69hkmkGPbt3ta_XAFWRHgmVN7gFjErRmPiB818YgAFBBIuhZnjvGmC5Q"#;

        let input = Input {
            iss: IdentityProvider::Test,
            jwks: jwks_str.to_string(),
            jwt: jwt_str.to_string(),
        };

        let input_str = serde_json::to_string(&input).unwrap().to_string();
        let env = ExecutorEnv::builder()
            .write(&input_str)
            .unwrap()
            .build()
            .unwrap();

        let prover = default_prover();
        let receipt = prover.prove(env, SOCIAL_VALIDATOR_ELF).unwrap().receipt;
        receipt.verify(SOCIAL_VALIDATOR_ID).unwrap();
    }
}
