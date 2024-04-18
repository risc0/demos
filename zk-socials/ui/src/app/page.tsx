"use client";

import { Button } from "@risc0/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@risc0/ui/card";
import { useAccount, useConnect, useDisconnect } from "wagmi";

export default function AppPage() {
	const account = useAccount();
	const { connectors, connect, status, error } = useConnect();
	const { disconnect } = useDisconnect();

	return (
		<div className="container mx-auto max-w-screen-sm py-10 flex justify-center flex-col flex-1">
			<Card>
				<CardHeader>
					<CardTitle>Proof of Account</CardTitle>
				</CardHeader>
				<CardContent>
					<div>
						<div>
							status: {account.status}
							<br />
							addresses: {JSON.stringify(account.addresses)}
							<br />
							chainId: {account.chainId}
						</div>

						{account.status === "connected" && (
							<Button variant="secondary" onClick={() => disconnect()}>
								Disconnect
							</Button>
						)}
					</div>

					<div>
						{connectors.map((connector) => (
							<Button
								variant="secondary"
								key={connector.uid}
								onClick={() => connect({ connector })}
							>
								{connector.name}
							</Button>
						))}
						<div>{status}</div>
						<div>{error?.message}</div>
					</div>
				</CardContent>
				<CardFooter className="flex justify-between">
					<Button variant="outline">Cancel</Button>
					<Button>Deploy</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
