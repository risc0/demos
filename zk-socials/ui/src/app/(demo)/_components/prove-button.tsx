"use client";

import { Button } from "@risc0/ui/button";
import { VerifiedIcon } from "lucide-react";
import { useState } from "react";
import { useAccount, useWatchContractEvent } from "wagmi";
import { zkKycABI } from "~/abi/zk-kyc.abi";
import env from "~/env";
//import { useZkKycMintedEvent } from "~/generated";
import { useLocalStorage } from "../_hooks/use-local-storage";
import { UserInfos } from "./user-infos";

export function ProveButton() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMinted, _setIsMinted] = useState<boolean>(false);
  const { address } = useAccount();
  const [userToken] = useLocalStorage<string | null>("google-token", null);
  const [userInfos] = useLocalStorage<any | null>("google-infos", null);

  useWatchContractEvent({
    address: env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    abi: zkKycABI,
    eventName: "Minted",
    onLogs(logs) {
      console.log("New logs!", logs);
    },
  });

  const handleClick = async () => {
    setIsLoading(true);

    if (!userToken) {
      console.error("JWT not found");
      setIsLoading(false);

      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8080/authenticate", {
        method: "GET",
        headers: {
          "X-Auth-Token": userToken,
        },
      });

      if (response.ok) {
        const _result = await response.json();
      } else {
        throw new Error("Response not OK");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return address ? (
    <>
      <p className="mb-3 break-all text-xs">
        You are about to prove that address <strong>{address}</strong> owns the following social account(s):
      </p>

      {userInfos && <UserInfos userInfos={userInfos} />}

      <div className="mt-8">
        <Button
          isLoading={isLoading}
          onClick={handleClick}
          startIcon={<VerifiedIcon />}
          size="lg"
          autoFocus
          className="w-full"
          disabled={isMinted || isLoading}
        >
          {isMinted ? "Minted" : "Prove with Bonsai™"}
        </Button>

        {isLoading && <p className="mt-2">This will take a couple of minutes… Hang tight…</p>}
      </div>
    </>
  ) : null;
}
