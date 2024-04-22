"use client";

import { Button } from "@risc0/ui/button";
import Image from "next/image";
import { useAccount, useConnect } from "wagmi";

export function ConnectWalletButton() {
	const { connectors, connect, isPending, variables, ...rest } = useConnect();
	const { address } = useAccount();

	return address ? null : (
		<div className="space-y-2">
			{connectors.map((connector) => (
				<Button
					isLoading={
						// @ts-expect-error -- ignore typing error
						variables?.connector.id === connector.id && isPending
					}
					size="lg"
					disabled={isPending}
					className="w-full"
					key={connector.uid}
					onClick={() => connect({ connector })}
					startIcon={
						connector.icon ? (
							<Image
								src={connector.icon}
								alt={connector.name}
								width={20}
								height={20}
							/>
						) : undefined
					}
				>
					Connect using {connector.name}
				</Button>
			))}
		</div>
	);
}
