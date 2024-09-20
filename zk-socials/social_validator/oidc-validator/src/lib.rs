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
    Twitch,
    Facebook,
    Test,
}

impl IdentityProvider {
    pub fn validate(
        &self,
        token: &str,
        jwk_str: &str,
    ) -> Result<(String, String, String, String, String), OidcErr> {
        let jwk: JwkKeys =
            serde_json::from_str(jwk_str).map_err(|_| OidcErr::CertificateParseError)?;
        match self {
            Self::Google => {
                let (decoded, exp, iat) = decode_token::<GoogleClaims>(token, &jwk).unwrap();
                let email = decoded.email.to_string();
                let nonce = decoded.nonce.to_string();
                Ok((email, nonce, exp, iat, jwk_str.to_string()))
            }
            Self::Twitch => {
                let (decoded, exp, iat) = decode_token::<TwitchClaims>(token, &jwk).unwrap();
                let nonce = decoded.nonce.to_string();
                let pref_user = decoded.preferred_username.to_string();
                Ok((pref_user, nonce, exp, iat, jwk_str.to_string()))
            }
            Self::Facebook => {
              let (decoded, exp, iat) = decode_token::<FacebookClaims>(token, &jwk).unwrap();
              let email = decoded.email.to_string();
              let nonce = decoded.nonce.to_string();
              Ok((email, nonce, exp, iat, jwk_str.to_string()))
            }
            Self::Test => {
                let (decoded, exp, iat) = decode_token::<TestClaims>(token, &jwk).unwrap();
                let email = decoded.email.to_string();
                let nonce = decoded.nonce.to_string();
                Ok((email, nonce, exp, iat, jwk_str.to_string()))
            }
        }
    }
}

