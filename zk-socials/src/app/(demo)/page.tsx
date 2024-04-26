"use client";

import crypto from "crypto";
import { Alert, AlertDescription, AlertTitle } from "@risc0/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@risc0/ui/card";
import { cn } from "@risc0/ui/cn";
import { Progress } from "@risc0/ui/progress";
import { Skeleton } from "@risc0/ui/skeleton";
import Pusher from "pusher-js";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import env from "~/env";
import { Confetti } from "./_components/confetti";
import { ConnectWalletButton } from "./_components/connect-wallet-button";
import { ProveButton } from "./_components/prove-button";
import SignInButton from "./_components/sign-in-button";
import { SnarkTable } from "./_components/snark-table";
import { StarkTable } from "./_components/stark-table";
import { useLocalStorage } from "./_hooks/use-local-storage";
import { useMounted } from "./_hooks/use-mounted";
import { AMOUNT_OF_STEPS, calculateCompletionPercentage } from "./_utils/calculate-completion-percentage";

export default function AppPage() {
  const { address } = useAccount();
  const [googleUserToken] = useLocalStorage("google-token", null);
  const [facebookUserToken] = useLocalStorage("facebook-token", null);
  const mounted = useMounted();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [codeVerifier, setCodeVerifier] = useLocalStorage<string | undefined>("code-verifier", undefined);
  const [starkResults] = useLocalStorage<any | undefined>("stark-results", undefined);
  const [snarkResults] = useLocalStorage<any | undefined>("snark-results", undefined);
  const [snarkPollingResults, setSnarkPollingResults] = useState<any>();
  const [starkPollingResults, setStarkPollingResults] = useState<any>();

  // biome-ignore lint/correctness/useExhaustiveDependencies: run once
  useEffect(() => {
    const channelName = `my-channel-${crypto
      .createHash("sha256")
      .update(googleUserToken ?? facebookUserToken ?? "")
      .digest("hex")}`; // channel names have a maximum amount of chars allowed
    const pusher = new Pusher(env.NEXT_PUBLIC_PUSHER_API_KEY, {
      cluster: "us3",
    });
    const channel = pusher.subscribe(channelName);

    channel.bind("stark-event", (data) => {
      setStarkPollingResults(data);
    });

    channel.bind("snark-event", (data) => {
      setSnarkPollingResults(data);
    });
  }, []);

  useEffect(() => {
    if (!address) {
      setCurrentStep(1);
      return;
    }

    if (!googleUserToken && !facebookUserToken) {
      setCurrentStep(2);
      return;
    }

    if (starkResults || snarkResults) {
      setCurrentStep(4);
      return;
    }

    setCurrentStep(3);
  }, [address, googleUserToken, facebookUserToken, starkResults, snarkResults]);

  useEffect(() => {
    if (currentStep === 3 && codeVerifier) {
      setCodeVerifier(undefined);
    }
  }, [currentStep, codeVerifier, setCodeVerifier]);

  return (
    <>
      {currentStep === 4 && <Confetti />}

      <Card className="overflow-auto shadow-sm">
        <CardHeader>
          <Progress
            className="mb-4"
            value={mounted ? calculateCompletionPercentage(currentStep, AMOUNT_OF_STEPS) : 0}
          />

          {mounted ? (
            <CardTitle>
              {currentStep === 1
                ? "Connect your Wallet"
                : currentStep === 2
                  ? "Sign In with Social Account"
                  : "Prove with Bonsai™"}
            </CardTitle>
          ) : (
            <Skeleton className="h-4 w-40" />
          )}

          {mounted ? (
            currentStep === AMOUNT_OF_STEPS ? (
              <CardDescription>Finished</CardDescription>
            ) : (
              <CardDescription>
                Step {currentStep} / {AMOUNT_OF_STEPS - 1}
              </CardDescription>
            )
          ) : (
            <Skeleton className="h-5 w-20" />
          )}
        </CardHeader>

        <CardContent>
          {mounted &&
            (currentStep === 1 ? (
              <ConnectWalletButton />
            ) : currentStep === 2 ? (
              <SignInButton />
            ) : currentStep === 3 ? (
              <>
                <ProveButton />

                {starkPollingResults && (
                  <Alert className="mt-4 border-none px-0">
                    <AlertTitle>
                      STARK Results{" "}
                      <span
                        className={cn(
                          starkPollingResults.status === "SUCCEEDED" && "text-green-600 dark:text-green-500",
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
                  <Alert className="border-none px-0">
                    <AlertTitle>
                      SNARK Results{" "}
                      <span
                        className={cn(
                          snarkPollingResults.status === "SUCCEEDED" && "text-green-600 dark:text-green-500",
                        )}
                      >
                        ({snarkPollingResults.status})
                      </span>
                    </AlertTitle>
                  </Alert>
                )}
              </>
            ) : (
              <>
                {starkResults && (
                  <Alert className="border-none px-0">
                    <AlertTitle>STARK Results</AlertTitle>
                    <AlertDescription className="rounded border bg-neutral-50 dark:bg-neutral-900">
                      <StarkTable starkData={starkResults} />
                    </AlertDescription>
                  </Alert>
                )}

                {snarkResults && (
                  <Alert className="border-none px-0 pb-0">
                    <AlertTitle>SNARK Results</AlertTitle>
                    <AlertDescription className="rounded border bg-neutral-50 dark:bg-neutral-900">
                      <SnarkTable snarkData={snarkResults} />
                    </AlertDescription>
                  </Alert>
                )}
              </>
            ))}
        </CardContent>
      </Card>
    </>
  );
}
