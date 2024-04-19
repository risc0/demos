"use client";

import { Button } from "@risc0/ui/button";
import { Wallet2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { revalidateUser } from "../_actions/revalidate-user";
import { setUserWalletAddress } from "../_actions/set-user-wallet-address";

export function CreateWalletLinking({ userId }) {
	const router = useRouter();
	const [disabled, setDisabled] = useState<boolean>(false);

	return (
		<Button
			size="lg"
			isLoading={disabled}
			disabled={disabled}
			onClick={async () => {
				setDisabled(true);

				await setUserWalletAddress({
					walletAddress: "0xc8915cc592583036e18724b6a7cBE9685f49FC98",
					userId,
				});

				setTimeout(() => {
					revalidateUser();
					setDisabled(false);
				}, 15000);
			}}
			className="w-full"
			startIcon={<Wallet2Icon />}
		>
			Connect your Wallet
		</Button>
	);
}
