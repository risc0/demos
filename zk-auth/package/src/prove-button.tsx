"use client";

import { Alert, AlertDescription, AlertTitle } from "@risc0/ui/alert";
import { Button } from "@risc0/ui/button";
import { cn } from "@risc0/ui/cn";
import { useLocalStorage } from "@risc0/ui/hooks/use-local-storage";
import { Loader } from "@risc0/ui/loader";
import { AlertTriangleIcon, Loader2Icon } from "lucide-react";
import { useState, useTransition } from "react";
import { doSnarkProving } from "./do-snark-proving";
import { doStarkProving } from "./do-stark-proving";
import { UserInfos } from "./user-infos";

export function ProveButton({ address }: { address: string }) {
  const [isPending, startTransition] = useTransition();
  const [_starkResults, setStarkResults] = useLocalStorage<any | undefined>("stark-results", undefined);
  const [_snarkResults, setSnarkResults] = useLocalStorage<any | undefined>("snark-results", undefined);
  const [googleUserInfos] = useLocalStorage("google-infos", undefined);
  const [googleUserToken] = useLocalStorage<string | undefined>("google-token", undefined);
  const [error, setError] = useState<any>();
  const [snarkPollingResults, setSnarkPollingResults] = useState<any>();
  const [starkPollingResults, setStarkPollingResults] = useState<any>();

  // this function takes care of creating the STARK session, which then returns a UUID
  // we then use this UUID to create a SNARK session
  // lastly, we get all the results from the STARK and SNARK sessions
  // this gets around Vercel's time limit for serverless functions
  function handleClick() {
    if (!googleUserToken) {
      console.error("JWT not found");
      return;
    }

    //@ts-expect-error idk why this is not working
    startTransition(async () => {
      try {
        const { starkUuid, starkStatus } = await doStarkProving({
          iss: googleUserInfos ? "Google" : "test",
          setStarkPollingResults,
          token: googleUserToken ?? "",
        });
        const { snarkStatus } = await doSnarkProving({
          setSnarkPollingResults,
          starkUuid,
        });

        setStarkResults(starkStatus);
        setSnarkResults(snarkStatus);
      } catch (error) {
        console.error("Error proving:", error);
        setError(error);
      }
    });
  }

  return address ? (
    <>
      {isPending ? (
        <Loader
          loadingSrc="https://zkauth.vercel.app/loading.gif"
          loadingText="☕️ This will take a couple of minutes… Do not close your browser…"
        />
      ) : (
        <>
          <p className="mb-3 break-words text-xs">
            You are about to prove that address <strong title={address}>{address}</strong> owns the following social
            account:
          </p>

          {googleUserInfos && <UserInfos type="google" userInfos={googleUserInfos} />}
        </>
      )}

      <div className="mt-6 w-full">
        <Button
          isLoading={isPending}
          onClick={handleClick}
          size="lg"
          autoFocus
          className="flex w-full flex-row items-center gap-1.5"
          disabled={!!error || isPending}
        >
          Prove with{" "}
          <img
            className="-top-[1px] relative"
            width={58}
            height={16}
            src="https://zkauth.vercel.app/bonsai-logo-dark.svg"
            alt="bonsai logo"
          />
        </Button>

        {starkPollingResults && starkPollingResults.length > 0 && (
          <Alert className="mt-4 border-none px-0">
            <AlertTitle>
              STARK Results{" "}
              <span
                className={cn(
                  "text-muted-foreground",
                  starkPollingResults.at(-1)?.status === "SUCCEEDED" && "font-bold text-green-600 dark:text-green-500",
                  starkPollingResults.at(-1)?.status === "FAILED" && "font-bold text-red-600 dark:text-red-500",
                )}
              >
                ({starkPollingResults.at(-1)?.status})
              </span>
            </AlertTitle>
            {starkPollingResults.at(-1)?.status !== "SUCCEEDED" && (
              <AlertDescription className="rounded border bg-neutral-50 font-mono dark:bg-neutral-900">
                <div className="flex flex-row items-start justify-between gap-2 px-3 py-2">
                  <div className="flex flex-col">
                    {starkPollingResults.map((result: any, index: any) => (
                      <code key={index} className="block text-[10px]">
                        {result.state}
                      </code>
                    ))}
                  </div>
                  <Loader2Icon className="mt-[0.25rem] size-3.5 animate-spin text-border" />
                </div>
              </AlertDescription>
            )}
          </Alert>
        )}

        {snarkPollingResults && (
          <Alert className="border-none px-0 pb-0">
            <AlertTitle>
              SNARK Results{" "}
              <span
                className={cn(
                  snarkPollingResults.status === "SUCCEEDED" && "font-bold text-green-600 dark:text-green-500",
                  snarkPollingResults.status === "FAILED" && "font-bold text-red-600 dark:text-red-500",
                )}
              >
                ({snarkPollingResults.status})
              </span>
            </AlertTitle>
            <AlertDescription className="rounded border bg-neutral-50 font-mono dark:bg-neutral-900">
              <div className="flex flex-row items-center justify-between gap-2 px-3 py-2 text-xs">
                This will take ~2 minutes <Loader2Icon className="size-3.5 animate-spin text-border" />
              </div>
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mt-2">
            <AlertTriangleIcon className="size-4" />
            <AlertTitle>Error {error.status}</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}
      </div>
    </>
  ) : null;
}
