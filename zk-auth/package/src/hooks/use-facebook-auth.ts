"use client";

import { useCallback, useState } from "react";
import { useSocialsLocalStorage } from "./use-socials";

const FACEBOOK_APP_ID = "YOUR_FACEBOOK_APP_ID";
const FACEBOOK_REDIRECT_URI = window.location.origin;

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
    const nonce = Math.random().toString(36).substring(2, 15);

    localStorage.setItem("codeVerifier", codeVerifier);
    localStorage.setItem("nonce", nonce);

    const authUrl = new URL("https://www.facebook.com/v12.0/dialog/oauth");
    authUrl.searchParams.append("client_id", FACEBOOK_APP_ID);
    authUrl.searchParams.append("redirect_uri", FACEBOOK_REDIRECT_URI);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("scope", "openid email");
    authUrl.searchParams.append("state", "facebook");
    authUrl.searchParams.append("code_challenge", codeChallenge);
    authUrl.searchParams.append("code_challenge_method", "S256");
    authUrl.searchParams.append("nonce", nonce);

    window.location.href = authUrl.toString();
  }

  const handleFacebookAuthCallback = useCallback(
    async (code: string) => {
      try {
        const codeVerifier = localStorage.getItem("codeVerifier");
        const nonce = localStorage.getItem("nonce");

        if (!codeVerifier || !nonce) {
          throw new Error("Missing code verifier or nonce");
        }

        const response = await fetch("/api/facebook/get-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, codeVerifier, nonce }),
        });

        if (!response.ok) {
          throw new Error("Failed to authenticate with Facebook");
        }

        const { access_token, id_token, email, picture, name } = await response.json();

        setFacebookUserInfos({ email, profile_image_url: picture, display_name: name });

        if (id_token) {
          setFacebookUserToken(id_token);
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
