"use client";

import jwtDecode from "jwt-decode";
import { useCallback, useState } from "react";
import { useSocialsLocalStorage } from "./use-socials";

const PAYPAL_CLIENT_ID = "AZgjTPHfBSZL8INkF_gO08RkC3ae9-RMlc74QpKiVsv5nzizQtahg8UEkngU0X43ZZLUTJO3y6h8qkLf";
const PAYPAL_REDIRECT_URI = window.location.origin;

export function usePaypalAuth({ address }: { address: `0x${string}` }) {
  const { setPaypalUserToken, setPaypalUserInfos } = useSocialsLocalStorage({ address });
  const [error, setError] = useState<string | null>(null);

  function signInWithPaypal() {
    const authUrl = new URL("https://www.sandbox.paypal.com/connect");
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("client_id", PAYPAL_CLIENT_ID);
    authUrl.searchParams.append("redirect_uri", PAYPAL_REDIRECT_URI);
    authUrl.searchParams.append("scope", "openid profile email");
    authUrl.searchParams.append("nonce", address);
    authUrl.searchParams.append("state", "paypal");

    window.location.href = authUrl.toString();
  }

  const handlePaypalAuthCallback = useCallback(
    async (code: string) => {
      try {
        const response = await fetch("https://zkauth.vercel.app/api/paypal/get-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, origin: window.location.origin }),
        });

        if (!response.ok) {
          setError("Failed to authenticate with PayPal");
          return;
        }

        const { jwt } = await response.json();
        const { name, email, picture } = jwtDecode(jwt) as any;

        setPaypalUserInfos({
          name,
          email,
          picture,
        });

        if (jwt) {
          setPaypalUserToken(jwt);
        }
      } catch (err) {
        setError("Failed to authenticate with PayPal");
        console.error(err);
      }
    },
    [setPaypalUserInfos, setPaypalUserToken],
  );

  return {
    error,
    signInWithPaypal,
    handlePaypalAuthCallback,
  };
}
