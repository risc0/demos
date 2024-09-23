"use client";

import { Button } from "@risc0/ui/button";
import { useMounted } from "@risc0/ui/hooks/use-mounted";
import { LogOutIcon } from "lucide-react";
import { useSocialsLocalStorage } from "../hooks/use-socials";

export function SignOutButton({ address }: { address: `0x${string}` }) {
  const mounted = useMounted();
  const {
    setGoogleUserInfos,
    setGoogleUserToken,
    setTwitchUserInfos,
    setTwitchUserToken,
    googleUserInfos,
    twitchUserInfos,
    setFacebookUserInfos,
    setFacebookUserToken,
    facebookUserInfos,
  } = useSocialsLocalStorage({ address });

  function signOut() {
    // Strip URL parameters
    const currentUrl = new URL(window.location.href);
    window.history.replaceState({}, document.title, currentUrl.pathname);

    // google
    setGoogleUserToken(undefined);
    setGoogleUserInfos(undefined);

    // twitch
    setTwitchUserToken(undefined);
    setTwitchUserInfos(undefined);

    // facebook
    setFacebookUserToken(undefined);
    setFacebookUserInfos(undefined);
  }

  if (!mounted || !address || (!googleUserInfos && !twitchUserInfos && !facebookUserInfos)) {
    return <div className="h-8" />;
  }

  return (
    <Button size="sm" variant="ghost" endIcon={<LogOutIcon />} onClick={signOut}>
      Change Account
    </Button>
  );
}
