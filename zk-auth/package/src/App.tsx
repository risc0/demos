import "@risc0/ui/styles/globals.css";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { Alert, AlertDescription, AlertTitle } from "@risc0/ui/alert";
import { useLocalStorage } from "@risc0/ui/hooks/use-local-storage";
import { useEffect, useState } from "react";
import { ProveButton } from "./prove-button";
import { SignInButton } from "./sign-in-button";
import { SignOutButton } from "./sign-out-button";
import { SnarkTable } from "./snark-table";
import { StarkTable } from "./stark-table";

export function App({ address }: { address: string }) {
  const [googleUserToken] = useLocalStorage(`google-token-${address}`, null);
  const [currentStep, setCurrentStep] = useState(1);
  const [starkResults] = useLocalStorage(`stark-results-${address}`, undefined);
  const [snarkResults] = useLocalStorage(`snark-results-${address}`, undefined);

  useEffect(() => {
    if (!googleUserToken) {
      setCurrentStep(2);
      return;
    }

    if (starkResults || snarkResults) {
      setCurrentStep(4);
      return;
    }

    setCurrentStep(3);
  }, [googleUserToken, starkResults, snarkResults]);

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <SignOutButton address={address} />

      {currentStep === 2 ? (
        <SignInButton address={address} />
      ) : currentStep === 3 ? (
        <ProveButton address={address} />
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
      )}
    </GoogleOAuthProvider>
  );
}
