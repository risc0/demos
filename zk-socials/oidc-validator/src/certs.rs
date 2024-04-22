pub static GOOGLE_PUB_JWK: &str = r#"
{
  "keys": [
    {
      "e": "AQAB",
      "use": "sig",
      "kid": "6ce11aecf9eb14024a44bbfd1bcf8b32a12287fa",
      "n": "w1Tonp1EkpYfTTYROKafxaqQjZXHem6kMH4g-AgQvHIGz91XD4j4WDIxwik9FhRnYG9nVqbYV8LI5Z7cZrmWx89UVl-N5svzGFAdX1_6FAQnc1EjvaaaU0vBQU6ZOusWND4YFg-b9T5uk4p1rITwv_rCgIq3TS5vA-EuERGOmfFfNdsRC6FN1W7fj1LB2mSAzgezeSSqnP9Blirvg99zNhCBlltWvS0aXsmCuVn13-xdnmQb0W9sB1l6vFso5jCTpUjDX3t1VlHYdqBSxayhMGW3AK3O4kUrYPMK6C6O-XGgcwwLcYAw70fytm-YnwXUvxBtaaq8wgsuE7jPcaVyPw",
      "alg": "RS256",
      "kty": "RSA"
    },
    {
      "alg": "RS256",
      "kid": "e1b93c640144b84bd05bf296d67262b6bc61a487",
      "e": "AQAB",
      "kty": "RSA",
      "use": "sig",
      "n": "s3ISX-6xYMEnFE-ByXD8c5yYoxpwAHVjolNCcan1xbAmvBV6tjwB1H_SOwb9NF2ynTPyd5Z9W41KVhmWpBSNvZ8NLDGpLsUWfYpy8S2HcA2Q2cqNf32yybCOYifGvFTDZJJ5CMYF36KFsFTJMW1lKU4ydSv6PZ4djrpUP4JKsn4Kh5W0eQOjBH6P5K1vuIU7zHEsnhBKvmJhaYXXMw4JR3jYEObcRzUCVgs8lV6xsjzn71imwINwPchn5G2Ke7Mpfg4ANACnsNEJSzJjEYTsARSIxfwDfwdK_yPruQgbay2lJ0-Dr8s0Ctl7ZzAxRI8WVwhtTFsDuPF4iG0ldBZjiw"
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
