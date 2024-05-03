"use client";

import { Button } from "@risc0/ui/button";
import { useLocalStorage } from "@risc0/ui/hooks/use-local-storage";
import { LogOutIcon } from "lucide-react";
import { useAccount, useDisconnect } from "wagmi";
import type { FacebookUserInfos } from "~/types/facebook";
import type { GoogleUserInfos } from "~/types/google";

export function SignOutButton() {
  const { address } = useAccount();
  const { disconnectAsync } = useDisconnect();
  const [_googleUserToken, setGoogleUserToken] = useLocalStorage<string | undefined>("google-token", undefined);
  const [googleUserInfos, setGoogleUserInfos] = useLocalStorage<GoogleUserInfos | undefined>("google-infos", undefined);
  const [_facebookUserToken, setFacebookUserToken] = useLocalStorage<string | undefined>("facebook-token", undefined);
  const [facebookUserInfos, setFacebookUserInfos] = useLocalStorage<FacebookUserInfos | undefined>(
    "facebook-infos",
    undefined,
  );
  const [starkResults] = useLocalStorage<any | undefined>("stark-results", undefined);
  const [snarkResults] = useLocalStorage<any | undefined>("snark-results", undefined);

  async function signOut() {
    setGoogleUserToken(undefined);
    setGoogleUserInfos(undefined);
    setFacebookUserToken(undefined);
    setFacebookUserInfos(undefined);
    await disconnectAsync(); // Disconnect the user's wallet
  }

  if (!address || (!googleUserInfos && !facebookUserInfos) || starkResults || snarkResults) {
    return null;
  }

  return (
    <Button size="sm" variant="ghost" startIcon={<LogOutIcon />} onClick={signOut}>
      Sign Out
    </Button>
  );
}
