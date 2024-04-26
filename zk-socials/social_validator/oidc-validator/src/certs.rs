pub static GOOGLE_PUB_JWK: &str = r#"
{
  "keys": [
    {
      "alg": "RS256",
      "kty": "RSA",
      "e": "AQAB",
      "kid": "adf5e710edfebecbefa9a61495654d03c0b8edf8",
      "use": "sig",
      "n": "y48N6JB-AKq1-Rv4SkwBADU-hp4zXHU-NcCUwxD-aS9vr4EoT9qrjoJ-YmkaEpq9Bmu1yXZZK_h_9QS3xEsO8Rc_WSvIQCJtIaDQz8hxk4lUjUQjMB4Zf9vdTmf8KdktI9tCYCbuSbLC6TegjDM9kbl9CNs3m9wSVeO_5JXJQC0Jr-Oj7Gz9stXm0Co3f7RCxrD08kLelXaAglrd5TeGjZMyViC4cw1gPaj0Cj6knDn8UlzR_WuBpzs_ies5BrbzX-yht0WfnhXpdpiGNMbpKQD04MmPdMCYq8ENF7q5_Ok7dPsVj1vHA6vFGnf7qE3smD157szsnzn0NeXIbRMnuQ"
    },
    {
      "kty": "RSA",
      "n": "uhWRpJ3PNZaiBmq3P91A6QB0b28LeQvV-HI0TAEcN5nffQPm94w-hY2S6mThb7xXLCGHcP3bhpWl31giZJFlvzHe6db-TsPl8HSLgLIjMbMT8iYWqZPa2eodijEJrkO6SPex5jHLzSwGsoRdSfW8hFeTFQk8xtPXm7GlEEo9mFEKUAaArT9acdE8h53VR7ZkJkipiLCtx0rhySA2W4rEAcinLG3ApG709pOw6sVjA2IAQmZVYrfQ7curmFqKWL_F534kDhQJL2hMdrubhHcqCxetyi_U7WDWDkYCJ_CetjDsI0yfwB2sR01vn6LuDDo6ho8pWJcHOOvXYUnSMFAlew",
      "kid": "934a5816468b95703953d14e9f15df5d09a401e4",
      "use": "sig",
      "e": "AQAB",
      "alg": "RS256"
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
