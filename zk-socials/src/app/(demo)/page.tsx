"use client";

import { Alert, AlertDescription, AlertTitle } from "@risc0/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@risc0/ui/card";
import { Progress } from "@risc0/ui/progress";
import { Skeleton } from "@risc0/ui/skeleton";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { Confetti } from "./_components/confetti";
import { ConnectWalletButton } from "./_components/connect-wallet-button";
import { ProveButton } from "./_components/prove-button";
import SignInButton from "./_components/sign-in-button";
import { SnarkTable } from "./_components/snark-table";
import { StarkTable } from "./_components/stark-table";
import { useLocalStorage } from "./_hooks/use-local-storage";
import { AMOUNT_OF_STEPS, calculateCompletionPercentage } from "./_utils/calculate-completion-percentage";

export default function AppPage() {
  const { address } = useAccount();
  const [googleUserToken] = useLocalStorage("google-token", null);
  const [facebookUserToken] = useLocalStorage("facebook-token", null);
  const [mounted, setMounted] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [_codeVerifier, setCodeVerifier] = useLocalStorage<string | undefined>("code-verifier", undefined);
  const [starkResults] = useLocalStorage<any | undefined>("stark-results", undefined);
  const [snarkResults] = useLocalStorage<any | undefined>("snark-results", undefined);

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
    setCodeVerifier(undefined);
  }, [address, googleUserToken, facebookUserToken, setCodeVerifier, starkResults, snarkResults]);

  useEffect(() => {
    setMounted(true);
  }, []);

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
              <ProveButton />
            ) : (
              <>
                {starkResults && (
                  <Alert className="border-none px-0">
                    <AlertTitle>STARK Results</AlertTitle>
                    <AlertDescription className="rounded border bg-neutral-900">
                      <StarkTable starkData={starkResults} />
                    </AlertDescription>
                  </Alert>
                )}

                {snarkResults && (
                  <Alert className="border-none px-0 pb-0">
                    <AlertTitle>SNARK Results</AlertTitle>
                    <AlertDescription className="rounded border bg-neutral-900">
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
