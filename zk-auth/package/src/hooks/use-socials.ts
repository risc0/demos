"use client";

import { useLocalStorage } from "@risc0/ui/hooks/use-local-storage";
import type { SupportedProviders } from "../types/supported-providers";

function generateLocalStorageKey(provider: SupportedProviders, identifier: string, address: `0x${string}`) {
  return `${provider}-${identifier}-${address}`;
}

export function useSocialsLocalStorage({
  address,
}: {
  address: `0x${string}`;
}) {
  // google
  const [googleUserInfos, setGoogleUserInfos] = useLocalStorage<any>(
    generateLocalStorageKey("google", "infos", address),
    undefined,
  );
  const [googleUserToken, setGoogleUserToken] = useLocalStorage<string | undefined>(
    generateLocalStorageKey("google", "token", address),
    undefined,
  );

  // facebook
  const [facebookUserInfos, setFacebookUserInfos] = useLocalStorage<any>(
    generateLocalStorageKey("facebook", "infos", address),
    undefined,
  );
  const [facebookUserToken, setFacebookUserToken] = useLocalStorage<string | undefined>(
    generateLocalStorageKey("facebook", "token", address),
    undefined,
  );

  // twitch
  const [twitchUserInfos, setTwitchUserInfos] = useLocalStorage<any>(
    generateLocalStorageKey("twitch", "infos", address),
    undefined,
  );
  const [twitchUserToken, setTwitchUserToken] = useLocalStorage<string | undefined>(
    generateLocalStorageKey("twitch", "token", address),
    undefined,
  );

  return {
    googleUserInfos,
    googleUserToken,
    setGoogleUserInfos,
    setGoogleUserToken,
    setTwitchUserInfos,
    setTwitchUserToken,
    twitchUserInfos,
    twitchUserToken,
    facebookUserInfos,
    facebookUserToken,
    setFacebookUserInfos,
    setFacebookUserToken,
  };
}
