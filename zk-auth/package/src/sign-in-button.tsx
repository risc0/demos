import { GoogleLogin } from "@react-oauth/google";
import { Button } from "@risc0/ui/button";
import { useLocalStorage } from "@risc0/ui/hooks/use-local-storage";
import jwtDecode from "jwt-decode";
import { useEffect } from "react";
import { useTwitchAuth } from "./use-twitch-auth";

export function SignInButton({ address }: { address: string }) {
  const [googleUserInfos, setGoogleUserInfos] = useLocalStorage(`google-infos-${address}`, undefined);
  const [googleUserToken, setGoogleUserToken] = useLocalStorage<string | undefined>(
    `google-token-${address}`,
    undefined,
  );
  const [twitchUserInfos] = useLocalStorage(`twitch-infos-${address}`, undefined);
  const [twitchUserToken] = useLocalStorage(`twitch-token-${address}`, undefined);
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

    // Handle the Twitch auth callback
    if (window.location.hash.includes("access_token") && !twitchUserInfos) {
      handleTwitchAuthCallback();
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
