mod certs;
use certs::GOOGLE_PUB_JWK;
use jwt_compact::{
    alg::{Rsa, RsaPublicKey},
    jwk::{JsonWebKey, KeyType},
    AlgorithmExt, UntrustedToken,
};
use lazy_static::lazy_static;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use thiserror::Error;

lazy_static! {
    static ref GOOGLE_KEYS: HashMap<String, ExtendedJsonWebKey<'static, Extra>> = {
        let jwks: JwkKeys = serde_json::from_str(GOOGLE_PUB_JWK).expect("Failed to parse JWK");
        jwks.keys
            .into_iter()
            .map(|k| (k.extra.key_id.clone(), k))
            .collect()
    };
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
    Google,
}

impl IdentityProvider {
    pub fn validate(&self, token: &str) -> Result<(String, String), OidcErr> {
        match self {
            Self::Google => {
                let decoded = decode_token::<GoogleClaims>(token).unwrap();
                Ok((decoded.email.to_string(), decoded.nonce))
            }
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

pub fn decode_token<T>(token: &str) -> Result<T, OidcErr>
where
    T: for<'de> Deserialize<'de> + Serialize + Clone,
{
    let token = UntrustedToken::new(token).map_err(|_| OidcErr::TokenDecodeError)?;

    let key_id = token
        .header()
        .key_id
        .as_deref()
        .ok_or(OidcErr::KeyIdMissingError)?;

    let key = GOOGLE_KEYS
        .get(key_id)
        .ok_or(OidcErr::CertificateNotFoundError)?;

    let (alg, vkey) = match key.base.key_type() {
        KeyType::Rsa => RsaPublicKey::try_from(&key.base)
            .map(|vkey| (Rsa::rs256(), vkey))
            .map_err(|_| OidcErr::CertificateParseError)?,
        _ => return Err(OidcErr::AlgorithmNotFoundError),
    };

    let res = alg
        .validate_integrity::<T>(&token, &vkey)
        .map_err(|_| OidcErr::TokenValidationError);

    Ok(res.unwrap().claims().custom.clone())
}

#[cfg(test)]
pub mod test_oidc_validator {

    use super::{decode_token, GoogleClaims};

    #[test]
    fn test_validate_google_jwt_valid_token() {
        const GOOGLE_JWT: &str = r#"eyJhbGciOiJSUzI1NiIsImtpZCI6ImU0YWRmYjQzNmI5ZTE5N2UyZTExMDZhZjJjODQyMjg0ZTQ5ODZhZmYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI4NzM3ODczMzEyNjItN2JmbGo0ZmhvdXAxZW5sYjA1NWdnaXBxY2ppdXE2OHUuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI4NzM3ODczMzEyNjItN2JmbGo0ZmhvdXAxZW5sYjA1NWdnaXBxY2ppdXE2OHUuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDgzNzgxNTE5Njg3NDc4OTg3MzMiLCJoZCI6InJpc2N6ZXJvLmNvbSIsImVtYWlsIjoiaGFuc0ByaXNjemVyby5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwibm9uY2UiOiIweGVmZEY5ODYxRjNlRGMyNDA0NjQzQjU4ODM3OEZFMjQyRkNhZEU2NTgiLCJuYmYiOjE3MDE1NzE3MDIsIm5hbWUiOiJIYW5zIE1hcnRpbiIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NJQ0tlRDRnY0g3bnJTaDdncVFUMXJrMG1aUlNTcHlMMjhhTDRyekRKMnA9czk2LWMiLCJnaXZlbl9uYW1lIjoiSGFucyIsImZhbWlseV9uYW1lIjoiTWFydGluIiwibG9jYWxlIjoiZW4iLCJpYXQiOjE3MDE1NzIwMDIsImV4cCI6MTcwMTU3NTYwMiwianRpIjoiMDhkODAxZTdiYTk1MmJmNTAxY2I2ODFjMzg4YTk1MjVmOWIwZTM4MyJ9.nT9dBznua9nrGB1LWv94DAR_xEEi7wNDanqM8TIN0Ri-hYdCdPo1KyQO98ePsrH8UpRbzD10hP-0VMWIXkkxkNafqNBvkpt4y1CArwa9u7SXZr2WXPvs7Ou48XDYLNR3hnL3nB3lRw9FgKzRFjh_qMgA45FgTSx69vaYs8LMKUeZ-EY1QalXGRZPrYhLmykuiKdfntaRcXF8TYAQv7SuVXCPoATWJAkbDAVLpUiNVzxEvgyPGf01J7E3HC2T9Q0gmhHUryWqoLT3pbU-re2mWrmmGjX0SZEa7MjYRvlXPuI58Xvso9J1NQ6TlsK7YSHLlx5IxcZA3E0zVc5-HAoTLQ"#;

        let decoded = decode_token::<GoogleClaims>(GOOGLE_JWT).unwrap();

        assert_eq!(&decoded.email, "hans@risczero.com");
        assert_eq!(&decoded.nonce, "0xefdF9861F3eDc2404643B588378FE242FCadE658");
    }
    #[test]
    #[should_panic]
    fn test_fail_invalid_token() {
        const GOOGLE_JWT: &str = r#"xxxx"#;
        decode_token::<GoogleClaims>(GOOGLE_JWT).unwrap();
    }
}
