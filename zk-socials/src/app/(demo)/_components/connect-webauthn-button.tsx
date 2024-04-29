"use client";

import { client } from "@passwordless-id/webauthn";
import { Button } from "@risc0/ui/button";
import { useLocalStorage } from "@risc0/ui/hooks/use-local-storage";
import { LockIcon } from "lucide-react";
import { useEffect } from "react";
import { generateRandomString } from "../_utils/generate-random-string";

export function ConnectWebAuthnButton() {
  const [webAuthnCodeVerifier, setWebAuthnCodeVerifier] = useLocalStorage<string | undefined>(
    "webauthn-code-verifier",
    undefined,
  );

  useEffect(() => {
    if (!webAuthnCodeVerifier) {
      setWebAuthnCodeVerifier(generateRandomString(128));
    }
  }, [setWebAuthnCodeVerifier, webAuthnCodeVerifier]);

  async function signIn(challenge: string) {
    try {
      const res = await client.register("Proof of Account", btoa(challenge));
      //alert(JSON.stringify(res));
      console.log(JSON.stringify(res));
    } catch (error) {
      console.error(error);
    }
  }

  return (
    webAuthnCodeVerifier && (
      <Button
        className="w-full"
        disabled //todo: disabled for now
        startIcon={<LockIcon />}
        onClick={() => {
          signIn(webAuthnCodeVerifier);
        }}
      >
        Sign In with Browser / YubiKey / OS (via webauthn)
      </Button>
    )
  );
}
