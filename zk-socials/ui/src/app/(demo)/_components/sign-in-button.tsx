"use client";

import { GoogleLogin } from "@react-oauth/google";
import jwtDecode from "jwt-decode";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAccount } from "wagmi";
import { useLocalStorage } from "~/app/(demo)/_hooks/useLocalStorage";

export default function SignInButton() {
  const [userInfos, setUserInfos] = useLocalStorage<any | null>("google-infos", null);
  const [userToken, setUserToken] = useLocalStorage<string | null>("google-token", null);
  const router = useRouter();
  const { address } = useAccount();

  // if already logged in
  useEffect(() => {
    if (userInfos) {
      router.push("/");
    }
  }, [router.push, userInfos]);

  useEffect(() => {
    if (!userToken) {
      return;
    }

    const decoded = jwtDecode(userToken);
    setUserInfos(decoded);
  }, [userToken, setUserInfos]);

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
