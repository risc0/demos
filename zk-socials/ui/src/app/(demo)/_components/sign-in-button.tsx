"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAccount } from "wagmi";
import { useLocalStorage } from "~/app/(demo)/_hooks/useLocalStorage";

export default function SignInButton() {
  const [userToken, setUserToken] = useLocalStorage<string | null>("google-token", null);
  const router = useRouter();
  const { address } = useAccount();

  // if already logged in
  useEffect(() => {
    if (userToken) {
      router.push("/");
    }
  }, [router.push, userToken]);

  return (
    <GoogleLogin
      auto_select
      theme="filled_black"
      shape="rectangular"
      nonce={address}
      onSuccess={(response) => {
        if (response.credential) {
          setUserToken(response.credential);
        }
      }}
    />
  );
}
