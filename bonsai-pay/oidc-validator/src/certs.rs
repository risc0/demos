pub static GOOGLE_PUB_JWK: &str = r#"
{
  "keys": [
    {
      "kid": "1f40f0a8ef3d880978dc82f25c3ec317c6a5b781",
      "e": "AQAB",
      "alg": "RS256",
      "n": "tgkwz0K80MycaI2Dz_jHkErJ_IHUPTlx4LR_6wltAHQW_ZwhMzINNH8vbWo8P5F2YLDiIbuslF9y7Q3izsPX3XWQyt6LI8ZT4gmGXQBumYMKx2VtbmTYIysKY8AY7x5UCDO-oaAcBuKQvWc5E31kXm6d6vfaEZjrMc_KT3DsFdN0LcAkB-Q9oYcVl7YEgAN849ROKUs6onf7eukj1PHwDzIBgA9AExJaKen0wITvxQv3H_BRXB7m6hFkLbK5Jo18gl3UxJ7Em29peEwi8Psn7MuI7CwhFNchKhjZM9eaMX27tpDPqR15-I6CA5Zf94rabUGWYph5cFXKWPPr8dskQQ",
      "kty": "RSA",
      "use": "sig"
    },
    {
      "alg": "RS256",
      "use": "sig",
      "kid": "48a63bc4767f8550a532dc630cf7eb49ff397e7c",
      "n": "qwrzl06fwB6OIm62IxNG7NXNIDmgdBrvf09ob2Gsp6ZmAXgU4trHPUYrdBaAlU5aHpchXCf_mVL-U5dzRqeVFQsVqsj4PEIE6E5OPw8EwumP2fzLQSswpkKmJJKFcdncfQ730QBonRUEhKkIbiYdicJl5yTkORd0_BmfdLV98r-sEwEHN4lzTJ15-yw90ob_R6vAH4wPyCSN3Xe5_zV6R4ENL2NlKn2HT9lbV7HhtQongea8wfnthUhdZH38kI4SS5nAaCVNxEAzlvJtUIdCpSgjUgcbah-DwY39l4D800kLxkcF2CGXPSmpF8GPs1aWSsYupY8sTSy9qCFJFPFx8Q",
      "kty": "RSA",
      "e": "AQAB"
    }
  ]
}
"#;

pub static TEST_PUB_JWK: &str = r#"
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
