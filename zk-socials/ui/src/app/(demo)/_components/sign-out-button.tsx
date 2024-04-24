"use client";

import { Button } from "@risc0/ui/button";
import { LogOutIcon } from "lucide-react";
import { useAccount, useDisconnect } from "wagmi";
import { useLocalStorage } from "../_hooks/use-local-storage";

export default function SignOutButton() {
  const { address } = useAccount();
  const { disconnectAsync } = useDisconnect();
  const [googleUserInfos] = useLocalStorage<any | null | undefined>("google-infos", null);
  const [facebookUserInfos] = useLocalStorage<any | null | undefined>("facebook-infos", null);

  async function signOut() {
    localStorage.removeItem("google-infos");
    localStorage.removeItem("google-token");
    localStorage.removeItem("facebook-infos");
    localStorage.removeItem("facebook-token");
    await disconnectAsync(); // Disconnect the user's wallet
  }

  if (!address || (!googleUserInfos && !facebookUserInfos)) {
    return null;
  }

  return (
    <Button size="sm" variant="ghost" startIcon={<LogOutIcon />} onClick={signOut}>
      Sign Out
    </Button>
  );
}
