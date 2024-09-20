"use client";

import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { Button } from "@risc0/ui/button";
import jwtDecode from "jwt-decode";
import { Loader2Icon } from "lucide-react";
import { useEffect } from "react";
import { useFacebookAuth } from "../hooks/use-facebook-auth";
import { useSocialsLocalStorage } from "../hooks/use-socials";
import { useTwitchAuth } from "../hooks/use-twitch-auth";
import { cleanUrl } from "../utils/clean-url";

export function SignInButton({ address }: { address: `0x${string}` }) {
  const { twitchUserToken, googleUserToken, facebookUserToken, setGoogleUserInfos, setGoogleUserToken } =
    useSocialsLocalStorage({
      address,
    });
  const { handleTwitchAuthCallback, signInWithTwitch } = useTwitchAuth({ address });
  const { handleFacebookAuthCallback, signInWithFacebook } = useFacebookAuth({ address });
  const code = new URLSearchParams(window.location.search).get("code");
  const urlState = new URLSearchParams(window.location.search).get("state");

  // google auth callback
  useEffect(() => {
    if (!googleUserToken) {
      return;
    }

    const { name, email, picture } = jwtDecode(googleUserToken) as any;

    setGoogleUserInfos({
      name,
      email,
      picture,
    });
  }, [googleUserToken, setGoogleUserInfos]);

  // facebook auth callback
  useEffect(() => {
    if (facebookUserToken) {
      return;
    }

    async function handleFacebookAuth() {
      if (urlState === "facebook" && code) {
        try {
          await handleFacebookAuthCallback(code);

          cleanUrl();
        } catch (error) {
          console.error("Facebook Auth error:", error);
        }
      }
    }

    handleFacebookAuth();
  }, [handleFacebookAuthCallback, facebookUserToken, code, urlState]);

  // twitch auth callback
  useEffect(() => {
    if (twitchUserToken) {
      return;
    }

    async function handleTwitchAuth() {
      if (urlState === "twitch" && code) {
        try {
          await handleTwitchAuthCallback(code);

          cleanUrl();
        } catch (error) {
          console.error("Twitch Auth error:", error);
        }
      }
    }

    handleTwitchAuth();
  }, [handleTwitchAuthCallback, twitchUserToken, code, urlState]);

  // loading state
  if (code) {
    return <Loader2Icon className="animate-spin" />;
  }

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="group relative h-8 w-full">
        <div className="opacity-0">
          <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <GoogleLogin
              locale="en"
              logo_alignment="center"
              shape="square"
              size="medium"
              text="continue_with"
              theme="filled_blue"
              width="320px"
              ux_mode="popup"
              type="standard"
              nonce={address}
              onSuccess={(response) => {
                if (response.credential) {
                  setGoogleUserToken(response.credential);
                }
              }}
            />
          </GoogleOAuthProvider>
        </div>

        <Button
          size="sm"
          style={{
            fontFamily: "arial, sans-serif",
            letterSpacing: "0.25px",
          }}
          className="pointer-events-none absolute top-0 left-0 flex h-8 w-full flex-row items-center justify-start gap-1.5 rounded-[4px] font-normal text-[14px] text-white tracking-wider transition-colors hover:text-white group-hover:bg-neutral-600"
        >
          <div className="flex items-center gap-[11px] pl-[45.5px]">
            <div className="flex size-7 items-center justify-center rounded bg-white p-[0.35rem]">
              <img src="https://zkauth.vercel.app/google.svg" width={18} height={18} alt="Google" />
            </div>
            <span>Continue with Google</span>
          </div>
        </Button>
      </div>

      <Button
        size="sm"
        onClick={signInWithTwitch}
        style={{
          fontFamily: "arial, sans-serif",
          letterSpacing: "0.25px",
        }}
        className="relative flex h-8 w-full flex-row items-center justify-start gap-1.5 rounded-[4px] bg-[#A970FF] font-normal text-[14px] text-white tracking-wider transition-colors hover:bg-[#BF94FF] hover:text-white"
      >
        <div className="flex items-center gap-[11px] pl-[45.5px]">
          <div className="flex size-7 items-center justify-center rounded bg-white p-[0.35rem]">
            <img src="https://zkauth.vercel.app/twitch.svg" width={17} height={17} alt="Twitch" />
          </div>
          <span>Continue with Twitch</span>
        </div>
      </Button>

      <Button
        size="sm"
        onClick={signInWithFacebook}
        style={{
          fontFamily: "arial, sans-serif",
          letterSpacing: "0.25px",
        }}
        className="relative flex h-8 w-full flex-row items-center justify-start gap-1.5 rounded-[4px] bg-[#0866FF] font-normal text-[14px] text-white tracking-wider transition-colors hover:bg-[#2f7eff] hover:text-white"
      >
        <div className="flex items-center gap-[11px] pl-[45.5px]">
          <div className="flex size-7 items-center justify-center rounded bg-white p-[0.25rem]">
            <img src="https://zkauth.vercel.app/facebook.svg" width={22} height={22} alt="Facebook" />
          </div>
          <span>Continue with Facebook</span>
        </div>
      </Button>
    </div>
  );
}
