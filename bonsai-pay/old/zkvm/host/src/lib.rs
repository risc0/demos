pub mod seal_serializer {
    //! Module for serializing seal structures

    use bonsai_sdk::alpha::responses::Groth16Seal;
    use hex;
    use serde::ser::SerializeStruct;
    use serde::{Serialize, Serializer};

    /// Serializes a vector of bytes as a hexadecimal string.
    /// Returns a result containing either the serialized object or an error.
    pub fn serialize_as_hex<S>(bytes: &Vec<u8>, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(&hex::encode(bytes))
    }

    /// Serializes a `Groth16Seal` struct, encoding its fields as hexadecimal strings.
    /// Returns a result containing either the serialized object or an error.
    pub fn serialize_groth16_seal<S>(groth: &Groth16Seal, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let mut s = serializer.serialize_struct("Groth16Seal", 4)?;
        s.serialize_field("a", &groth.a.iter().map(hex::encode).collect::<Vec<_>>())?;
        s.serialize_field(
            "b",
            &groth
                .b
                .iter()
                .map(|inner_vec| inner_vec.iter().map(hex::encode).collect::<Vec<_>>())
                .collect::<Vec<_>>(),
        )?;
        s.serialize_field("c", &groth.c.iter().map(hex::encode).collect::<Vec<_>>())?;
        s.serialize_field(
            "public",
            &groth.public.iter().map(hex::encode).collect::<Vec<_>>(),
        )?;
        s.end()
    }

    /// A wrapper struct for SnarkReceipts.
    ///
    /// This struct is used to serialize a `Groth16Seal` along with its associated
    /// `post_state_digest` and `journal`, both of which are serialized as hexadecimal strings.
    #[derive(Serialize)]
    pub struct SnarkReceiptWrapper<'a> {
        #[serde(serialize_with = "serialize_groth16_seal")]
        pub snark: &'a Groth16Seal,
        #[serde(serialize_with = "serialize_as_hex")]
        pub post_state_digest: &'a Vec<u8>,
        #[serde(serialize_with = "serialize_as_hex")]
        pub journal: &'a Vec<u8>,
    }
}
