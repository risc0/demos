use borsh::{BorshDeserialize, BorshSerialize};
use ed25519_dalek::ed25519::signature::Verifier;
use std::fmt::{Debug, Display, Formatter};
use std::io::{Error, ErrorKind, Read, Write};
use std::str::FromStr;

#[derive(Debug, Clone, thiserror::Error)]
pub enum ParseKeyTypeError {
    #[error("unknown key type '{unknown_key_type}'")]
    UnknownKeyType { unknown_key_type: String },
}

#[derive(Debug, Clone, thiserror::Error)]
pub enum ParseKeyError {
    #[error("unknown key type '{unknown_key_type}'")]
    UnknownKeyType { unknown_key_type: String },
    #[error("invalid key length: expected the input of {expected_length} bytes, but {received_length} was given")]
    InvalidLength {
        expected_length: usize,
        received_length: usize,
    },
    #[error("invalid key data: {error_message}")]
    InvalidData { error_message: String },
}

impl From<ParseKeyTypeError> for ParseKeyError {
    fn from(err: ParseKeyTypeError) -> Self {
        match err {
            ParseKeyTypeError::UnknownKeyType { unknown_key_type } => {
                Self::UnknownKeyType { unknown_key_type }
            }
        }
    }
}

#[derive(Debug, Clone, thiserror::Error)]
pub enum ParseSignatureError {
    #[error("unknown key type '{unknown_key_type}'")]
    UnknownKeyType { unknown_key_type: String },
    #[error("invalid signature length: expected the input of {expected_length} bytes, but {received_length} was given")]
    InvalidLength {
        expected_length: usize,
        received_length: usize,
    },
    #[error("invalid signature data: {error_message}")]
    InvalidData { error_message: String },
}

impl From<ParseKeyTypeError> for ParseSignatureError {
    fn from(err: ParseKeyTypeError) -> Self {
        match err {
            ParseKeyTypeError::UnknownKeyType { unknown_key_type } => {
                Self::UnknownKeyType { unknown_key_type }
            }
        }
    }
}

#[derive(Debug, Copy, Clone, serde::Serialize, serde::Deserialize)]
pub enum KeyType {
    ED25519 = 0,
}

impl Display for KeyType {
    fn fmt(&self, f: &mut Formatter<'_>) -> Result<(), std::fmt::Error> {
        f.write_str(match self {
            KeyType::ED25519 => "ed25519",
        })
    }
}

impl FromStr for KeyType {
    type Err = ParseKeyTypeError;

    fn from_str(value: &str) -> Result<Self, Self::Err> {
        let lowercase_key_type = value.to_ascii_lowercase();
        match lowercase_key_type.as_str() {
            "ed25519" => Ok(KeyType::ED25519),
            _ => Err(Self::Err::UnknownKeyType {
                unknown_key_type: lowercase_key_type,
            }),
        }
    }
}

impl TryFrom<u8> for KeyType {
    type Error = ParseKeyTypeError;

    fn try_from(value: u8) -> Result<Self, Self::Error> {
        match value {
            0 => Ok(KeyType::ED25519),
            unknown_key_type => Err(Self::Error::UnknownKeyType {
                unknown_key_type: unknown_key_type.to_string(),
            }),
        }
    }
}

fn split_key_type_data(value: &str) -> Result<(KeyType, &str), ParseKeyTypeError> {
    if let Some((prefix, key_data)) = value.split_once(':') {
        Ok((KeyType::from_str(prefix)?, key_data))
    } else {
        // If there is no prefix then we Default to ED25519.
        Ok((KeyType::ED25519, value))
    }
}

#[derive(Clone, Eq, Ord, PartialEq, PartialOrd, derive_more::AsRef, derive_more::From)]
#[as_ref(forward)]
pub struct ED25519PublicKey(pub [u8; ed25519_dalek::PUBLIC_KEY_LENGTH]);

impl TryFrom<&[u8]> for ED25519PublicKey {
    type Error = ParseKeyError;

