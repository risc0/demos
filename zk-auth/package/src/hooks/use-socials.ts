import { useLocalStorage } from "@risc0/ui/hooks/use-local-storage";

function generateLocalStorageKey(provider: "google" | "twitch", identifier: string, address: `0x${string}`) {
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

  return {
    googleUserInfos,
    googleUserToken,
    twitchUserInfos,
    twitchUserToken,

    setGoogleUserInfos,
    setGoogleUserToken,
    setTwitchUserInfos,
    setTwitchUserToken,
  };
}
