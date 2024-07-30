"use client";

import { Button } from "@risc0/ui/button";
import { useLocalStorage } from "@risc0/ui/hooks/use-local-storage";
import { LogOutIcon } from "lucide-react";
import { useAccount, useDisconnect } from "wagmi";
import type { GoogleUserInfos } from "~/types/google";

export function SignOutButton() {
  const { address } = useAccount();
  const { disconnectAsync } = useDisconnect();
  const [_googleUserToken, setGoogleUserToken] = useLocalStorage<string | undefined>("google-token", undefined);
  const [googleUserInfos, setGoogleUserInfos] = useLocalStorage<GoogleUserInfos | undefined>("google-infos", undefined);
  const [starkResults] = useLocalStorage<any | undefined>("stark-results", undefined);
  const [snarkResults] = useLocalStorage<any | undefined>("snark-results", undefined);
  const [webAuthnPublicKey, setWebAuthnPublicKey] = useLocalStorage<string | undefined>(
    "webauth-public-key",
    undefined,
  );

  async function signOut() {
    setGoogleUserToken(undefined);
    setGoogleUserInfos(undefined);
    setWebAuthnPublicKey(undefined);
    await disconnectAsync(); // Disconnect the user's wallet
  }

  if ((!address && !webAuthnPublicKey) || !googleUserInfos || starkResults || snarkResults) {
    return null;
  }

  return (
    <Button size="sm" variant="ghost" startIcon={<LogOutIcon />} onClick={signOut}>
      Sign Out
    </Button>
  );
}
