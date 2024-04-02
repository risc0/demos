export type Token = {
  address: `0x${string}`;
  name: string;
  icon: string;
  decimals: number;
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
