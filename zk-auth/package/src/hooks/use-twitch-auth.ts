import { useLocalStorage } from "@risc0/ui/hooks/use-local-storage";
import { useCallback, useState } from "react";

const TWITCH_CLIENT_ID = "h7i920jmp37f1gwafkndd8xx1fcud1";
const TWITCH_REDIRECT_URI = window.location.origin;

export function useTwitchAuth({ address }: { address: `0x${string}` }) {
  const [_twitchUserInfos, setTwitchUserInfos] = useLocalStorage(`twitch-infos-${address}`, undefined);
  const [_twitchUserToken, setTwitchUserToken] = useLocalStorage<string | undefined>(
    `twitch-token-${address}`,
    undefined,
  );
  const [error, setError] = useState<string | null>(null);

  const signInWithTwitch = useCallback(() => {
    window.location.href = `https://id.twitch.tv/oauth2/authorize?client_id=${TWITCH_CLIENT_ID}&redirect_uri=${encodeURIComponent(TWITCH_REDIRECT_URI)}&response_type=token&scope=user:read:email`;
  }, []);

  const handleTwitchAuthCallback = useCallback(async () => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");

    if (accessToken) {
      setTwitchUserToken(accessToken);

      try {
        const response = await fetch("https://api.twitch.tv/helix/users", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Client-Id": TWITCH_CLIENT_ID,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch twitch user info");
        }

        const data = await response.json();
        setTwitchUserInfos(data.data[0]);
      } catch (err) {
        setError("Failed to fetch twitch user info");
        console.error(err);
      }
    }
  }, [setTwitchUserToken, setTwitchUserInfos]);

  const signOut = useCallback(() => {
    setTwitchUserToken(undefined);
    setTwitchUserInfos(undefined);
  }, [setTwitchUserToken, setTwitchUserInfos]);

  return {
    error,
    signInWithTwitch,
    handleTwitchAuthCallback,
    signOut,
  };
}
