export type Token = {
  address: `0x${string}`;
  name: string;
  icon: string;
  decimals: number;
};

export type SnarkReceipt = {
  snark: {
    a: [string, string];
    b: [[string, string], [string, string]];
    c: [string, string];
    public: [string, string, string, string];
  };
  post_state_digest: string;
  journal: string;
};

export type GoogleTokenPayload = {
  iss: string;
  azp: string;
  aud: string;
  sub: string;
  hd: string;
  email: string;
  email_verified: boolean;
  at_hash: string;
  nonce: string;
  iat: number;
  exp: number;
};
