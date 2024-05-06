"use client";

import { Button } from "@risc0/ui/button";
import { useLocalStorage } from "@risc0/ui/hooks/use-local-storage";
import { startRegistration } from "@simplewebauthn/browser";
import type { VerifiedRegistrationResponse } from "@simplewebauthn/server";
import type { PublicKeyCredentialCreationOptionsJSON, RegistrationResponseJSON } from "@simplewebauthn/types";
import {
  getRegistrationOptions,
  registerUserViaWebAuthn,
  verifyRegistration,
} from "../_actions/register-user-via-web-authn";

export const WebAuthnButton = () => {
  const [_webAuthnPublicKey, setWebAuthnPublicKey] = useLocalStorage<string | undefined>(
    "webauth-public-key",
    undefined,
  );

  async function registerAuthn() {
    const creationOptionsJSON: PublicKeyCredentialCreationOptionsJSON = await getRegistrationOptions();
    const registrationResponse: RegistrationResponseJSON = await startRegistration(creationOptionsJSON);
    const verificationResponse: VerifiedRegistrationResponse = await verifyRegistration(
      registrationResponse,
      creationOptionsJSON.challenge,
    );

    try {
      const userPublicKey = await registerUserViaWebAuthn(verificationResponse);

      // Convert to base64
      const base64String = btoa(String.fromCharCode.apply(null, Array.from(userPublicKey)));

      setWebAuthnPublicKey(base64String);
    } catch (err) {
      const registerError = err as Error;
      console.error(registerError.message);
    }
  }

  return (
    <Button onClick={registerAuthn} className="w-full" type="submit">
      Register with WebAuthn
    </Button>
  );
};