    fn try_from(data: &[u8]) -> Result<Self, Self::Error> {
        data.try_into()
            .map(Self)
            .map_err(|_| Self::Error::InvalidLength {
                expected_length: ed25519_dalek::PUBLIC_KEY_LENGTH,
                received_length: data.len(),
            })
    }
}

impl std::fmt::Debug for ED25519PublicKey {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> Result<(), std::fmt::Error> {
        Display::fmt(&Bs58(&self.0), f)
    }
}

/// Public key container supporting different curves.
#[derive(Clone, PartialEq, PartialOrd, Ord, Eq)]
pub enum PublicKey {
    /// 256 bit elliptic curve based public-key.
    ED25519(ED25519PublicKey),
}

impl Display for PublicKey {
    fn fmt(&self, fmt: &mut Formatter) -> std::fmt::Result {
        let (key_type, key_data) = match self {
            PublicKey::ED25519(public_key) => (KeyType::ED25519, &public_key.0[..]),
        };
        write!(fmt, "{}:{}", key_type, Bs58(key_data))
    }
}

impl Debug for PublicKey {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> Result<(), std::fmt::Error> {
        Display::fmt(self, f)
    }
}

impl BorshSerialize for PublicKey {
    fn serialize<W: Write>(&self, writer: &mut W) -> Result<(), Error> {
        match self {
            PublicKey::ED25519(public_key) => {
                BorshSerialize::serialize(&0u8, writer)?;
                writer.write_all(&public_key.0)?;
            }
        }
        Ok(())
    }
}

impl BorshDeserialize for PublicKey {
    fn deserialize_reader<R: Read>(rd: &mut R) -> std::io::Result<Self> {
        let key_type = KeyType::try_from(u8::deserialize_reader(rd)?)
            .map_err(|err| Error::new(ErrorKind::InvalidData, err.to_string()))?;
        match key_type {
            KeyType::ED25519 => Ok(PublicKey::ED25519(ED25519PublicKey(
                BorshDeserialize::deserialize_reader(rd)?,
            ))),
        }
    }
}

impl serde::Serialize for PublicKey {
    fn serialize<S>(
        &self,
        serializer: S,
    ) -> Result<<S as serde::Serializer>::Ok, <S as serde::Serializer>::Error>
    where
        S: serde::Serializer,
    {
        serializer.collect_str(self)
    }
}

impl<'de> serde::Deserialize<'de> for PublicKey {
    fn deserialize<D>(deserializer: D) -> Result<Self, <D as serde::Deserializer<'de>>::Error>
    where
        D: serde::Deserializer<'de>,
    {
        let s = <String as serde::Deserialize>::deserialize(deserializer)?;
        s.parse()
            .map_err(|err: ParseKeyError| serde::de::Error::custom(err.to_string()))
    }
}

impl FromStr for PublicKey {
    type Err = ParseKeyError;

    fn from_str(value: &str) -> Result<Self, Self::Err> {
        let (key_type, key_data) = split_key_type_data(value)?;
        Ok(match key_type {
            KeyType::ED25519 => Self::ED25519(ED25519PublicKey(decode_bs58(key_data)?)),
        })
    }
}

impl From<ED25519PublicKey> for PublicKey {
    fn from(ed25519: ED25519PublicKey) -> Self {
        Self::ED25519(ed25519)
    }
}

#[derive(Clone, Eq)]
// This is actually a keypair, because ed25519_dalek api only has keypair.sign
// From ed25519_dalek doc: The first SECRET_KEY_LENGTH of bytes is the SecretKey
// The last PUBLIC_KEY_LENGTH of bytes is the public key, in total it's KEYPAIR_LENGTH
pub struct ED25519SecretKey(pub [u8; ed25519_dalek::KEYPAIR_LENGTH]);

impl PartialEq for ED25519SecretKey {
    fn eq(&self, other: &Self) -> bool {
        self.0[..ed25519_dalek::SECRET_KEY_LENGTH] == other.0[..ed25519_dalek::SECRET_KEY_LENGTH]
    }
}

impl std::fmt::Debug for ED25519SecretKey {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> Result<(), std::fmt::Error> {
        Display::fmt(&Bs58(&self.0[..ed25519_dalek::SECRET_KEY_LENGTH]), f)
    }
}

