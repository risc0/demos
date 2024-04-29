"use client";

import { Alert, AlertDescription, AlertTitle } from "@risc0/ui/alert";
import { Button } from "@risc0/ui/button";
import { cn } from "@risc0/ui/cn";
import { useLocalStorage } from "@risc0/ui/hooks/use-local-storage";
import { Loader } from "@risc0/ui/loader";
import { AlertTriangleIcon, Loader2Icon, VerifiedIcon } from "lucide-react";
import { useState } from "react";
import { useAccount } from "wagmi";
import type { FacebookUserInfos } from "~/types/facebook";
import type { GoogleUserInfos } from "~/types/google";
import type { SnarkSessionStatusRes, StarkSessionStatusRes } from "../_actions/bonsai-proving";
import { checkUserValidity } from "../_actions/check-user-validity";
import { doSnarkProving } from "../_utils/do-snark-proving";
import { doStarkProving } from "../_utils/do-stark-proving";
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
  const [snarkPollingResults, setSnarkPollingResults] = useState<SnarkSessionStatusRes>();
  const [starkPollingResults, setStarkPollingResults] = useState<StarkSessionStatusRes>();

  // this beast of a function takes care of creating the STARK session, which then returns a UUID
  // we then use this UUID to create a SNARK session
  // lastly, we get all the results from the STARK and SNARK sessions
  // this gets around Vercel's time limit for serverless functions
  async function handleClick() {
    setIsLoading(true);

    if (!facebookUserToken && !googleUserToken) {
      console.error("JWT not found");
      setIsLoading(false);

      return;
    }

    try {
      const { starkUuid, starkStatus } = await doStarkProving({
        iss: googleUserInfos ? "google" : "facebook",
        setStarkPollingResults,
        token: googleUserToken ?? facebookUserToken ?? "",
      });
      const { snarkStatus } = await doSnarkProving({ setSnarkPollingResults, starkUuid });

      setStarkResults(starkStatus);
      setSnarkResults(snarkStatus);
    } catch (error) {
      console.error("Error proving:", error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }

  return address ? (
    <>
      {isLoading ? (
        <Loader loadingText="☕️ This will take a couple of minutes… Do not close your browser…" />
      ) : (
        <>
          <p className="mb-3 break-words text-xs">
            You are about to prove that address <strong>{address}</strong> owns the following social account(s):
          </p>

          {googleUserInfos && <UserInfos type="google" userInfos={googleUserInfos} />}
          {facebookUserInfos && <UserInfos type="facebook" userInfos={facebookUserInfos} />}
        </>
      )}

      <div className="mt-6">
        <Button
          isLoading={isLoading}
          onClick={async () => {
            const _result = await checkUserValidity({ emailOrId: googleUserInfos?.email ?? facebookUserInfos?.id });

            //if (result.status === 200) {
            // success
            await handleClick();
            /*} else {
              // error
              setError(result);
            }*/
          }}
          startIcon={<VerifiedIcon />}
          size="lg"
          autoFocus
          className="w-full"
          disabled={!!error || isLoading}
        >
          Prove with Bonsai™
        </Button>

        {starkPollingResults && (
          <Alert className="mt-4 border-none px-0">
            <AlertTitle>
              STARK Results{" "}
              <span
                className={cn(
                  starkPollingResults.status === "SUCCEEDED" && "font-bold text-green-600 dark:text-green-500",
                )}
              >
                ({starkPollingResults.status})
              </span>
            </AlertTitle>
            <AlertDescription className="rounded border bg-neutral-50 font-mono dark:bg-neutral-900">
              {starkPollingResults.state}
            </AlertDescription>
          </Alert>
        )}

        {snarkPollingResults && (
          <Alert className="border-none px-0 pb-0">
            <AlertTitle>
              SNARK Results{" "}
              <span
                className={cn(
                  snarkPollingResults.status === "SUCCEEDED" && "font-bold text-green-600 dark:text-green-500",
                )}
              >
                ({snarkPollingResults.status})
              </span>
            </AlertTitle>
            <AlertDescription>
              <Loader2Icon className="mt-0.5 size-4 animate-spin" />
            </AlertDescription>
          </Alert>
        )}

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
