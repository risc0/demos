"use client";

import { Alert, AlertDescription, AlertTitle } from "@risc0/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@risc0/ui/card";
import { useLocalStorage } from "@risc0/ui/hooks/use-local-storage";
import { useMounted } from "@risc0/ui/hooks/use-mounted";
import { Progress } from "@risc0/ui/progress";
import { Skeleton } from "@risc0/ui/skeleton";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { Confetti } from "./_components/confetti";
import { ConnectWalletButton } from "./_components/connect-wallet-button";
import { ProveButton } from "./_components/prove-button";
import { SignInButton } from "./_components/sign-in-button";
import { SnarkTable } from "./_components/snark-table";
import { StarkTable } from "./_components/stark-table";
import { TermsAndServices } from "./_components/terms-and-services";
import { WebAuthnButton } from "./_components/webauthn-button";
import { AMOUNT_OF_STEPS, calculateCompletionPercentage } from "./_utils/calculate-completion-percentage";

export default function AppPage() {
  const { address } = useAccount();
  const { resolvedTheme } = useTheme();
  const [googleUserToken] = useLocalStorage("google-token", null);
  const mounted = useMounted();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [codeVerifier, setCodeVerifier] = useLocalStorage<string | undefined>("code-verifier", undefined);
  const [starkResults] = useLocalStorage<any | undefined>("stark-results", undefined);
  const [snarkResults] = useLocalStorage<any | undefined>("snark-results", undefined);
  const router = useRouter();

  useEffect(() => {
    if (!address) {
      setCurrentStep(1);
      return;
    }

    if (!googleUserToken) {
      setCurrentStep(2);
      return;
    }

    if (starkResults || snarkResults) {
      setCurrentStep(4);
      return;
    }

    setCurrentStep(3);
  }, [address, googleUserToken, starkResults, snarkResults]);

  useEffect(() => {
    if (currentStep === 3 && codeVerifier) {
      setCodeVerifier(undefined);
      router.push("/");
    }
  }, [currentStep, router.push, codeVerifier, setCodeVerifier]);

  return (
    <>
      {currentStep === 4 && <Confetti />}

      <Card className="overflow-auto rounded-lg shadow-sm">
        <CardHeader>
          <Progress
            className="mb-4"
            value={mounted ? calculateCompletionPercentage(currentStep, AMOUNT_OF_STEPS) : 0}
          />

          {mounted ? (
            <CardTitle>
              {currentStep === 1 ? (
                "Connect Your Wallet"
              ) : currentStep === 2 ? (
                "Sign In with Social Account"
              ) : (
                <div className="flex flex-row items-center gap-1.5">
                  Prove with{" "}
                  <Link className="transition-opacity hover:opacity-70" target="_blank" href="https://www.bonsai.xyz/">
                    <Image
                      className="-top-[1px] relative"
                      width={58}
                      height={16}
                      src={resolvedTheme === "dark" ? "/bonsai-logo-dark.svg" : "/bonsai-logo-light.svg"}
                      alt="bonsai logo"
                    />
                  </Link>
                </div>
              )}
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
              <>
                <ConnectWalletButton />
                <WebAuthnButton />
              </>
            ) : currentStep === 2 ? (
              <div className="flex justify-center">
                <SignInButton />
              </div>
            ) : currentStep === 3 ? (
              <ProveButton />
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

          <TermsAndServices />
        </CardContent>
      </Card>
    </>
  );
}