/// Signature container supporting different curves.
#[derive(Clone, PartialEq, Eq)]
pub enum Signature {
    ED25519(ed25519_dalek::Signature),
}

impl Signature {
    /// Verifies that this signature is indeed signs the data with given public key.
    /// Also if public key doesn't match on the curve returns `false`.
    pub fn verify(&self, data: &[u8], public_key: &PublicKey) -> bool {
        match (&self, public_key) {
            (Signature::ED25519(signature), PublicKey::ED25519(public_key)) => {
                match ed25519_dalek::VerifyingKey::from_bytes(&public_key.0) {
                    Err(_) => false,
                    Ok(public_key) => public_key.verify(data, signature).is_ok(),
                }
            }
        }
    }
}

impl BorshSerialize for Signature {
    fn serialize<W: Write>(&self, writer: &mut W) -> Result<(), Error> {
        match self {
            Signature::ED25519(signature) => {
                BorshSerialize::serialize(&0u8, writer)?;
                writer.write_all(&signature.to_bytes())?;
            }
        }
        Ok(())
    }
}

impl BorshDeserialize for Signature {
    fn deserialize_reader<R: Read>(rd: &mut R) -> std::io::Result<Self> {
        let key_type = KeyType::try_from(u8::deserialize_reader(rd)?)
            .map_err(|err| Error::new(ErrorKind::InvalidData, err.to_string()))?;
        match key_type {
            KeyType::ED25519 => {
                let array: [u8; ed25519_dalek::SIGNATURE_LENGTH] =
                    BorshDeserialize::deserialize_reader(rd)?;
                // Sanity-check that was performed by ed25519-dalek in from_bytes before version 2,
                // but was removed with version 2. It is not actually any good a check, but we have
                // it here in case we need to keep backward compatibility. Maybe this check is not
                // actually required, but please think carefully before removing it.
                if array[ed25519_dalek::SIGNATURE_LENGTH - 1] & 0b1110_0000 != 0 {
                    return Err(Error::new(ErrorKind::InvalidData, "signature error"));
                }
                Ok(Signature::ED25519(ed25519_dalek::Signature::from_bytes(
                    &array,
                )))
            }
        }
    }
}

impl Display for Signature {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> Result<(), std::fmt::Error> {
        let buf;
        let (key_type, key_data) = match self {
            Signature::ED25519(signature) => {
                buf = signature.to_bytes();
                (KeyType::ED25519, &buf[..])
            }
        };
        write!(f, "{}:{}", key_type, Bs58(key_data))
    }
}

impl Debug for Signature {
    fn fmt(&self, f: &mut Formatter<'_>) -> Result<(), std::fmt::Error> {
        Display::fmt(self, f)
    }
}

impl serde::Serialize for Signature {
    fn serialize<S>(
        &self,
        serializer: S,
    ) -> Result<<S as serde::Serializer>::Ok, <S as serde::Serializer>::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

impl FromStr for Signature {
    type Err = ParseSignatureError;

    fn from_str(value: &str) -> Result<Self, Self::Err> {
        let (sig_type, sig_data) = split_key_type_data(value)?;
        Ok(match sig_type {
            KeyType::ED25519 => {
                let data = decode_bs58::<{ ed25519_dalek::SIGNATURE_LENGTH }>(sig_data)?;
                let sig = ed25519_dalek::Signature::from_bytes(&data);
                Signature::ED25519(sig)
            }
        })
    }
}

impl<'de> serde::Deserialize<'de> for Signature {
    fn deserialize<D>(deserializer: D) -> Result<Self, <D as serde::Deserializer<'de>>::Error>
    where
        D: serde::Deserializer<'de>,
    {
        let s = <String as serde::Deserialize>::deserialize(deserializer)?;
        s.parse()
            .map_err(|err: ParseSignatureError| serde::de::Error::custom(err.to_string()))
    }
}

/// Helper struct which provides Display implementation for bytes slice
/// encoding them using base58.
// TODO(mina86): Get rid of it once bs58 has this feature.  There’s currently PR
// for that: https://github.com/Nullus157/bs58-rs/pull/97
struct Bs58<'a>(&'a [u8]);

