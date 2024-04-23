"use client";

import { Button } from "@risc0/ui/button";
import Image from "next/image";
import { useAccount, useConnect } from "wagmi";

export function ConnectWalletButton() {
  const { connectors, connect, isPending, variables } = useConnect();
  const { address } = useAccount();

  return address ? null : (
    <div className="flex flex-row gap-2">
      {connectors.map((connector) => (
        <Button
          isLoading={
            // @ts-expect-error -- ignore typing error
            variables?.connector.id === connector.id && isPending
          }
          disabled={isPending}
          key={connector.uid}
          className="w-full"
          onClick={() => connect({ connector })}
          startIcon={
            connector.icon ? (
              <Image src={connector.icon} alt={connector.name} width={20} height={20} />
            ) : (
              <Image className="rounded" src={`/${connector.id}.svg`} alt={connector.name} width={20} height={20} />
            )
          }
        >
          {connector.name}
        </Button>
      ))}
    </div>
  );
}
