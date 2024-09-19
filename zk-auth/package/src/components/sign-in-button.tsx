import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { Button } from "@risc0/ui/button";
import jwtDecode from "jwt-decode";
import { Loader2Icon } from "lucide-react";
import { useEffect } from "react";
import { useSocialsLocalStorage } from "../hooks/use-socials";
import { useTwitchAuth } from "../hooks/use-twitch-auth";
import { cleanUrl } from "../utils/clean-url";

export function SignInButton({ address }: { address: `0x${string}` }) {
  const { googleUserInfos, twitchUserToken, googleUserToken, setGoogleUserInfos, setGoogleUserToken } =
    useSocialsLocalStorage({ address });
  const { handleTwitchAuthCallback, signInWithTwitch } = useTwitchAuth({ address });
  const code = new URLSearchParams(window.location.search).get("code");

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

  if (code) {
    return <Loader2Icon className="animate-spin" />;
  }

  return (
    <>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <GoogleLogin
          auto_select
          nonce={address}
          onSuccess={(response) => {
            if (response.credential) {
              setGoogleUserToken(response.credential);
            }
          }}
        />
      </GoogleOAuthProvider>

      <Button onClick={signInWithTwitch} size="lg" className="mb-4 flex w-full flex-row items-center gap-1.5">
        Sign in with Twitch
      </Button>
    </>
  );
}
