import { useCallback, useState } from "react";
import { useSocialsLocalStorage } from "./use-socials";

const TWITCH_CLIENT_ID = "sue2yrycv0enft61awlptyw4xfpl7z";
const TWITCH_REDIRECT_URI = window.location.origin;

export function useTwitchAuth({ address }: { address: `0x${string}` }) {
  const { setTwitchUserToken, setTwitchUserInfos } = useSocialsLocalStorage({ address });
  const [error, setError] = useState<string | null>(null);

  const signInWithTwitch = useCallback(() => {
    const nonce = address;

    const authUrl = new URL("https://id.twitch.tv/oauth2/authorize");
    authUrl.searchParams.append("client_id", TWITCH_CLIENT_ID);
    authUrl.searchParams.append("redirect_uri", TWITCH_REDIRECT_URI);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("scope", "openid user:read:email ");
    authUrl.searchParams.append("nonce", nonce);

    window.location.href = authUrl.toString();
  }, [address]);

  const handleTwitchAuthCallback = useCallback(
    async (code: string) => {
      console.log("code", code);
      try {
        const response = await fetch("https://zkauth.vercel.app/api/twitch/get-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });

        // wipe the url
        window.history.replaceState({}, "", window.location.href);

        console.log("response", response);
        const { jwt, email, profile_image_url, display_name } = await response.json();
        console.log("{ email, profile_image_url, display_name }", { email, profile_image_url, display_name });

        setTwitchUserInfos({ email, profile_image_url, display_name });

        console.log("jwt", jwt);

        if (jwt) {
          setTwitchUserToken(jwt);
        }
      } catch (err) {
        setError("Failed to authenticate with Twitch");
        console.error(err);
      }
    },
    [setTwitchUserToken, setTwitchUserInfos],
  );

  return {
    error,
    signInWithTwitch,
    handleTwitchAuthCallback,
  };
}
