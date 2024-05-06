"use client";

import { Button } from "@risc0/ui/button";
import { startRegistration } from "@simplewebauthn/browser";
import type { VerifiedRegistrationResponse } from "@simplewebauthn/server";
import type { PublicKeyCredentialCreationOptionsJSON, RegistrationResponseJSON } from "@simplewebauthn/types";
import { getRegistrationOptions, registerUser, verifyRegistration } from "../_actions/register";

export const WebAuthnButton = () => {
  async function handleFormSubmit() {
    const creationOptionsJSON: PublicKeyCredentialCreationOptionsJSON = await getRegistrationOptions();
    const registrationResponse: RegistrationResponseJSON = await startRegistration(creationOptionsJSON);
    const verificationResponse: VerifiedRegistrationResponse = await verifyRegistration(
      registrationResponse,
      creationOptionsJSON.challenge,
    );

    try {
      const user = await registerUser(verificationResponse);

      if (user instanceof Error) {
        console.error(user.message ? user.message : "An unknown Registration error occurred");
        throw user;
      }

      console.log("User registered successfully", user);
    } catch (err) {
      const registerError = err as Error;
      console.error(registerError.message);
    }
  }

  return (
    <Button onClick={handleFormSubmit} className="w-full" type="submit">
      Register with WebAuthn
    </Button>
  );
};
