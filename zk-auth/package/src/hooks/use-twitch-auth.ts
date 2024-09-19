import { useState } from "react";
import { useSocialsLocalStorage } from "./use-socials";

const TWITCH_CLIENT_ID = "h7i920jmp37f1gwafkndd8xx1fcud1";
const TWITCH_REDIRECT_URI = window.location.origin;

export function useTwitchAuth({ address }: { address: `0x${string}` }) {
  const [error, setError] = useState<string | null>(null);
  const { setTwitchUserInfos, setTwitchUserToken } = useSocialsLocalStorage({ address });

  function signInWithTwitch() {
    window.location.href = `https://id.twitch.tv/oauth2/authorize?client_id=${TWITCH_CLIENT_ID}&redirect_uri=${encodeURIComponent(TWITCH_REDIRECT_URI)}&response_type=token&scope=user:read:email openid`;
  }

  async function handleTwitchAuthCallback() {
    console.log("handleTwitchAuthCallback");
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");
    console.log("accessToken", accessToken);

    if (accessToken) {
      try {
        // Fetch user info
        const userInfoResponse = await fetch("https://api.twitch.tv/helix/users", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Client-Id": TWITCH_CLIENT_ID,
          },
        });
        console.log("userInfoResponse", userInfoResponse);
        if (!userInfoResponse.ok) {
          throw new Error("Failed to fetch twitch user info");
        }

        const userData = await userInfoResponse.json();
        console.log("userData", userData);

        setTwitchUserInfos(userData.data[0]);

        // Fetch JWT from our endpoint
        const jwtResponse = await fetch("https://zkauth.vercel.app/api/twitch/get-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ accessToken }),
        });
        console.log("jwtResponse", jwtResponse);
        if (!jwtResponse.ok) {
          throw new Error("Failed to fetch JWT");
        }

        const { jwt: twitchJwt } = await jwtResponse.json();
        console.log("twitchJwt", twitchJwt);
        setTwitchUserToken(twitchJwt);
      } catch (err) {
        setError("Failed to fetch twitch user info or JWT");
        console.error(err);
      }
    }
  }

  return {
    error,
    signInWithTwitch,
    handleTwitchAuthCallback,
  };
}
