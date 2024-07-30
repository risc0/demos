import crypto from "crypto";

function clean(str: string) {
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export function generateChallenge() {
  return clean(crypto.randomBytes(32).toString("base64"));
}
