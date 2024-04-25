"use client";

import { Alert, AlertDescription, AlertTitle } from "@risc0/ui/alert";
import { Button } from "@risc0/ui/button";
import { cn } from "@risc0/ui/cn";
import { Loader } from "@risc0/ui/loader";
import { AlertTriangleIcon, VerifiedIcon } from "lucide-react";
import { useState } from "react";
import { useAccount } from "wagmi";
import type { FacebookUserInfos } from "~/types/facebook";
import type { GoogleUserInfos } from "~/types/google";
import { bonsaiProving } from "../_actions/bonsai-proving";
import { checkUserValidity } from "../_actions/check-user-validity";
import { useLocalStorage } from "../_hooks/use-local-storage";
import { UserInfos } from "./user-infos";

export function ProveButton() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [_starkResults, setStarkResults] = useLocalStorage<any | undefined>("stark-results", undefined);
  const [_snarkResults, setSnarkResults] = useLocalStorage<any | undefined>("snark-results", undefined);
  const [facebookUserInfos] = useLocalStorage<FacebookUserInfos | undefined>("facebook-infos", undefined);
  const [facebookUserToken] = useLocalStorage<string | undefined>("facebook-token", undefined);
  const [googleUserInfos] = useLocalStorage<GoogleUserInfos | undefined>("google-infos", undefined);
  const [googleUserToken] = useLocalStorage<string | undefined>("google-token", undefined);
  const [error, setError] = useState<any>();
  const { address } = useAccount();

  async function handleClick() {
    setIsLoading(true);

    if (!facebookUserToken && !googleUserToken) {
      console.error("JWT not found");
      setIsLoading(false);

      return;
    }

    try {
      const results = await bonsaiProving(googleUserToken ?? facebookUserToken ?? "");

      if (results) {
        setStarkResults(results.starkStatus);
        setSnarkResults(results.snarkStatus);
      }
    } catch (error) {
      console.error("Error fetching:", error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }

  return address ? (
    <>
      <p className="mb-3 break-words text-xs">
        You are about to prove that address <strong>{address}</strong> owns the following social account(s):
      </p>

      {googleUserInfos && <UserInfos type="google" userInfos={googleUserInfos} />}
      {facebookUserInfos && <UserInfos type="facebook" userInfos={facebookUserInfos} />}

      <div className="mt-6">
        <Button
          isLoading={isLoading}
          onClick={async () => {
            const result = await checkUserValidity({ emailOrId: googleUserInfos?.email ?? facebookUserInfos?.id });

            if (result.status === 200) {
              // success
              handleClick();
            } else {
              // error
              setError(result);
            }

            await handleClick();
          }}
          startIcon={<VerifiedIcon />}
          size="lg"
          autoFocus
          className={cn("w-full", isLoading && "mb-4")}
          disabled={!!error || isLoading}
        >
          Prove with Bonsai™
        </Button>

        {isLoading && <Loader loadingText="☕️ This will take a couple of minutes… Do not close your browser…" />}

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangleIcon className="size-4" />
            <AlertTitle>Error {error.status}</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}
      </div>
    </>
  ) : null;
}
