"use client";

import { Alert, AlertDescription, AlertTitle } from "@risc0/ui/alert";
import { Button } from "@risc0/ui/button";
import { AlertTriangleIcon, VerifiedIcon } from "lucide-react";
import { useState } from "react";
import { useAccount } from "wagmi";
import { checkUserValidity } from "../_actions/check-user-validity";
import { useLocalStorage } from "../_hooks/use-local-storage";
import { UserInfos } from "./user-infos";

export function ProveButton() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMinted, _setIsMinted] = useState<boolean>(false);
  const [error, _setError] = useState<{ message?: string; status: number }>();
  const { address } = useAccount();
  const [facebookUserInfos] = useLocalStorage<any | null>("facebook-infos", null);
  const [googleUserInfos] = useLocalStorage<any | null>("google-infos", null);
  const [userToken] = useLocalStorage<string | null>("google-token", null);

  const handleClick = async () => {
    setIsLoading(true);

    if (!userToken) {
      console.error("JWT not found");
      setIsLoading(false);

      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8080/authenticate", {
        method: "GET",
        headers: {
          "X-Auth-Token": userToken,
        },
      });

      if (response.ok) {
        const _result = await response.json();
      } else {
        throw new Error("Response not OK");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return address ? (
    <>
      <p className="mb-3 break-words text-xs">
        You are about to prove that address <strong>{address}</strong> owns the following social account(s):
      </p>

      {googleUserInfos && <UserInfos type="google" userInfos={googleUserInfos} />}
      {facebookUserInfos && <UserInfos type="facebook" userInfos={facebookUserInfos} />}

      <div className="mt-8">
        <Button
          isLoading={isLoading}
          onClick={async () => {
            /*const result = await checkUserValidity({ email: userInfos.email });

            if (result.status === 200) {
              // success
              handleClick();
            } else {
              // error
              setError(result);
            }*/
            handleClick(); //TODO: turn on to prevent abuse
          }}
          startIcon={<VerifiedIcon />}
          size="lg"
          autoFocus
          className="w-full"
          disabled={!!error || isMinted || isLoading}
        >
          {isMinted ? "Minted" : "Prove with Bonsai™"}
        </Button>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangleIcon className="size-4" />

            <AlertTitle>Error {error.status}</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        {isLoading && <p className="mt-2">This Will Take a Couple of Minutes… Hang Tight…</p>}
      </div>
    </>
  ) : null;
}
