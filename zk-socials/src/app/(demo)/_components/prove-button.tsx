"use client";

import { Alert, AlertDescription, AlertTitle } from "@risc0/ui/alert";
import { Button } from "@risc0/ui/button";
import { AlertTriangleIcon, VerifiedIcon } from "lucide-react";
import { useState } from "react";
import { useAccount } from "wagmi";
import { bonsaiProving } from "../_actions/bonsai-proving";
import { checkUserValidity } from "../_actions/check-user-validity";
import { useLocalStorage } from "../_hooks/use-local-storage";
import { SnarkTable } from "./snark-table";
import { StarkTable } from "./stark-table";
import { UserInfos } from "./user-infos";

export function ProveButton() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [starkResults, setStarkResults] = useState<any>();
  const [snarkResults, setSnarkResults] = useState<any>();
  const [isMinted, _setIsMinted] = useState<boolean>(false);
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
        setStarkResults(results.snarkStatus);
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
          disabled={starkResults || !!error || isMinted || isLoading}
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

        {starkResults && (
          <Alert className="mt-6 -mb-6 -mx-6 border-none w-[calc(100%+3rem)]">
            <AlertTitle>STARK Results</AlertTitle>
            <AlertDescription>
              <StarkTable starkData={starkResults} />
            </AlertDescription>
          </Alert>
        )}

        {snarkResults && (
          <Alert className="mt-6 -mb-6 -mx-6 border-none w-[calc(100%+3rem)]">
            <AlertTitle>SNARK Results</AlertTitle>
            <AlertDescription>
              <SnarkTable snarkData={snarkResults} />
            </AlertDescription>
          </Alert>
        )}
      </div>
    </>
  ) : null;
}
