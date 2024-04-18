"use client";

import { SignInWithMetamaskButton } from "@clerk/nextjs";
import { Button } from "@risc0/ui/button";
import { Wallet2Icon } from "lucide-react";
import { useState } from "react";

export default function ConnectWalletButton() {
  const [connecting, setConnecting] = useState<boolean>(false);

  return (
    <SignInWithMetamaskButton redirectUrl="/sign-in">
      <Button
        isLoading={connecting}
        disabled={connecting}
        onClick={() => {
          setConnecting(true);

          setTimeout(() => {
            setConnecting(false);
          }, 8000);
        }}
        size="lg"
        className="w-full"
        autoFocus
        startIcon={<Wallet2Icon />}
      >
        Connect Your Wallet
      </Button>
    </SignInWithMetamaskButton>
  );
}
