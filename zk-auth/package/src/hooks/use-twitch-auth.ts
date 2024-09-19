import { useLocalStorage } from "@risc0/ui/hooks/use-local-storage";
import { useCallback, useState } from "react";

const TWITCH_CLIENT_ID = "h7i920jmp37f1gwafkndd8xx1fcud1";
const TWITCH_REDIRECT_URI = window.location.origin;

export function useTwitchAuth({ address }: { address: `0x${string}` }) {
  const [_twitchUserInfos, setTwitchUserInfos] = useLocalStorage(`twitch-infos-${address}`, undefined);
  const [_accessToken, setAccessToken] = useLocalStorage<string | undefined>(`twitch-token-${address}`, undefined);
  const [error, setError] = useState<string | null>(null);
  const [idToken, setIdToken] = useLocalStorage<string | undefined>(`twitch-id-token-${address}`, undefined);

  function signInWithTwitch() {
    window.location.href = `https://id.twitch.tv/oauth2/authorize?client_id=${TWITCH_CLIENT_ID}&redirect_uri=${encodeURIComponent(TWITCH_REDIRECT_URI)}&response_type=token&scope=user:read:email openid`;
  }

  async function handleTwitchAuthCallback() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");

    if (accessToken) {
      setAccessToken(accessToken);

      try {
        // Fetch user info
        const userInfoResponse = await fetch("https://api.twitch.tv/helix/users", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Client-Id": TWITCH_CLIENT_ID,
          },
        });

        if (!userInfoResponse.ok) {
          throw new Error("Failed to fetch twitch user info");
        }

        const userData = await userInfoResponse.json();
        setTwitchUserInfos(userData.data[0]);

        // Fetch ID token
        const idTokenResponse = await fetch("https://id.twitch.tv/oauth2/userinfo", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!idTokenResponse.ok) {
          throw new Error("Failed to fetch ID token");
        }

        const idTokenData = await idTokenResponse.json();
        setIdToken(idTokenData.sub); // 'sub' is the user's Twitch ID, which serves as the ID token
      } catch (err) {
        setError("Failed to fetch twitch user info or ID token");
        console.error(err);
      }
    }
  }

  function signOut() {
    setAccessToken(undefined);
    setTwitchUserInfos(undefined);
    setIdToken(undefined);
  }

  return {
    error,
    signInWithTwitch,
    handleTwitchAuthCallback,
    signOut,
    accessToken: _accessToken,
    userInfo: _twitchUserInfos,
  };
}
