"use server";

import crypto from "crypto";
import { generateRegistrationOptions, verifyRegistrationResponse } from "@simplewebauthn/server";
import type { GenerateRegistrationOptionsOpts, VerifiedRegistrationResponse } from "@simplewebauthn/server";
import type { PublicKeyCredentialCreationOptionsJSON, RegistrationResponseJSON } from "@simplewebauthn/types";
import { v4 as uuidv4 } from "uuid";
import env from "~/env";

const HOST_SETTINGS = {
  expectedOrigin:
    env.NEXT_PUBLIC_VERCEL_BRANCH_URL === "localhost"
      ? "http://localhost:3000"
      : `https://${env.NEXT_PUBLIC_VERCEL_BRANCH_URL}`,
  expectedRPID: env.NEXT_PUBLIC_VERCEL_BRANCH_URL ?? "localhost",
};

function clean(str: string) {
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function generateChallenge() {
  return clean(crypto.randomBytes(32).toString("base64"));
}

// biome-ignore lint/suspicious/useAwait: keep
export async function registerUserViaWebAuthn(verification: VerifiedRegistrationResponse) {
  const { credentialID, credentialPublicKey } = verification.registrationInfo ?? {};

  if (credentialID == null || credentialPublicKey == null) {
    throw new Error("Registration failed");
  }

  return Buffer.from(credentialPublicKey);
}

export async function getRegistrationOptions(): Promise<PublicKeyCredentialCreationOptionsJSON> {
  const challenge: string = generateChallenge();

  const registrationOptionsParameters: GenerateRegistrationOptionsOpts = {
    challenge,
    rpName: "next-webauthn",
    rpID: HOST_SETTINGS.expectedRPID,
    userID: new TextEncoder().encode(uuidv4()),
    userName: "example-email@example.com",
    userDisplayName: "example-username",
    timeout: 60000,
    attestationType: "none",
    authenticatorSelection: { residentKey: "discouraged" },
    supportedAlgorithmIDs: [-7, -257], // the two most common algorithms: ES256, and RS256
  };

  const registrationOptions: PublicKeyCredentialCreationOptionsJSON =
    await generateRegistrationOptions(registrationOptionsParameters);

  return registrationOptions;
}

export async function verifyRegistration(
  credential: RegistrationResponseJSON,
  challenge: string,
): Promise<VerifiedRegistrationResponse> {
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
}
