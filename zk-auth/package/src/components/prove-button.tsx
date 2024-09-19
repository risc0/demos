"use client";

import { Alert, AlertDescription, AlertTitle } from "@risc0/ui/alert";
import { Button } from "@risc0/ui/button";
import { cn } from "@risc0/ui/cn";
import { useLocalStorage } from "@risc0/ui/hooks/use-local-storage";
import { Loader } from "@risc0/ui/loader";
import { AlertTriangleIcon } from "lucide-react";
import { useState } from "react";
import { useSocialsLocalStorage } from "../hooks/use-socials";
import { doSnarkProving } from "../utils/do-snark-proving";
import { doStarkProving } from "../utils/do-stark-proving";
import { BorderBeam } from "./border-beam";
import { GoogleUserInfos } from "./google-user-infos";
import { LinkedInUserInfos } from "./linkedin-user-infos";
import { SignOutButton } from "./sign-out-button";
import { TwitchUserInfos } from "./twitch-user-infos";

export function ProveButton({ address }: { address: `0x${string}` }) {
  const [_starkResults, setStarkResults] = useLocalStorage<any>(`stark-results-${address}`, undefined);
  const [_snarkResults, setSnarkResults] = useLocalStorage<any>(`snark-results-${address}`, undefined);
  const { googleUserInfos, twitchUserInfos, linkedInUserToken, linkedInUserInfos, googleUserToken, twitchUserToken } =
    useSocialsLocalStorage({ address });
  const [error, setError] = useState<any>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [snarkPollingResults, setSnarkPollingResults] = useState<any>();
  const [starkPollingResults, setStarkPollingResults] = useState<any>();

  // this function takes care of creating the STARK session, which then returns a UUID
  // we then use this UUID to create a SNARK session
  // lastly, we get all the results from the STARK and SNARK sessions
  // this gets around Vercel's time limit for serverless functions
  async function handleClick() {
    setIsLoading(true);

    if (!googleUserToken && !twitchUserToken && !linkedInUserToken) {
      console.error("JWT not found");
      setIsLoading(false);

      return;
    }

    try {
      const { starkUuid, starkStatus } = await doStarkProving({
        iss: googleUserInfos ? "Google" : twitchUserInfos ? "Twitch" : linkedInUserInfos ? "LinkedIn" : "test",
        setStarkPollingResults,
        token: googleUserToken ?? twitchUserToken ?? linkedInUserToken ?? "",
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
      <div className="flex min-h-8 w-full flex-row items-center justify-end">
        {!isLoading && <SignOutButton address={address} />}
      </div>

      <div className="flex w-full flex-1">
        <div className="flex w-full flex-1 flex-col justify-end">
          {isLoading ? (
            <Loader
              loadingSrc="https://zkauth.vercel.app/loading.gif"
              loadingText="☕️ This process will take a couple of minutes… Do not close your browser…"
            />
          ) : (
            <>
              <p className="mb-3 w-full break-words text-xs">
                You are about to prove that address
                <br />
                <strong className="w-full" title={address}>
                  {address}
                </strong>
                <br />
                owns the following social account:
              </p>

              {googleUserInfos && <GoogleUserInfos userInfos={googleUserInfos} />}
              {twitchUserInfos && <TwitchUserInfos userInfos={twitchUserInfos} />}
              {linkedInUserInfos && <LinkedInUserInfos userInfos={linkedInUserInfos} />}
            </>
          )}

          <div className="mt-6 w-full">
            <Button
              isLoading={isLoading}
              onClick={handleClick}
              size="lg"
              autoFocus
              className="mb-4 flex w-full flex-row items-center gap-1.5"
              disabled={!!error || isLoading}
            >
              {isLoading ? "Proving" : "Prove"} with{" "}
              <img
                width={58}
                height={16}
                src="https://zkauth.vercel.app/bonsai-logo-dark.svg"
                alt="bonsai logo"
                className="-top-[1px] relative"
              />
            </Button>

            {starkPollingResults && starkPollingResults.length > 0 && (
              <Alert className="animate-fade-in-up border-none px-0 py-0">
                {starkPollingResults.at(-1)?.status !== "SUCCEEDED" && (
                  <AlertDescription className="relative min-h-[110.5px] rounded border bg-neutral-50 font-mono">
                    <AlertTitle className="px-3 pt-3">
                      STARK{" "}
                      <span
                        className={cn(
                          "font-normal text-muted-foreground",
                          starkPollingResults.at(-1)?.status === "FAILED" && "font-bold text-red-600",
                        )}
                      >
                        ({starkPollingResults.at(-1)?.status})
                      </span>
                    </AlertTitle>

                    {starkPollingResults.at(-1)?.status === "RUNNING" && <BorderBeam size={110.5} duration={5} />}

                    <div className="flex flex-row items-start justify-between gap-2 px-3 py-2">
                      <div className="flex flex-col leading-tight">
                        {starkPollingResults.slice(-5).map((result: any, index: number) => (
                          <code key={`${result}-${index}`} className="block text-[10px]">
                            {result.state}
                          </code>
                        ))}
                      </div>
                    </div>
                  </AlertDescription>
                )}
              </Alert>
            )}

            {snarkPollingResults && (
              <Alert className="animate-fade-in-up border-none px-0 py-0">
                <AlertDescription className="relative min-h-[64px] rounded border bg-neutral-50 font-mono ">
                  <AlertTitle className="px-3 pt-3">
                    SNARK{" "}
                    <span
                      className={cn(
                        "text-muted-foreground",
                        snarkPollingResults.status === "SUCCEEDED" && "font-bold text-green-600",
                        snarkPollingResults.status === "FAILED" && "font-bold text-red-600",
                      )}
                    >
                      ({snarkPollingResults.status})
                    </span>
                  </AlertTitle>

                  <BorderBeam size={64} duration={5} />

                  <div className="flex flex-row items-center justify-between gap-2 px-3 py-2 text-xs">
                    This should take around 2 minutes…
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
        </div>
      </div>
    </>
  ) : null;
}
