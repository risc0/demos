declare global {
  interface CustomJwtSessionClaims {
    nonce?: string;
    email?: string;
  }
}

export default global;
