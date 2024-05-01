pub static GOOGLE_PUB_JWK: &str = r#"
{
  "keys": [
    {
      "e": "AQAB",
      "alg": "RS256",
      "kty": "RSA",
      "use": "sig",
      "kid": "e1b93c640144b84bd05bf296d67262b6bc61a487",
      "n": "s3ISX-6xYMEnFE-ByXD8c5yYoxpwAHVjolNCcan1xbAmvBV6tjwB1H_SOwb9NF2ynTPyd5Z9W41KVhmWpBSNvZ8NLDGpLsUWfYpy8S2HcA2Q2cqNf32yybCOYifGvFTDZJJ5CMYF36KFsFTJMW1lKU4ydSv6PZ4djrpUP4JKsn4Kh5W0eQOjBH6P5K1vuIU7zHEsnhBKvmJhaYXXMw4JR3jYEObcRzUCVgs8lV6xsjzn71imwINwPchn5G2Ke7Mpfg4ANACnsNEJSzJjEYTsARSIxfwDfwdK_yPruQgbay2lJ0-Dr8s0Ctl7ZzAxRI8WVwhtTFsDuPF4iG0ldBZjiw"
    },
    {
      "use": "sig",
      "kid": "ac3e3e558111c7c7a75c5b65134d22f63ee006d0",
      "alg": "RS256",
      "n": "puQJMii881LWwQ_OY2pOZx9RJTtpmUhAn2Z4_zrbQ9WmQqld0ufKesvwIAmuFIswzfOWxv1-ijZWwWrVafZ3MOnoB_UJFgjCPwJyfQiwwNMK80MfEm7mDO0qFlvrmLhhrYZCNFXYKDRibujCPF6wsEKcb3xFwBCH4UFaGmzsO0iJiqD2qay5rqYlucV4-kAIj4A6yrQyXUWWTlYwedbM5XhpuP1WxqO2rjHVLmwECUWqEScdktVhXXQ2CW6zvvyzbuaX3RBkr1w-J2U07vLZF5-RgnNjLv6WUNUwMuh-JbDU3tvmAahnVNyIcPRCnUjMk03kTqbSkZfu6sxWF0qNgw",
      "kty": "RSA",
      "e": "AQAB"
    }
  ]
}
"#;

pub static FACEBOOK_PUB_JWK: &str = r#"
{
  "keys": [
     {
        "kid": "d458ab5237807dc6718901e522cebcd8e8157791",
        "kty": "RSA",
        "alg": "RS256",
        "use": "sig",
        "n": "uPyWMhNfNsO9EtiraYI0tr78vnkiJmzsmAAUd8hLHF5vPXDn683aQKZQ2Ny5lObigNmbHI5tt5y0o5m0RuZjJTj081uWm7Z901boO-p4VLwEONzjh4vTp2ZQ7aMjo17kMBzInHqz9iruWeB94dEu_LKYdQnDI6rweD_-chWWTR4mc7xbeaNozLHYzjEisSrIM3xIry2lZv5Mh334ZoahcTXGouFtU2XV_HvStXthwhoAtizQK7s2yJlBz8qlQK2lFNojRzd95f2bkynRnIvcpoF-qHZbOBTCIf-6TLp23qShs-XvbCkwHMhzvCPxcuZx3GNfCQkyTxeM5IGIMlWZ8w",
        "e": "AQAB"
     },
     {
        "kid": "ec11d50341c08e82899650e6afcc6668f2a0a420",
        "kty": "RSA",
        "alg": "RS256",
        "use": "sig",
        "n": "-rJ0HvlxiqOcwfpP6LsAYo0aaGNmohEBFr1JuWCGVvnPb3Z5Akd5w_bxQMRlOMot15IyrhWFonWCFr9H02f9E9GOEaroAj0zxQnCXcuGWb1BFN6RfoGNFpee1MqSDV3ikSIsSI3JL-z_1uBtDsQ1AtbYMKsB572v64bapW4WjDjekz0pQ-ePizVWm9mNNQxkA_fh3p1hW3KssXgnasWbKJODT5I6hnzd4whxj22oLE8xJCYTFeouk86teKI-nvK-LmaxoetBhnDn3QS5pN_oiIfDqjKPXGazeG2qwGAE8VPeISPvzYIstGbEh3NCzFEoB7a7APF1nLEo7Lco9aWjYQ",
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
