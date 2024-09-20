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

  // twitch
  const [twitchUserInfos, setTwitchUserInfos] = useLocalStorage<any>(
    generateLocalStorageKey("twitch", "infos", address),
    undefined,
  );
  const [twitchUserToken, setTwitchUserToken] = useLocalStorage<string | undefined>(
    generateLocalStorageKey("twitch", "token", address),
    undefined,
  );

  // linkedin
  const [linkedInUserInfos, setLinkedInUserInfos] = useLocalStorage<any>(
    generateLocalStorageKey("linkedin", "infos", address),
    undefined,
  );
  const [linkedInUserToken, setLinkedInUserToken] = useLocalStorage<string | undefined>(
    generateLocalStorageKey("linkedin", "token", address),
    undefined,
  );

  // paypal
  const [paypalUserInfos, setPaypalUserInfos] = useLocalStorage<any>(
    generateLocalStorageKey("paypal", "infos", address),
    undefined,
  );
  const [paypalUserToken, setPaypalUserToken] = useLocalStorage<string | undefined>(
    generateLocalStorageKey("paypal", "token", address),
    undefined,
  );

  return {
    googleUserInfos,
    googleUserToken,
    linkedInUserInfos,
    linkedInUserToken,
    setGoogleUserInfos,
    setGoogleUserToken,
    setLinkedInUserInfos,
    setLinkedInUserToken,
    setTwitchUserInfos,
    setTwitchUserToken,
    twitchUserInfos,
    twitchUserToken,
    paypalUserInfos,
    paypalUserToken,
    setPaypalUserInfos,
    setPaypalUserToken,
  };
}