impl From<String> for IdentityProvider {
    fn from(value: String) -> Self {
        match value.to_lowercase().as_str() {
            "google" => Self::Google,
            "twitch" => Self::Twitch,
            "facebook" => Self::Facebook,
            "test" => Self::Test,
            _ => panic!("invalid identity provider"),
        }
    }
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct FacebookClaims {
    pub aud: String,
    pub iss: String,
    pub sub: String,
    pub nonce: String, // I require this one.
    pub email: String, // And this one too.
    pub jti: Option<String>,
    pub at_hash: Option<String>,
    pub given_name: Option<String>,
    pub family_name: Option<String>,
    pub name: Option<String>,
    pub picture: Option<String>,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct TwitchClaims {
    pub aud: String,
    pub iss: String,
    pub sub: String,
    pub nonce: String,
    pub preferred_username: String,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct GoogleClaims {
    pub aud: String,
    pub iss: String,
    pub sub: String,
    pub nonce: String, // I require this one.
    pub email: String, // And this one too.
    pub at_hash: Option<String>,
    pub azp: Option<String>,
    pub email_verified: Option<bool>,
    pub family_name: Option<String>,
    pub given_name: Option<String>,
    pub hd: Option<String>,
    pub locale: Option<String>,
    pub name: Option<String>,
    pub picture: Option<String>,
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

fn decode_token<T>(token: &str, keys: &JwkKeys) -> Result<(T, String, String), OidcErr>
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
        .map_err(|_| OidcErr::TokenValidationError)?;
    let claims = res.claims();
    let custom = claims.custom.clone();

    let exp = claims.expiration.unwrap().to_string();
    let iat = claims.issued_at.unwrap().to_string();
    Ok((custom, exp, iat))
}

#[cfg(test)]
pub mod test_oidc_validator {

    use super::*;

    pub static TEST_PUB_JWK: &str = r#"
{
  "keys" : [
    {
      "alg": "RS256",
      "e": "AQAB",
      "key_ops": [
        "verify"
      ],
      "kty": "RSA",
      "n": "nc2VMhxdEcKEoxqgmQNWhw8tiIBvGxg6Cu2uNSVLpK7XfyXUS7tf0nQHrfHdqemAPrKve_pmHk2OqPDpy4sNzs_owXMR5h2hoR7_nVL0FFHQJywryVy9rGYxT47OEkUJvbWSHxrPjSHqI8zoIa5JlaTTr5xmQ673bxGZVX3ehggYbecIMw9ZbnpvYQycJBq6jQEV8x81UH1egqCQf10PgMk5RG7Cl8argVDRisUGgHjN5Qi2e1R8YGKGu5iwaTy-ug1Y9nC4cKcSkObhRUjgyA1W0z-izSRTqijgtL_dInnT-et0p65y8iF8A4qIBUgBkRUBtzREq_fmbAfCUNc4wKAPKHSWmmjFIXB-uNRnnW7kdxOb42LnD_SlpwhxAKIcfqJXq8uoJDLiPpsLIZuBVtpOjfne7g1tk74wCcfM6U3KKvwcBE7uv2oAXKWm5iXMGzK6rr8Xi1z2DPZmFDUtH2ZF0X13VVp9z2V4B8A1WF_1NJ9WBQY64x9J6Tpz3EFz",
      "use": "sig",
      "kid": "28cd360ff0c96e5a2de77f23fa0856a6"
    }
  ]
}
"#;

    const VALID_TEST_JWT: &str = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IjI4Y2QzNjBmZjBjOTZlNWEyZGU3N2YyM2ZhMDg1NmE2In0.eyJpc3MiOiJodHRwczovL2lkcC5sb2NhbCIsImF1ZCI6Im15X2NsaWVudF9hcHAiLCJzdWIiOiI1YmU4NjM1OTA3M2M0MzRiYWQyZGEzOTMyMjIyZGFiZSIsImVtYWlsIjoidGVzdEBlbWFpbC5jb20iLCJub25jZSI6IjB4MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMCIsImV4cCI6MTcyNjc2OTY0NywiaWF0IjoxNzI2NzY5MzQ3fQ.SntZXTric908D3-BDUT6ADbkxnskB7zyfp-jJ3sJRxqLlLshTr-MkyVFBv2aYyKmPIJmF2uHKyGvyOgZqKo5K8qbIyColw5wGdDlGmHt2x-6tHibzSjfwlAtzAKU8Hi5qy1GZ1-nvqyuUu_QboK3WKeUPmBoUF6D7lyGpqCkBmPmmD57kkQBiep9u6j46HjwSDuXJpsVKlNGR_CbV5llrs1lfFJ6Fxe86aICW384PkNLX3tbV27nlJPICaFUf9b5QpUoJMrl8kQ9NpoqGQ65NlaBm6jlh8lBPi_ch5Y6P5zS_Vw2d-EtEMX0thhmOh0b1bjVhelOTM1BqLdOEfjWTeT96O0YkaivT-_g6QBO4FXCPcgr2MJmH15YKkHBZV4eSrkm7aqcssD2mdTFQd4MmK1aujO3XWYLdzFF0uoFKakBL3xUmVWN9LwLJQMfI1aV8Iugq_pwvOBdJujYVVHrigfaXq2U_JctRhHJkhbpBSUywgkGpCbqsukMkGFzLeih";

    #[test]
    fn test_validate_test_jwt_valid_token() {
        let test_keys: JwkKeys = serde_json::from_str(&TEST_PUB_JWK).unwrap();
        let (decoded, exp, iat) =
            decode_token::<super::TestClaims>(&VALID_TEST_JWT, &test_keys).unwrap();
        assert_eq!(&decoded.email, "test@email.com");
        assert_eq!(&decoded.nonce, "0x0000000000000000000000000000000000000000");
        assert!(!exp.is_empty());
        assert!(!iat.is_empty());
    }

    #[test]
    fn test_fail_invalid_test_token() {
        let test_keys: JwkKeys = serde_json::from_str(&TEST_PUB_JWK).unwrap();
        let jwt = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxxx";
        let result = decode_token::<super::TestClaims>(&jwt, &test_keys);
        assert!(result.is_err());
    }

    #[test]
    fn test_identity_provider_validate() {
        let test_keys: &str = TEST_PUB_JWK;

        let provider = IdentityProvider::Test;

        let result = provider.validate(&VALID_TEST_JWT, test_keys);

        assert!(result.is_ok());
        let (email, nonce, exp, iat, jwk_str) = result.unwrap();

        assert_eq!(email, "test@email.com");
        assert_eq!(nonce, "0x0000000000000000000000000000000000000000");
        assert!(!exp.is_empty());
        assert!(!iat.is_empty());
        assert_eq!(jwk_str, test_keys);
    }
}
