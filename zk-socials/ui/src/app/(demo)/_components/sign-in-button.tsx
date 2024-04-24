"use client";

import { GoogleLogin } from "@react-oauth/google";
import { Button } from "@risc0/ui/button";
import jwtDecode from "jwt-decode";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useAsync } from "react-use";
import { useAccount } from "wagmi";
import { useLocalStorage } from "../_hooks/use-local-storage";
import { generateRandomString } from "../_utils/generate-random-string";

export default function SignInButton() {
  const [facebookUserInfos, setFacebookUserInfos] = useLocalStorage<any | null>("facebook-infos", null);
  const [facebookUserToken, setFacebookUserToken] = useLocalStorage<string | null>("facebook-token", null);
  const [googleUserInfos, setGoogleUserInfos] = useLocalStorage<any | null>("google-infos", null);
  const [googleUserToken, setGoogleUserToken] = useLocalStorage<string | null>("google-token", null);
  const [codeVerifier, setCodeVerifier] = useLocalStorage<string | null>("code-verifier", null);
  const router = useRouter();
  const { address } = useAccount();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  // if already logged in
  useEffect(() => {
    if (googleUserInfos || facebookUserInfos) {
      router.push("/");
    }
  }, [router.push, googleUserInfos, facebookUserInfos]);

  useEffect(() => {
    if (!googleUserToken || googleUserInfos) {
      return;
    }

    setGoogleUserInfos(jwtDecode(googleUserToken));
  }, [googleUserToken, setGoogleUserInfos, googleUserInfos]);

  useEffect(() => {
    if (!facebookUserToken || facebookUserInfos) {
      return;
    }

    setFacebookUserInfos(jwtDecode(facebookUserToken));
  }, [facebookUserToken, facebookUserInfos, setFacebookUserInfos]);

  useAsync(async () => {
    if (code && !facebookUserToken) {
      await fetch(
        `https://graph.facebook.com/v11.0/oauth/access_token?client_id=461759156201993&redirect_uri=http://localhost:3000/&code_verifier=${codeVerifier}&code=${code}`,
      )
        .then(async (res) => {
          const resJson = await res.json();

          if (resJson.id_token) {
            setFacebookUserToken(resJson.id_token);
          }
        })
        .catch(console.error);
    }
  }, [code, facebookUserToken]);

  useEffect(() => {
    if (!codeVerifier) {
      setCodeVerifier(generateRandomString(128));
    }
  }, [setCodeVerifier, codeVerifier]);

  return (
    <div className="flex flex-row gap-4">
      <GoogleLogin
        auto_select
        theme="filled_black"
        nonce={address}
        onSuccess={(response) => {
          if (response.credential) {
            setGoogleUserToken(response.credential);
          }
        }}
      />

      <Link
        href={`https://www.facebook.com/v11.0/dialog/oauth?client_id=461759156201993&scope=openid&response_type=code&redirect_uri=http://localhost:3000/&code_challenge=${codeVerifier}&code_challenge_method=plain&nonce=${address}`}
      >
        <Button
          className="rounded-lg relative flex text-white flex-row gap-4 justify-start [&>svg]:hidden pl-0 pr-6 bg-[#202124] hover:bg-neutral-600 min-h-10 font-bold"
          size="sm"
          variant="secondary"
        >
          <div className="rounded-s-md bg-white size-9 flex ml-0.5 items-center justify-center">
            <Image src="/facebook.png" alt="Facebook" width={20} height={20} />
          </div>
          Sign In with Facebook
        </Button>
      </Link>
    </div>
  );
}
