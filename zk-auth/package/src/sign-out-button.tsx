"use client";

import { Button } from "@risc0/ui/button";
import { useLocalStorage } from "@risc0/ui/hooks/use-local-storage";
import { LogOutIcon } from "lucide-react";

export function SignOutButton({ address }: { address: string }) {
  const [_googleUserToken, setGoogleUserToken] = useLocalStorage(`google-token-${address}`, undefined);
  const [googleUserInfos, setGoogleUserInfos] = useLocalStorage(`google-infos-${address}`, undefined);

  function signOut() {
    setGoogleUserToken(undefined);
    setGoogleUserInfos(undefined);
  }

  if (!address || !googleUserInfos) {
    return null;
  }

  return (
    <Button size="sm" variant="ghost" startIcon={<LogOutIcon />} onClick={signOut}>
      Sign Out
    </Button>
  );
}
