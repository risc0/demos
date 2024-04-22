"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@risc0/ui/card";
import { Progress } from "@risc0/ui/progress";
import { Skeleton } from "@risc0/ui/skeleton";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ConnectWalletButton } from "./_components/connect-wallet-button";
import { ProveButton } from "./_components/prove-button";
import SignInButton from "./_components/sign-in-button";
import { useLocalStorage } from "./_hooks/use-local-storage";
import { AMOUNT_OF_STEPS, calculateCompletionPercentage } from "./_utils/calculate-completion-percentage";

export default function AppPage() {
  const { address } = useAccount();
  const [userToken] = useLocalStorage("google-token", null);
  const [mounted, setMounted] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(1);

  useEffect(() => {
    if (!address) {
      setCurrentStep(1);
      return;
    }

    if (!userToken) {
      setCurrentStep(2);
      return;
    }

    setCurrentStep(3);
  }, [address, userToken]);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Card>
      <CardHeader>
        <Progress className="mb-4" value={mounted ? calculateCompletionPercentage(currentStep, AMOUNT_OF_STEPS) : 0} />

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
          <CardDescription>
            Step {currentStep} / {AMOUNT_OF_STEPS}
          </CardDescription>
        ) : (
          <Skeleton className="h-5 w-20" />
        )}
      </CardHeader>

      <CardContent>
        {mounted &&
          (currentStep === 1 ? <ConnectWalletButton /> : currentStep === 2 ? <SignInButton /> : <ProveButton />)}
      </CardContent>
    </Card>
  );
}
