use jwt_compact::{
    alg::{Rsa, RsaPublicKey},
    jwk::{JsonWebKey, KeyType},
    AlgorithmExt, UntrustedToken,
};
use serde::{Deserialize, Serialize};
use thiserror::Error;

//  Google oauth2 cert
//  From: https://www.googleapis.com/oauth2/v3/certs
static GOOGLE_PUB_JWK: &str = r#"
    {
      "keys": [
        {
          "n": "4VCFlBofjCVMvApNQ97Y-473vGov--idNmGQioUg0PXJv0oRaAClXWINwNaMuLIegChkWNNpbvsrdJpapSNHra_cdAoSrhd_tLNWDtBGm6tsVZM8vciggnJHuJwMtGwZUiUjHeYWebaJrZmWh1WemYluQgyxgDAY_Rf7OdIthAlwsAzvmObuByoykU-74MyMJVal7QzATaEh0je7BqoDEafG750UrMwzSnACjlZvnmrCHR4KseT4Tv4Fa0rCc_wpRP-Uuplri_EbMSr15OXoGTDub6UM8_0LIjNL0yRqh5JpesbOtxW_OU1bMeSUOJeAZzAA4-vq_l-jrDlelHxZxw",
          "e": "AQAB",
          "kid": "5b3706960e3e60024a2655e78cfa63f87c97d309",
          "use": "sig",
          "kty": "RSA",
          "alg": "RS256"
        },
        {
          "alg": "RS256",
          "n": "vZgPf9nruMYY71q5pgThDwmk6Z3DD7cwN-Z52__b4xHeY95wOeKpjSliaI8K1PpeBbm4NykHm6UmfB_pCw5P2owpHZ8JEF2FCeDFKcOtZOzolYVgKZY8Sunqxcr3Sm0n73jbGcPgqu5PpjnOR4WkZCnpmDEZ34KNQat_MYYNUZZE2RlbpppNHiLatdiLW-rWi9YCmpsE4EIdd-XKIyZpQZRKaAl-w72BboTD_Koq2CkAOZOab73Q_G5FVT0NrxEWqP6artVfg5Dc_VVPnvtsC9yMe8lNgU3c3a-mE-vzE9oxAjr0s8Ek0Ih_sv-CbWL8xHiI7MOygIPG_aQqvMhPaQ",
          "kid": "0e72da1df501ca6f756bf103fd7c720294772506",
          "e": "AQAB",
          "use": "sig",
          "kty": "RSA"
        }
      ]
    }
    "#;

#[derive(Deserialize, Serialize)]
struct JwkKeys<'a> {
    keys: Vec<ExtendedJsonWebKey<'a, Extra>>,
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

    let cert = serde_json::from_str::<JwkKeys>(GOOGLE_PUB_JWK).unwrap();

    // Find the key with the matching key_id
    let key = cert
        .keys
        .iter()
        .find(|key| key.extra.key_id == key_id)
        .ok_or(OidcErr::CertificateNotFoundError)?;

    let key_type = key.base.key_type();
    let (alg, vkey) = match key_type {
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
        const GOOGLE_JWT: &str = r#"eyJhbGciOiJSUzI1NiIsImtpZCI6IjViMzcwNjk2MGUzZTYwMDI0YTI2NTVlNzhjZmE2M2Y4N2M5N2QzMDkiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJuYmYiOjE2OTk5NDU4NzMsImF1ZCI6Ijg3Mzc4NzMzMTI2Mi03YmZsajRmaG91cDFlbmxiMDU1Z2dpcHFjaml1cTY4dS5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsInN1YiI6IjEwODM3ODE1MTk2ODc0Nzg5ODczMyIsIm5vbmNlIjoiMHhlZmRGOTg2MUYzZURjMjQwNDY0M0I1ODgzNzhGRTI0MkZDYWRFNjU4IiwiaGQiOiJyaXNjemVyby5jb20iLCJlbWFpbCI6ImhhbnNAcmlzY3plcm8uY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF6cCI6Ijg3Mzc4NzMzMTI2Mi03YmZsajRmaG91cDFlbmxiMDU1Z2dpcHFjaml1cTY4dS5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsIm5hbWUiOiJIYW5zIE1hcnRpbiIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NJQ0tlRDRnY0g3bnJTaDdncVFUMXJrMG1aUlNTcHlMMjhhTDRyekRKMnA9czk2LWMiLCJnaXZlbl9uYW1lIjoiSGFucyIsImZhbWlseV9uYW1lIjoiTWFydGluIiwiaWF0IjoxNjk5OTQ2MTczLCJleHAiOjE2OTk5NDk3NzMsImp0aSI6IjgxZjIzZTQwNDAwNmZkMmUzMTgxZTliYzkxNDMzZjA0NDNkNGI4MjIifQ.rNsLRtF22R6cvRbDksAAl5p3e1sAFii35xZWHUnVbLV_1ciQV7SpPIg-XkP_kBp7hqnYz1IGFm5Ce2L8Omm-5Z9onK8prsBKoJf5cGVJSwAy9NYtmRPQIcXOfGf6q1i04L_LBxnVnHx1VrL0ji8vJ7Tf99xO1qEjgy_VzhPBaoYJQlMkkundbCs84GUKrTnb7jPbRA8XalY4Wu-LHCl_f_degzRQZKqdRYiSBHUwYaDIX-X6wd3wdQZrlfTrzI1tZAQcwT5vG8rqz2XCx4ENFbnC_AX_2NCSlXAe3IRTH3nb37U38JPHj7d_DwJDhnjwrM4hVlZ9uY43EpoS8YGuvQ"#;

        let decoded = decode_token::<GoogleClaims>(GOOGLE_JWT).unwrap();

        assert_eq!(&decoded.email, "hans@risczero.com");
        assert_eq!(&decoded.nonce, "0xefdF9861F3eDc2404643B588378FE242FCadE658");
    }
}
