import "./style.css";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { useLocalStorage } from "@risc0/ui/hooks/use-local-storage";
import { useEffect, useState } from "react";
import { ProveButton } from "./prove-button";
import { SignInButton } from "./sign-in-button";
import { SignOutButton } from "./sign-out-button";

export type ZkAuthProps = {
  address: string;
  onStarkComplete?: (starkResults: any) => void;
  onSnarkComplete?: (snarkResults: any) => void;
};

export function ZkAuth({ address, onStarkComplete, onSnarkComplete }: ZkAuthProps) {
  const [googleUserToken] = useLocalStorage(`google-token-${address}`, null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [starkResults] = useLocalStorage(`stark-results-${address}`, undefined);
  const [snarkResults] = useLocalStorage(`snark-results-${address}`, undefined);

  useEffect(() => {
    if (!googleUserToken) {
      setCurrentStep(1);
      return;
    }

    if (starkResults || snarkResults) {
      setCurrentStep(3);
      return;
    }

    setCurrentStep(2);
  }, [googleUserToken, starkResults, snarkResults]);

  useEffect(() => {
    if (starkResults && onStarkComplete) {
      onStarkComplete(starkResults);
    }
  }, [starkResults, onStarkComplete]);

  useEffect(() => {
    if (snarkResults && onSnarkComplete) {
      onSnarkComplete(snarkResults);
    }
  }, [snarkResults, onSnarkComplete]);

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div className="font-sans w-[320px] min-h-[320px] flex flex-col items-center justify-between relative">
        {currentStep === 1 ? (
          <SignInButton address={address} />
        ) : currentStep === 2 ? (
          <ProveButton address={address} />
        ) : (
          <>
            Proving complete (check console for results)
            <button
              type="button"
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
            >
              wipe local storage
            </button>
          </>
        )}
      </div>
    </GoogleOAuthProvider>
  );
}
