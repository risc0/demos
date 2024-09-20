"use client";

import jwtDecode from "jwt-decode";
import { useCallback, useState } from "react";
import { useSocialsLocalStorage } from "./use-socials";

const FACEBOOK_APP_ID = "909797424299802";

function generateCodeVerifier() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);

  // @ts-expect-error
  return btoa(String.fromCharCode.apply(null, array)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function generateCodeChallenge(codeVerifier: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);

  return crypto.subtle.digest("SHA-256", data).then((array) => {
    // @ts-expect-error
    return btoa(String.fromCharCode.apply(null, new Uint8Array(array)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
  });
}

export function useFacebookAuth({ address }: { address: `0x${string}` }) {
  const { setFacebookUserToken, setFacebookUserInfos } = useSocialsLocalStorage({ address });
  const [error, setError] = useState<string | null>(null);

  async function signInWithFacebook() {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    localStorage.setItem("codeVerifier", codeVerifier);

    const authUrl = new URL("https://www.facebook.com/v20.0/dialog/oauth");
    authUrl.searchParams.append("client_id", FACEBOOK_APP_ID);
    authUrl.searchParams.append("redirect_uri", `${window.location.origin}/facebook/callback/`);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("scope", "openid email");
    authUrl.searchParams.append("state", "facebook");
    authUrl.searchParams.append("code_challenge", codeChallenge);
    authUrl.searchParams.append("code_challenge_method", "S256");
    authUrl.searchParams.append("nonce", address);

    window.location.href = authUrl.toString();
  }

  const handleFacebookAuthCallback = useCallback(
    async (code: string) => {
      try {
        const codeVerifier = localStorage.getItem("codeVerifier");

        if (!codeVerifier) {
          throw new Error("Missing code verifier or nonce");
        }

        const response = await fetch("https://zkauth.vercel.app/api/facebook/get-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, codeVerifier, origin: window.location.origin }),
        });

        if (!response.ok) {
          throw new Error("Failed to authenticate with Facebook");
        }

        const { jwt } = await response.json();

        const { name, email, picture } = jwtDecode(jwt) as any;

        setFacebookUserInfos({
          name,
          email,
          picture,
        });

        if (jwt) {
          setFacebookUserToken(jwt);
        }

        localStorage.removeItem("codeVerifier");
        localStorage.removeItem("nonce");
      } catch (err) {
        setError("Failed to authenticate with Facebook");
        console.error(err);
      }
    },
    [setFacebookUserInfos, setFacebookUserToken],
  );

  return {
    error,
    signInWithFacebook,
    handleFacebookAuthCallback,
  };
}
