"use client";

import { Button } from "@risc0/ui/button";
import { useLocalStorage } from "@risc0/ui/hooks/use-local-storage";
import { useMounted } from "@risc0/ui/hooks/use-mounted";
import { LogOutIcon } from "lucide-react";

export function SignOutButton({ address }: { address: string }) {
  const mounted = useMounted();
  const [_googleUserToken, setGoogleUserToken] = useLocalStorage(`google-token-${address}`, undefined);
  const [googleUserInfos, setGoogleUserInfos] = useLocalStorage(`google-infos-${address}`, undefined);

  function signOut() {
    setGoogleUserToken(undefined);
    setGoogleUserInfos(undefined);
  }

  if (!mounted || !address || !googleUserInfos) {
    return <div className="h-8" />;
  }

  return (
    <Button size="sm" variant="ghost" endIcon={<LogOutIcon />} onClick={signOut}>
      Change Account
    </Button>
  );
}
