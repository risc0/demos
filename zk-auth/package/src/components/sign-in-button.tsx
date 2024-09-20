"use client";

import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { Button } from "@risc0/ui/button";
import jwtDecode from "jwt-decode";
import { Loader2Icon } from "lucide-react";
import { useEffect } from "react";
import { useLinkedInAuth } from "../hooks/use-linkedin-auth";
import { usePaypalAuth } from "../hooks/use-paypal-auth";
import { useSocialsLocalStorage } from "../hooks/use-socials";
import { useTwitchAuth } from "../hooks/use-twitch-auth";
import { cleanUrl } from "../utils/clean-url";

export function SignInButton({ address }: { address: `0x${string}` }) {
  const {
    twitchUserToken,
    googleUserToken,
    paypalUserToken,
    linkedInUserToken,
    setGoogleUserInfos,
    setGoogleUserToken,
  } = useSocialsLocalStorage({ address });
  const { handleTwitchAuthCallback, signInWithTwitch } = useTwitchAuth({ address });
  const { handlePaypalAuthCallback, signInWithPaypal } = usePaypalAuth({ address });
  const { handleLinkedInAuthCallback, signInWithLinkedIn } = useLinkedInAuth({ address });
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

  // linkedin auth callback
  useEffect(() => {
    if (linkedInUserToken) {
      return;
    }

    async function handleLinkedInAuth() {
      if (urlState?.startsWith("linkedin") && code) {
        try {
          await handleLinkedInAuthCallback(code);

          cleanUrl();
        } catch (error) {
          console.error("LinkedIn Auth error:", error);
        }
      }
    }

    handleLinkedInAuth();
  }, [handleLinkedInAuthCallback, linkedInUserToken, code, urlState]);

  // paypal auth callback
  useEffect(() => {
    if (paypalUserToken) {
      return;
    }

    async function handlePaypalAuth() {
      if (urlState === "paypal" && code) {
        try {
          await handlePaypalAuthCallback(code);

          cleanUrl();
        } catch (error) {
          console.error("Paypal Auth error:", error);
        }
      }
    }

    handlePaypalAuth();
  }, [handlePaypalAuthCallback, paypalUserToken, code, urlState]);

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
    <div className="flex w-full flex-col items-center gap-3">
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <GoogleLogin
          locale="en"
          logo_alignment="center"
          shape="pill"
          size="medium"
          text="continue_with"
          theme="filled_blue"
          width="100%"
          ux_mode="popup"
          type="standard"
          auto_select
          nonce={address}
          onSuccess={(response) => {
            if (response.credential) {
              setGoogleUserToken(response.credential);
            }
          }}
        />
      </GoogleOAuthProvider>

      <Button
        size="sm"
        onClick={signInWithTwitch}
        style={{
          fontFamily: "arial, sans-serif",
          letterSpacing: "0.25px",
        }}
        className="relative flex h-8 w-full max-w-[197px] transition-colors flex-row items-center gap-1.5 rounded-full bg-[#A970FF] pl-6 font-normal text-[14px] text-white tracking-wider hover:bg-[#BF94FF] hover:text-white"
      >
        <div className="absolute left-[2px] flex size-7 items-center justify-center rounded-full bg-white p-[0.35rem]">
          <img src="https://zkauth.vercel.app/twitch.svg" width={16} height={16} alt="Twitch" />
        </div>
        Continue with Twitch
      </Button>

      <Button
        size="sm"
        disabled
        onClick={signInWithLinkedIn}
        style={{
          fontFamily: "arial, sans-serif",
          letterSpacing: "0.25px",
        }}
        className="relative flex h-8 w-full transition-colors max-w-[197px] flex-row items-center gap-1.5 rounded-full bg-[#0077B5] pl-9 font-normal text-[14px] text-white tracking-wider hover:bg-[#005d8e] hover:text-white"
      >
        <div className="absolute left-[2px] flex size-7 items-center justify-center rounded-full bg-white p-[0.35rem]">
          <img src="https://zkauth.vercel.app/linkedin.svg" width={12} height={12} alt="LinkedIn" />
        </div>
        Continue with LinkedIn
      </Button>

      <Button
        size="sm"
        onClick={signInWithPaypal}
        style={{
          fontFamily: "arial, sans-serif",
          letterSpacing: "0.25px",
        }}
        className="relative flex h-8 w-full transition-colors max-w-[197px] flex-row items-center gap-1.5 rounded-full bg-[#0070E0] pl-9 font-normal text-[14px] text-white tracking-wider hover:bg-[#0070E0] hover:text-white"
      >
        <div className="absolute left-[2px] flex size-7 items-center justify-center rounded-full bg-white p-[0.35rem]">
          <img src="https://zkauth.vercel.app/paypal.svg" width={12} height={12} alt="PayPal" />
        </div>
        Continue with PayPal
      </Button>
    </div>
  );
}
