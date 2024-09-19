import { GoogleLogin } from "@react-oauth/google";
import { Button } from "@risc0/ui/button";
import jwtDecode from "jwt-decode";
import { useEffect } from "react";
import { useSocialsLocalStorage } from "../hooks/use-socials";
import { useTwitchAuth } from "../hooks/use-twitch-auth";

function getQueryParam(param: string): string | null {
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get(param);
}

export function SignInButton({ address }: { address: `0x${string}` }) {
  const { googleUserInfos, twitchUserInfos, googleUserToken, twitchUserToken, setGoogleUserInfos, setGoogleUserToken } =
    useSocialsLocalStorage({ address });
  const { handleTwitchAuthCallback, signInWithTwitch } = useTwitchAuth({ address });

  useEffect(() => {
    if (!googleUserToken || googleUserInfos) {
      return;
    }

    setGoogleUserInfos(jwtDecode(googleUserToken));
  }, [googleUserToken, setGoogleUserInfos, googleUserInfos]);

  useEffect(() => {
    if (twitchUserToken && twitchUserInfos) {
      return;
    }

    const code = getQueryParam("code");

    // Handle the Twitch auth callback
    if (code && !twitchUserInfos) {
      handleTwitchAuthCallback(code);
    }
  }, [handleTwitchAuthCallback, twitchUserInfos, twitchUserToken]);

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
