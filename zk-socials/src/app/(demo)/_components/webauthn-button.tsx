"use client";

import { Button } from "@risc0/ui/button";
import { CardTitle } from "@risc0/ui/card";
import { useLocalStorage } from "@risc0/ui/hooks/use-local-storage";
import { startRegistration } from "@simplewebauthn/browser";
import type { VerifiedRegistrationResponse } from "@simplewebauthn/server";
import type { PublicKeyCredentialCreationOptionsJSON, RegistrationResponseJSON } from "@simplewebauthn/types";
import { FileKeyIcon } from "lucide-react";
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

      setWebAuthnPublicKey(userPublicKey);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      <CardTitle className="mb-3">Link Your Passkey</CardTitle>
      <Button startIcon={<FileKeyIcon />} onClick={registerAuthn} className="w-full" type="submit">
        Register with WebAuthn
      </Button>
    </>
  );
};