impl<'a> core::fmt::Display for Bs58<'a> {
    fn fmt(&self, fmt: &mut core::fmt::Formatter<'_>) -> core::fmt::Result {
        debug_assert!(self.0.len() <= 65);
        // The largest buffer we’re ever encoding is 65-byte long.  Base58
        // increases size of the value by less than 40%.  96-byte buffer is
        // therefore enough to fit the largest value we’re ever encoding.
        let mut buf = [0u8; 96];
        let len = bs58::encode(self.0).into(&mut buf[..]).unwrap();
        let output = &buf[..len];
        // SAFETY: we know that alphabet can only include ASCII characters
        // thus our result is an ASCII string.
        fmt.write_str(unsafe { std::str::from_utf8_unchecked(output) })
    }
}

/// Helper which decodes fixed-length base58-encoded data.
///
/// If the encoded string decodes into a buffer of different length than `N`,
/// returns error.  Similarly returns error if decoding fails.
fn decode_bs58<const N: usize>(encoded: &str) -> Result<[u8; N], DecodeBs58Error> {
    let mut buffer = [0u8; N];
    decode_bs58_impl(&mut buffer[..], encoded)?;
    Ok(buffer)
}

fn decode_bs58_impl(dst: &mut [u8], encoded: &str) -> Result<(), DecodeBs58Error> {
    let expected = dst.len();
    match bs58::decode(encoded).into(dst) {
        Ok(received) if received == expected => Ok(()),
        Ok(received) => Err(DecodeBs58Error::BadLength { expected, received }),
        Err(bs58::decode::Error::BufferTooSmall) => Err(DecodeBs58Error::BadLength {
            expected,
            received: expected.saturating_add(1),
        }),
        Err(err) => Err(DecodeBs58Error::BadData(err.to_string())),
    }
}

enum DecodeBs58Error {
    BadLength { expected: usize, received: usize },
    BadData(String),
}

impl std::convert::From<DecodeBs58Error> for ParseKeyError {
    fn from(err: DecodeBs58Error) -> Self {
        match err {
            DecodeBs58Error::BadLength { expected, received } => ParseKeyError::InvalidLength {
                expected_length: expected,
                received_length: received,
            },
            DecodeBs58Error::BadData(error_message) => Self::InvalidData { error_message },
        }
    }
}

