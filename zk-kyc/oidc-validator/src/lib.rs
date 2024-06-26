mod certs;
use alloy_primitives::{Uint, U256};
use certs::{IDME_JWKS, TEST_PUB_JWK};
use jwt_compact::{
    alg::{Rsa, RsaPublicKey},
    jwk::{JsonWebKey, KeyType},
    AlgorithmExt, UntrustedToken,
};
use lazy_static::lazy_static;
use serde::{Deserialize, Serialize};
use thiserror::Error;

lazy_static! {
    static ref IDME_KEYS: JwkKeys = serde_json::from_str(IDME_JWKS).expect("Failed to parse JWK");
    static ref TEST_KEYS: JwkKeys =
        serde_json::from_str(TEST_PUB_JWK).expect("Failed to parse JWK");
}

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
    IdMe,
    Test,
}

impl IdentityProvider {
    pub fn validate(&self, token: &str) -> Result<(String, String), OidcErr> {
        match self {
            Self::IdMe => {
                let decoded = decode_token::<IdMeClaims>(token, &IDME_KEYS).unwrap();
                Ok((decoded.email.to_string(), decoded.nonce))
            }
            Self::Test => {
                let decoded = decode_token::<TestClaims>(token, &TEST_KEYS).unwrap();
                Ok((decoded.email.to_string(), decoded.nonce))
            }
        }
    }
}

impl From<Uint<256, 4>> for IdentityProvider {
    fn from(value: Uint<256, 4>) -> Self {
        match value {
            U256::ZERO => Self::IdMe,
            _ => Self::Test,
        }
    }
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct IdMeClaims {
    pub iss: String,
    pub sub: String,
    pub aud: String,
    pub exp: Option<u64>,
    pub iat: Option<u64>,
    pub nonce: String,
    pub email: String,
    pub fname: String,
    pub lname: String,
    pub uuid: String,
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

    use crate::IDME_KEYS;
    use std::env;
    #[test]
    fn test_validate_test_jwt_valid_token() {
        let jwt = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ijg3OTJlN2MyYTJiN2MxYWI5MjRlMTU4YTRlYzRjZjUxIn0.eyJlbWFpbCI6InRlc3RAZW1haWwuY29tIiwibm9uY2UiOiIweDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAifQ.TPUrmStwY2iuqMLXn3WvpiJY1W-bbrU12WGuv0nK9NJ6Q0bT8D_Ags8qj8LPOGGE1CdHn2isBcHgSxaEbNbW8Pz0fVWpFiehj8BwrC47Rld5dwazsxghF84D3q2So5ZBQslWqq1PRGEFKfx4AOgnS375oKi2jAZ3jN_58UNdgtUUdFhuOGHvGbWnr_fEWIbrEcfNFIWahngQ2dbU-sSNZFZ5L3L46bXUkBlbGGNztr6OiAHUwxqH2A02h1EceUol2m6_GTvPfdXKzd0Z34CJNW_loAEheH69hkmkGPbt3ta_XAFWRHgmVN7gFjErRmPiB818YgAFBBIuhZnjvGmC5Q";
        let decoded = decode_token::<super::TestClaims>(&jwt, &super::TEST_KEYS).unwrap();

        assert_eq!(&decoded.email, "test@email.com");
        assert_eq!(&decoded.nonce, "0x0000000000000000000000000000000000000000");
    }

    #[test]
    #[should_panic]
    fn test_fail_invalid_test_token() {
        let jwt = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxxx";
        decode_token::<super::TestClaims>(&jwt, &super::TEST_KEYS).unwrap();
    }
}
