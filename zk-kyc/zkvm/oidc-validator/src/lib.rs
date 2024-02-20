mod certs;
use certs::IDME_JWKS;
use jwt_compact::{
    alg::{Rsa, RsaPublicKey},
    jwk::{JsonWebKey, KeyType},
    AlgorithmExt, Claims, UntrustedToken,
};
use lazy_static::lazy_static;
use serde::{Deserialize, Serialize};
use thiserror::Error;

lazy_static! {
    static ref IDME_KEYS: JwkKeys = serde_json::from_str(IDME_JWKS).expect("Failed to parse JWK");
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
    IDMe,
}

pub struct PublicOutput {
    pub exp: u64,
    pub iat: u64,
    pub nonce: String,
}

impl IdentityProvider {
    pub fn validate(&self, token: &str) -> Result<PublicOutput, OidcErr> {
        match self {
            Self::IDMe => {
                let decoded = decode_token::<IDMeClaims>(token, &IDME_KEYS).unwrap();
                Ok(PublicOutput {
                    exp: decoded.expiration.unwrap().timestamp() as u64,
                    iat: decoded.issued_at.unwrap().timestamp() as u64,
                    nonce: decoded.custom.nonce,
                })
            }
        }
    }
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct IDMeClaims {
    pub iss: String,
    pub sub: String,
    pub aud: String,
    pub exp: Option<u64>,
    pub iat: Option<u64>,
    pub nonce: String,
    pub email: String,
    pub fname: String, // New field for first name
    pub lname: String, // New field for last name
    pub uuid: String,  // New field for UUID
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

fn decode_token<T>(token: &str, keys: &JwkKeys) -> Result<Claims<T>, OidcErr>
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

    Ok(res.unwrap().claims().clone())
}

#[cfg(test)]
pub mod test_oidc_validator {

    use crate::IDME_KEYS;
    use std::env;

    use super::{decode_token, IDMeClaims};

    #[test]
    fn test_validate_idme_jwt_valid_token() {
        let jwt = env::var("jwt").expect("jwt not set");
        let decoded = decode_token::<IDMeClaims>(&jwt, &IDME_KEYS).unwrap();

        assert_eq!(&decoded.email, "hans@risczero.com");
        assert_eq!(&decoded.nonce, "undefined");
        assert_eq!(&decoded.fname, "JACK");
        assert_eq!(&decoded.lname, "FROST");
        assert_eq!(&decoded.uuid, "d4483f6af48d4431b7ae100c0db434cc");
    }
}