impl std::convert::From<DecodeBs58Error> for ParseSignatureError {
    fn from(err: DecodeBs58Error) -> Self {
        match err {
            DecodeBs58Error::BadLength { expected, received } => Self::InvalidLength {
                expected_length: expected,
                received_length: received,
            },
            DecodeBs58Error::BadData(error_message) => Self::InvalidData { error_message },
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // #[test]
    // fn test_sign_verify() {
    //     for key_type in [KeyType::ED25519] {
    //         let secret_key = SecretKey::from_random(key_type);
    //         let public_key = secret_key.public_key();
    //         use sha2::Digest;
    //         let data = sha2::Sha256::digest(b"123").to_vec();
    //         let signature = secret_key.sign(&data);
    //         assert!(signature.verify(&data, &public_key));
    //     }
    // }

    // #[test]
    // fn test_json_serialize_ed25519() {
    //     let sk = SecretKey::from_seed(KeyType::ED25519, "test");
    //     let pk = sk.public_key();
    //     let expected = "\"ed25519:DcA2MzgpJbrUATQLLceocVckhhAqrkingax4oJ9kZ847\"";
    //     assert_eq!(serde_json::to_string(&pk).unwrap(), expected);
    //     assert_eq!(pk, serde_json::from_str(expected).unwrap());
    //     assert_eq!(
    //         pk,
    //         serde_json::from_str("\"DcA2MzgpJbrUATQLLceocVckhhAqrkingax4oJ9kZ847\"").unwrap()
    //     );
    //     let pk2: PublicKey = pk.to_string().parse().unwrap();
    //     assert_eq!(pk, pk2);

    //     let expected = "\"ed25519:3KyUuch8pYP47krBq4DosFEVBMR5wDTMQ8AThzM8kAEcBQEpsPdYTZ2FPX5ZnSoLrerjwg66hwwJaW1wHzprd5k3\"";
    //     assert_eq!(serde_json::to_string(&sk).unwrap(), expected);
    //     assert_eq!(sk, serde_json::from_str(expected).unwrap());

    //     let signature = sk.sign(b"123");
    //     let expected = "\"ed25519:3s1dvZdQtcAjBksMHFrysqvF63wnyMHPA4owNQmCJZ2EBakZEKdtMsLqrHdKWQjJbSRN6kRknN2WdwSBLWGCokXj\"";
    //     assert_eq!(serde_json::to_string(&signature).unwrap(), expected);
    //     assert_eq!(signature, serde_json::from_str(expected).unwrap());
    //     let signature_str: String = signature.to_string();
    //     let signature2: Signature = signature_str.parse().unwrap();
    //     assert_eq!(signature, signature2);
    // }

    // #[test]
    // fn test_json_serialize_secp256k1() {
    //     use sha2::Digest;
    //     let data = sha2::Sha256::digest(b"123").to_vec();

    //     let sk = SecretKey::from_seed(KeyType::SECP256K1, "test");
    //     let pk = sk.public_key();
    //     let expected = "\"secp256k1:5ftgm7wYK5gtVqq1kxMGy7gSudkrfYCbpsjL6sH1nwx2oj5NR2JktohjzB6fbEhhRERQpiwJcpwnQjxtoX3GS3cQ\"";
    //     assert_eq!(serde_json::to_string(&pk).unwrap(), expected);
    //     assert_eq!(pk, serde_json::from_str(expected).unwrap());
    //     let pk2: PublicKey = pk.to_string().parse().unwrap();
    //     assert_eq!(pk, pk2);

    //     let expected = "\"secp256k1:X4ETFKtQkSGVoZEnkn7bZ3LyajJaK2b3eweXaKmynGx\"";
    //     assert_eq!(serde_json::to_string(&sk).unwrap(), expected);
    //     assert_eq!(sk, serde_json::from_str(expected).unwrap());

    //     let signature = sk.sign(&data);
    //     let expected = "\"secp256k1:5N5CB9H1dmB9yraLGCo4ZCQTcF24zj4v2NT14MHdH3aVhRoRXrX3AhprHr2w6iXNBZDmjMS1Ntzjzq8Bv6iBvwth6\"";
    //     assert_eq!(serde_json::to_string(&signature).unwrap(), expected);
    //     assert_eq!(signature, serde_json::from_str(expected).unwrap());
    //     let signature_str: String = signature.to_string();
    //     let signature2: Signature = signature_str.parse().unwrap();
    //     assert_eq!(signature, signature2);
    // }

    // #[test]
    // fn test_borsh_serialization() {
    //     use sha2::Digest;
    //     let data = sha2::Sha256::digest(b"123").to_vec();
    //     for key_type in [KeyType::ED25519, KeyType::SECP256K1] {
    //         let sk = SecretKey::from_seed(key_type, "test");
    //         let pk = sk.public_key();
    //         let bytes = borsh::to_vec(&pk).unwrap();
    //         assert_eq!(PublicKey::try_from_slice(&bytes).unwrap(), pk);

    //         let signature = sk.sign(&data);
    //         let bytes = borsh::to_vec(&signature).unwrap();
    //         assert_eq!(Signature::try_from_slice(&bytes).unwrap(), signature);

    //         assert!(PublicKey::try_from_slice(&[0]).is_err());
    //         assert!(Signature::try_from_slice(&[0]).is_err());
    //     }
    // }

    #[test]
    fn test_invalid_data() {
        let invalid = "\"secp256k1:2xVqteU8PWhadHTv99TGh3bSf\"";
        assert!(serde_json::from_str::<PublicKey>(invalid).is_err());
        // assert!(serde_json::from_str::<SecretKey>(invalid).is_err());
        assert!(serde_json::from_str::<Signature>(invalid).is_err());
    }
}
