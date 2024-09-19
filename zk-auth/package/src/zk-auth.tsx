import "./style.css";

import { useLocalStorage } from "@risc0/ui/hooks/use-local-storage";
import { useEffect, useState } from "react";
import { ProveButton } from "./components/prove-button";
import { SignInButton } from "./components/sign-in-button";
import { useSocialsLocalStorage } from "./hooks/use-socials";

export type ZkAuthProps = {
  address: `0x${string}`;
  onStarkComplete?: (starkResults: any) => void;
  onSnarkComplete?: (snarkResults: any) => void;
};

export function ZkAuth({ address, onStarkComplete, onSnarkComplete }: ZkAuthProps) {
  const { googleUserInfos, twitchUserInfos } = useSocialsLocalStorage({ address });
  const [starkResults] = useLocalStorage(`stark-results-${address}`, undefined);
  const [snarkResults] = useLocalStorage(`snark-results-${address}`, undefined);

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
    <div className="relative flex min-h-[320px] w-[320px] flex-col items-center justify-between font-sans">
      {snarkResults && starkResults ? (
        <button
          type="button"
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
        >
          wipe local storage
        </button>
      ) : googleUserInfos || twitchUserInfos ? (
        <ProveButton address={address} />
      ) : (
        <SignInButton address={address} />
      )}
    </div>
  );
}
