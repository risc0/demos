"use server";

import crypto from "crypto";
import { generateRegistrationOptions, verifyRegistrationResponse } from "@simplewebauthn/server";
import type { GenerateRegistrationOptionsOpts, VerifiedRegistrationResponse } from "@simplewebauthn/server";
import type { PublicKeyCredentialCreationOptionsJSON, RegistrationResponseJSON } from "@simplewebauthn/types";
import { v4 as uuidv4 } from "uuid";
import env from "~/env";

function clean(str: string) {
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function generateChallenge() {
  return clean(crypto.randomBytes(32).toString("base64"));
}

async function binaryToBase64url(bytes: Uint8Array) {
  let str = "";

  // biome-ignore lint/complexity/noForEach: ignore
  bytes.forEach((charCode) => {
    str += String.fromCharCode(charCode);
  });

  return btoa(str);
}

const HOST_SETTINGS = {
  expectedOrigin: env.NEXT_PUBLIC_VERCEL_BRANCH_URL
    ? `https://${env.NEXT_PUBLIC_VERCEL_BRANCH_URL}`
    : "http://localhost:3000",
  expectedRPID: env.NEXT_PUBLIC_VERCEL_BRANCH_URL ?? "localhost",
};

export const registerUser = async (verification: VerifiedRegistrationResponse): Promise<any | Error> => {
  const { credentialID, credentialPublicKey } = verification.registrationInfo ?? {};

  if (credentialID == null || credentialPublicKey == null) {
    throw new Error("Registration failed");
  }

  const credentialIDBytes = new TextEncoder().encode(credentialID); // Convert the string to Uint8Array

  return {
    userID: uuidv4(),
    externalID: clean(await binaryToBase64url(credentialIDBytes)), // Pass the Uint8Array to the function
    publicKey: Buffer.from(credentialPublicKey),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

export const getRegistrationOptions = async (
  email: string,
  username: string,
): Promise<PublicKeyCredentialCreationOptionsJSON> => {
  const challenge: string = generateChallenge();

  const registrationOptionsParameters: GenerateRegistrationOptionsOpts = {
    challenge,
    rpName: "next-webauthn",
    rpID: "localhost",
    userID: new TextEncoder().encode(uuidv4()),
    userName: email,
    userDisplayName: username,
    timeout: 60000,
    attestationType: "none",
    authenticatorSelection: { residentKey: "discouraged" },
    supportedAlgorithmIDs: [-7, -257], // the two most common algorithms: ES256, and RS256
  };

  const registrationOptions: PublicKeyCredentialCreationOptionsJSON =
    await generateRegistrationOptions(registrationOptionsParameters);

  return registrationOptions;
};

export const verifyRegistration = async (
  credential: RegistrationResponseJSON,
  challenge: string,
): Promise<VerifiedRegistrationResponse> => {
  let verification: VerifiedRegistrationResponse;

  if (credential == null) {
    throw new Error("Invalid Credentials");
  }

  try {
    verification = await verifyRegistrationResponse({
      response: credential,
      expectedChallenge: challenge,
      requireUserVerification: true,
      ...HOST_SETTINGS,
    });
  } catch (error) {
    console.error(error);
    throw error;
  }

  if (!verification.verified) {
    throw new Error("Registration verification failed");
  }

  return verification;
};
