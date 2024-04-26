pub static GOOGLE_PUB_JWK: &str = r#"
{
  "keys": [
    {
      "kty": "RSA",
      "kid": "6ce11aecf9eb14024a44bbfd1bcf8b32a12287fa",
      "e": "AQAB",
      "use": "sig",
      "alg": "RS256",
      "n": "w1Tonp1EkpYfTTYROKafxaqQjZXHem6kMH4g-AgQvHIGz91XD4j4WDIxwik9FhRnYG9nVqbYV8LI5Z7cZrmWx89UVl-N5svzGFAdX1_6FAQnc1EjvaaaU0vBQU6ZOusWND4YFg-b9T5uk4p1rITwv_rCgIq3TS5vA-EuERGOmfFfNdsRC6FN1W7fj1LB2mSAzgezeSSqnP9Blirvg99zNhCBlltWvS0aXsmCuVn13-xdnmQb0W9sB1l6vFso5jCTpUjDX3t1VlHYdqBSxayhMGW3AK3O4kUrYPMK6C6O-XGgcwwLcYAw70fytm-YnwXUvxBtaaq8wgsuE7jPcaVyPw"
    },
    {
      "alg": "RS256",
      "kty": "RSA",
      "use": "sig",
      "kid": "e1b93c640144b84bd05bf296d67262b6bc61a487",
      "e": "AQAB",
      "n": "s3ISX-6xYMEnFE-ByXD8c5yYoxpwAHVjolNCcan1xbAmvBV6tjwB1H_SOwb9NF2ynTPyd5Z9W41KVhmWpBSNvZ8NLDGpLsUWfYpy8S2HcA2Q2cqNf32yybCOYifGvFTDZJJ5CMYF36KFsFTJMW1lKU4ydSv6PZ4djrpUP4JKsn4Kh5W0eQOjBH6P5K1vuIU7zHEsnhBKvmJhaYXXMw4JR3jYEObcRzUCVgs8lV6xsjzn71imwINwPchn5G2Ke7Mpfg4ANACnsNEJSzJjEYTsARSIxfwDfwdK_yPruQgbay2lJ0-Dr8s0Ctl7ZzAxRI8WVwhtTFsDuPF4iG0ldBZjiw"
    }
  ]
}
"#;

pub static FACEBOOK_PUB_JWK: &str = r#"
{
   "keys": [
      {
         "kid": "ec11d50341c08e82899650e6afcc6668f2a0a420",
         "kty": "RSA",
         "alg": "RS256",
         "use": "sig",
         "n": "-rJ0HvlxiqOcwfpP6LsAYo0aaGNmohEBFr1JuWCGVvnPb3Z5Akd5w_bxQMRlOMot15IyrhWFonWCFr9H02f9E9GOEaroAj0zxQnCXcuGWb1BFN6RfoGNFpee1MqSDV3ikSIsSI3JL-z_1uBtDsQ1AtbYMKsB572v64bapW4WjDjekz0pQ-ePizVWm9mNNQxkA_fh3p1hW3KssXgnasWbKJODT5I6hnzd4whxj22oLE8xJCYTFeouk86teKI-nvK-LmaxoetBhnDn3QS5pN_oiIfDqjKPXGazeG2qwGAE8VPeISPvzYIstGbEh3NCzFEoB7a7APF1nLEo7Lco9aWjYQ",
         "e": "AQAB"
      },
      {
         "kid": "27f14bf9e3e9d1c7ba691c9ee91a5fd92eb3d40c",
         "kty": "RSA",
         "alg": "RS256",
         "use": "sig",
         "n": "wPGO-HmGoGeygkxUDtAgQu5vZTElhbHrbNUhIae0dUwpTDHHYJKY6nskTYLN7Sqs4x3zXUJr6SilbBIUAfKRqhDkDPWXeas1oxZEqMaD2aWikTPh0BJCc-_YD8TSLoUnQAacEig7342yYAVQzgX-UxY4tSkeA06qbTD459xoeOEPnQEF6ODhxJGnakJYKqRUnsSDo4wJ65ISKx8ctNXtxXKcZP9rvNfc7InOaJyKRoD0UlzBHGU5NeFN6UJFi1FjgeCZYOS7VjR6fXmRezvWqK1NUZxno8vAayifYPqt-1lN59Vvzfv2nrusAX4r4V1v8c5jsu2pspcJRBVoFVRAjw",
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
