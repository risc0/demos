import { GoogleLogin } from "@react-oauth/google";
import { Button } from "@risc0/ui/button";
import jwtDecode from "jwt-decode";
import { useEffect } from "react";
import { useSocialsLocalStorage } from "../hooks/use-socials";
import { useTwitchAuth } from "../hooks/use-twitch-auth";

function cleanUrl() {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  window.history.replaceState({}, document.title, url.toString());
}

export function SignInButton({ address }: { address: `0x${string}` }) {
  const { googleUserInfos, twitchUserToken, googleUserToken, setGoogleUserInfos, setGoogleUserToken } =
    useSocialsLocalStorage({ address });
  const { handleTwitchAuthCallback, signInWithTwitch } = useTwitchAuth({ address });

  useEffect(() => {
    if (!googleUserToken || googleUserInfos) {
      return;
    }

    const { name, email, picture } = jwtDecode(googleUserToken) as any;

    setGoogleUserInfos({
      name,
      email,
      picture,
    });
  }, [googleUserToken, setGoogleUserInfos, googleUserInfos]);

  useEffect(() => {
    if (twitchUserToken) {
      return;
    }

    async function handleAuth() {
      const code = new URLSearchParams(window.location.search).get("code");

      if (code) {
        try {
          await handleTwitchAuthCallback(code);

          cleanUrl();
        } catch (error) {
          console.error("Auth error:", error);
        }
      }
    }

    handleAuth();
  }, [handleTwitchAuthCallback, twitchUserToken]);

  return (
    <>
      <GoogleLogin
        auto_select
        nonce={address}
        onSuccess={(response) => {
          if (response.credential) {
            setGoogleUserToken(response.credential);
          }
        }}
      />

      <Button onClick={signInWithTwitch} size="lg" className="flex w-full mb-4 flex-row items-center gap-1.5">
        Sign in with Twitch
      </Button>
    </>
  );
}
