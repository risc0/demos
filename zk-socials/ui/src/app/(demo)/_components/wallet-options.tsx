"use client";

import { Button } from "@risc0/ui/button";
import Image from "next/image";
import { useAccount, useConnect } from "wagmi";

export function WalletOptions() {
	const { connectors, connect } = useConnect();
	const { address } = useAccount();

	return address ? null : (
		<div className="space-y-2">
			{connectors.map((connector) => (
				<Button
					size="lg"
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
