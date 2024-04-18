"use client";

import { Button } from "@risc0/ui/button";
import { useEffect } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

/*const clearCookies = () => {
	document.cookie.split(";").map((cookie) => {
		const eqPos = cookie.indexOf("=");
		const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie.trim();
		document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
	});
};*/

export default function WalletConnect() {
	const account = useAccount();
	const { connectors, connect, status, error } = useConnect();
	const { disconnect } = useDisconnect();

	useEffect(() => {
		//clearCookies();
	});

	return (
		<>
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
		</>
	);
}
