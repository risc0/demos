"use client";

import { Alert, AlertDescription, AlertTitle } from "@risc0/ui/alert";
import { Button } from "@risc0/ui/button";
import { AlertTriangleIcon, VerifiedIcon } from "lucide-react";
import { useState } from "react";
import { useAccount } from "wagmi";
import { bonsaiProving } from "../_actions/bonsai-proving";
import { checkUserValidity } from "../_actions/check-user-validity";
import { useLocalStorage } from "../_hooks/use-local-storage";
import { UserInfos } from "./user-infos";

export function ProveButton() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [_starkResults, setStarkResults] = useLocalStorage<any | undefined>("stark-results", undefined);
  const [_snarkResults, setSnarkResults] = useLocalStorage<any | undefined>("snark-results", undefined);
  const [error, setError] = useState<any>();
  const { address } = useAccount();
  const [facebookUserInfos] = useLocalStorage<any | undefined>("facebook-infos", undefined);
  const [facebookUserToken] = useLocalStorage<string | undefined>("facebook-token", undefined);
  const [googleUserInfos] = useLocalStorage<any | undefined>("google-infos", undefined);
  const [googleUserToken] = useLocalStorage<string | undefined>("google-token", undefined);

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

      <div className="mt-8">
        <Button
          isLoading={isLoading}
          onClick={async () => {
            // TODO: put back when ready
            /*const result = await checkUserValidity({ emailOrId: googleUserInfos?.email ?? facebookUserInfos?.id });

            if (result.status === 200) {
              // success
              handleClick();
            } else {
              // error
              setError(result);
            }*/
            await handleClick(); //TODO: turn on to prevent abuse
          }}
          startIcon={<VerifiedIcon />}
          size="lg"
          autoFocus
          className="w-full"
          disabled={!!error || isLoading}
        >
          Prove with Bonsai™
        </Button>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangleIcon className="size-4" />

            <AlertTitle>Error {error.status}</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        {isLoading && <p className="mt-2">This will take a couple of minutes… Do not close your browser…</p>}
      </div>
    </>
  ) : null;
}
