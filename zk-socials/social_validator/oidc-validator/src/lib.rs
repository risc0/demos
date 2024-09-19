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
                let decoded = decode_token::<GoogleClaims>(token, &jwk).unwrap();
                let email = decoded.custom.email.to_string();
                let nonce = decoded.custom.nonce.to_string();
                let exp = decoded.expiration.unwrap().timestamp().to_string();
                let iat = decoded.issued_at.unwrap().timestamp().to_string();
                Ok((email, nonce, exp, iat, jwk_str.to_string()))
            }
            Self::Twitch => {
              let decoded = decode_token::<TwitchClaims>(token, &jwk).unwrap();
              let email = decoded.custom.email.to_string();
              let nonce = decoded.custom.nonce.to_string();
              let exp = decoded.expiration.unwrap().timestamp().to_string();
              let iat = decoded.issued_at.unwrap().timestamp().to_string();
              Ok((email, nonce, exp, iat, jwk_str.to_string()))
          }
            Self::Test => {
                let decoded = decode_token::<TestClaims>(token, &jwk).unwrap();
                let email = decoded.custom.email.to_string();
                let nonce = decoded.custom.nonce.to_string();
                let exp = decoded.expiration.unwrap().timestamp().to_string();
                let iat = decoded.issued_at.unwrap().timestamp().to_string();
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
            "test" => Self::Test,
            _ => panic!("invalid identity provider"),
        }
    }
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct TwitchClaims {
    pub aud: String,
    pub exp: i64,
    pub iat: i64,
    pub iss: String,
    pub sub: String,
    pub email: String,
    pub nonce: String,
    pub preferred_username: Option<String>,
    pub picture: Option<String>,
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

fn decode_token<T>(token: &str, keys: &JwkKeys) -> Result<jwt_compact::Claims<T>, OidcErr>
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

    // Ok(claims)
    Ok(res.unwrap().claims().clone())
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
              "key_ops": [
                "verify"
              ],
              "kty": "RSA",
              "n": "t50xn1bqloo0peLNX9mieuuyBEVIurn1Zzy41F9R5bn66KmhtKOCBWFXQAGD4IWphqlut0qDaWavENcamgl-bpriCSgiatIi61nq2CQ9pZzH4lGGp3sIYsTuSoEz8jSJKZ28ErGe9QPrAooX28X0l83fiRPBD22lqYRktSQPUNja_dB5CsmmSXBcb-jby5ubNLoAG7tCt_3IFvAfVWECcvsNX-_E8zOcB9FjQbusx3nPANXeWS8aN_hgMKqNyYtXrX6SPh0vjukDxLEj8o71C0Zb1WTGaHAt3lFVU-WLgAJlwCc5l_EpUE0oFzCPIry3afblbHdPembY25J4D-jMTQ",
              "use": "sig",
              "kid": "8725d08a4b35982092e9f8a50797118c"
             }
          ]
        }
        "#;

    #[test]
    fn test_validate_test_jwt_valid_token() {
        let test_keys: JwkKeys = serde_json::from_str(&TEST_PUB_JWK).unwrap();
        let jwt = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ijg3MjVkMDhhNGIzNTk4MjA5MmU5ZjhhNTA3OTcxMThjIn0.eyJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJub25jZSI6IjB4MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMCIsImlhdCI6MTkxNTEwODU5NywiZXhwIjoxOTE1MTEyMTk3fQ.QmJMTvOCX972kNiwLCe8jxwd1KRG8NwvI-r5YqkUwJvk-EviFJFRw2xWrBwnJh-ggWCmbMhiF6zxauSeuf5DcWdujaM6n3k5fVawo5fDBOhlAeoqwl-mYZIrYUmAjZainnNSmH6_NN7jd7eT3kh0bijGNbLAAvUc1_rZ52XOpUUYgAiNwUDwiafDZpGOQ5zN53kIoqabbR1nDsNJzNMxs84rax473FixyfgnXJPaxBuceSkEFYgDMcicaCZzEjZ1xOIrp_KwuBj6eQWGesGGJXyQpWPB3R_XOgYQpZc1l3Usozz4M4e39GXV03z2izjTrWT4XF_Si1lvO9VAkAEIsw";
        let decoded = decode_token::<super::TestClaims>(&jwt, &test_keys).unwrap();

        assert_eq!(&decoded.custom.email, "test@example.com");
        assert_eq!(
            &decoded.custom.nonce,
            "0x0000000000000000000000000000000000000000"
        );
    }

    #[test]
    #[should_panic]
    fn test_fail_invalid_test_token() {
        let test_keys: JwkKeys = serde_json::from_str(&TEST_PUB_JWK).unwrap();
        let jwt = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxxx";
        decode_token::<super::TestClaims>(&jwt, &test_keys).unwrap();
    }
}
