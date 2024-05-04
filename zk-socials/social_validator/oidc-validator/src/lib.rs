use jwt_compact::{
    alg::{Rsa, RsaPublicKey},
    jwk::{JsonWebKey, KeyType},
    AlgorithmExt, UntrustedToken,
};
use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Deserialize, Serialize)]
struct JwkKeys {
    keys: Vec<ExtendedJsonWebKey<'static, Extra>>,
}

#[derive(Debug, Serialize, Deserialize)]
struct ExtendedJsonWebKey<'a, T> {
    #[serde(flatten)]
    base: JsonWebKey<'a>,
    #[serde(flatten)]
    extra: T,
}

#[derive(Debug, Deserialize, Serialize)]
struct Extra {
    #[serde(rename = "kid")]
    key_id: String,
}

#[derive(Deserialize, Serialize)]
pub enum IdentityProvider {
    Google,
    Test,
}

impl IdentityProvider {
    pub fn validate(
        &self,
        token: &str,
        jwk_str: &str,
    ) -> Result<(String, String, String), OidcErr> {
        let jwk: JwkKeys =
            serde_json::from_str(jwk_str).map_err(|_| OidcErr::CertificateParseError)?;
        match self {
            Self::Google => {
                let decoded = decode_token::<GoogleClaims>(token, &jwk).unwrap();
                Ok((
                    decoded.email.to_string(),
                    decoded.nonce,
                    jwk_str.to_string(),
                ))
            }
            Self::Test => {
                let decoded = decode_token::<TestClaims>(token, &jwk).unwrap();
                Ok((
                    decoded.email.to_string(),
                    decoded.nonce,
                    jwk_str.to_string(),
                ))
            }
        }
    }
}

impl From<String> for IdentityProvider {
    fn from(value: String) -> Self {
        match value.to_lowercase().as_str() {
            "google" => Self::Google,
            "test" => Self::Test,
            _ => panic!("invalid identity provider"),
        }
    }
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct GoogleClaims {
    pub aud: String,
    pub iss: String,
    pub sub: String,
    pub nonce: String, // I require this one.
    pub email: String, // And this one too.
    pub exp: Option<u64>,
    pub iat: Option<u64>,
    pub at_hash: Option<String>,
    pub azp: Option<String>,
    pub email_verified: Option<bool>,
    pub family_name: Option<String>,
    pub given_name: Option<String>,
    pub hd: Option<String>,
    pub locale: Option<String>,
    pub name: Option<String>,
    pub picture: Option<String>,
    pub nbf: Option<u64>,
    pub jti: Option<String>,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct TestClaims {
    pub email: String,
    pub nonce: String,
}

#[derive(Error, Debug)]
pub enum OidcErr {
    #[error("Failed to parse certificate")]
    CertificateParseError,
    #[error("Failed to decode token")]
    TokenDecodeError,
    #[error("Algorithm not found")]
    AlgorithmNotFoundError,
    #[error("Failed to generate token")]
    TokenGenerationError,
    #[error("Failed to validate token")]
    TokenValidationError,
    #[error("Certificate not found")]
    CertificateNotFoundError,
    #[error("Key id missing")]
    KeyIdMissingError,
}

fn decode_token<T>(token: &str, keys: &JwkKeys) -> Result<T, OidcErr>
where
    T: for<'de> Deserialize<'de> + Serialize + Clone,
{
    let token = UntrustedToken::new(token).map_err(|_| OidcErr::TokenDecodeError)?;

    let key_id = token
        .header()
        .key_id
        .as_deref()
        .ok_or(OidcErr::KeyIdMissingError)?;

    let key = keys
        .keys
        .iter()
        .find(|k| k.extra.key_id == key_id)
        .ok_or(OidcErr::CertificateNotFoundError)?;

    let (alg, vkey) = match key.base.key_type() {
        KeyType::Rsa => RsaPublicKey::try_from(&key.base)
            .map(|vkey| (Rsa::rs256(), vkey))
            .map_err(|_| OidcErr::CertificateParseError)?,
        _ => return Err(OidcErr::AlgorithmNotFoundError),
    };

    // Validate the token integrity.
    // NOTE: This does not verify the `exp` field.
    let res = alg
        .validate_integrity::<T>(&token, &vkey)
        .map_err(|_| OidcErr::TokenValidationError);

    Ok(res.unwrap().claims().custom.clone())
}

#[cfg(test)]
pub mod test_oidc_validator {

    use super::*;

    const TEST_PUB_JWK: &str = r#"
        {
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
        }
        "#;

    #[test]
    fn test_validate_test_jwt_valid_token() {
        let test_keys: JwkKeys = serde_json::from_str(&TEST_PUB_JWK).unwrap();
        let jwt = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ijg3OTJlN2MyYTJiN2MxYWI5MjRlMTU4YTRlYzRjZjUxIn0.eyJlbWFpbCI6InRlc3RAZW1haWwuY29tIiwibm9uY2UiOiIweDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAifQ.TPUrmStwY2iuqMLXn3WvpiJY1W-bbrU12WGuv0nK9NJ6Q0bT8D_Ags8qj8LPOGGE1CdHn2isBcHgSxaEbNbW8Pz0fVWpFiehj8BwrC47Rld5dwazsxghF84D3q2So5ZBQslWqq1PRGEFKfx4AOgnS375oKi2jAZ3jN_58UNdgtUUdFhuOGHvGbWnr_fEWIbrEcfNFIWahngQ2dbU-sSNZFZ5L3L46bXUkBlbGGNztr6OiAHUwxqH2A02h1EceUol2m6_GTvPfdXKzd0Z34CJNW_loAEheH69hkmkGPbt3ta_XAFWRHgmVN7gFjErRmPiB818YgAFBBIuhZnjvGmC5Q";
        let decoded = decode_token::<super::TestClaims>(&jwt, &test_keys).unwrap();

        assert_eq!(&decoded.email, "test@email.com");
        assert_eq!(&decoded.nonce, "0x0000000000000000000000000000000000000000");
    }

    #[test]
    #[should_panic]
    fn test_fail_invalid_test_token() {
        let test_keys: JwkKeys = serde_json::from_str(&TEST_PUB_JWK).unwrap();
        let jwt = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxxx";
        decode_token::<super::TestClaims>(&jwt, &test_keys).unwrap();
    }
}
