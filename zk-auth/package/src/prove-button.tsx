"use client";

import { Alert, AlertDescription, AlertTitle } from "@risc0/ui/alert";
import { Button } from "@risc0/ui/button";
import { cn } from "@risc0/ui/cn";
import { useLocalStorage } from "@risc0/ui/hooks/use-local-storage";
import { Loader } from "@risc0/ui/loader";
import { AlertTriangleIcon } from "lucide-react";
import { useState } from "react";
import { BorderBeam } from "./border-beam";
import { doSnarkProving } from "./do-snark-proving";
import { doStarkProving } from "./do-stark-proving";
import { GoogleUserInfos } from "./google-user-infos";
import { SignOutButton } from "./sign-out-button";
import { TwitchUserInfos } from "./twitch-user-infos";

export function ProveButton({ address }: { address: string }) {
  const [_starkResults, setStarkResults] = useLocalStorage<any>(`stark-results-${address}`, undefined);
  const [_snarkResults, setSnarkResults] = useLocalStorage<any>(`snark-results-${address}`, undefined);

  // google
  const [googleUserInfos] = useLocalStorage(`google-infos-${address}`, undefined);
  const [googleUserToken] = useLocalStorage(`google-token-${address}`, undefined);

  // twitch
  const [twitchUserInfos] = useLocalStorage(`twitch-infos-${address}`, undefined);
  const [twitchUserToken] = useLocalStorage(`twitch-token-${address}`, undefined);

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

    if (!googleUserToken && !twitchUserToken) {
      console.error("JWT not found");
      setIsLoading(false);

      return;
    }

    try {
      const { starkUuid, starkStatus } = await doStarkProving({
        iss: googleUserInfos ? "Google" : twitchUserInfos ? "Twitch" : "test",
        setStarkPollingResults,
        token: googleUserToken ?? twitchUserToken ?? "",
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
      <div className="flex flex-row w-full items-center justify-end min-h-8">
        {!isLoading && <SignOutButton address={address} />}
      </div>

      <div className="w-full flex flex-1">
        <div className="flex flex-col flex-1 justify-end w-full">
          {isLoading ? (
            <Loader
              loadingSrc="https://zkauth.vercel.app/loading.gif"
              loadingText="☕️ This process will take a couple of minutes… Do not close your browser…"
            />
          ) : (
            <>
              <p className="mb-3 break-words text-xs w-full">
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
            </>
          )}

          <div className="mt-6 w-full">
            <Button
              isLoading={isLoading}
              onClick={handleClick}
              size="lg"
              autoFocus
              className="flex w-full mb-4 flex-row items-center gap-1.5"
              disabled={!!error || isLoading}
            >
              {isLoading ? "Proving" : "Prove"} with{" "}
              <img
                width={58}
                height={16}
                src="https://zkauth.vercel.app/bonsai-logo-dark.svg"
                alt="bonsai logo"
                className="relative -top-[1px]"
              />
            </Button>

            {starkPollingResults && starkPollingResults.length > 0 && (
              <Alert className="border-none py-0 px-0 animate-fade-in-up">
                {starkPollingResults.at(-1)?.status !== "SUCCEEDED" && (
                  <AlertDescription className="rounded border bg-neutral-50 font-mono relative min-h-[110.5px]">
                    <AlertTitle className="px-3 pt-3">
                      STARK{" "}
                      <span
                        className={cn(
                          "text-muted-foreground font-normal",
                          starkPollingResults.at(-1)?.status === "SUCCEEDED" && "font-bold text-green-600",
                          starkPollingResults.at(-1)?.status === "FAILED" && "font-bold text-red-600",
                        )}
                      >
                        ({starkPollingResults.at(-1)?.status})
                      </span>
                    </AlertTitle>

                    <BorderBeam size={110.5} duration={5} />

                    <div className="flex flex-row items-start justify-between gap-2 px-3 py-2">
                      <div className="flex flex-col leading-tight">
                        {starkPollingResults.slice(-5).map((result: any) => (
                          <code key={result} className="block text-[10px]">
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
              <Alert className="border-none py-0 px-0 animate-fade-in-up">
                <AlertDescription className="rounded border bg-neutral-50 font-mono relative min-h-[64px] ">
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
