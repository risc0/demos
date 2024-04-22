"use client";

import { Button } from "@risc0/ui/button";
import { LogOutIcon } from "lucide-react";
import { useAccount, useDisconnect } from "wagmi";
import { useLocalStorage } from "../_hooks/useLocalStorage";

export default function SignOutButton() {
  const { address } = useAccount();
  const { disconnectAsync } = useDisconnect();
  const [_userToken, setUserToken] = useLocalStorage<string | null | undefined>("google-token", null);
  const [userInfos, setUserInfos] = useLocalStorage<any | null | undefined>("google-infos", null);

  async function signOut() {
    setUserToken(undefined);
    setUserInfos(undefined);
    await disconnectAsync(); // Disconnect the user's wallet
  }

  if (!address || !userInfos) {
    return null;
  }

  return (
    <Button size="sm" variant="ghost" startIcon={<LogOutIcon />} onClick={signOut}>
      Sign Out
    </Button>
  );
}
