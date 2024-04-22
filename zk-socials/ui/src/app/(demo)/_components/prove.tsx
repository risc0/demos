"use client";

import { Button } from "@risc0/ui/button";
import { VerifiedIcon } from "lucide-react";
import { useState } from "react";
import { useAccount } from "wagmi";
import { useZkKycMintedEvent } from "~/generated";

export const Prove = () => {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isMinted, _setIsMinted] = useState<boolean>(false);
	const { address } = useAccount();

	/*useZkKycMintedEvent({
		listener: () => {
			setIsMinted(true);
		},
	});*/

	const handleClick = async () => {
		setIsLoading(true);

		const jwtCookie = document.cookie
			.split("; ")
			.find((row) => row.startsWith("__session="));
		const jwtToken = jwtCookie?.split("=")[1];

		if (!jwtToken) {
			console.error("JWT not found");
			setIsLoading(false);
			return;
		}

		try {
			const response = await fetch("http://127.0.0.1:8080/authenticate", {
				method: "GET",
				headers: {
					"X-Auth-Token": jwtToken,
				},
			});

			if (response.ok) {
				await response.body;
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
				You are about to prove that address <strong>{address}</strong> owns the
				following social account(s):
			</p>

			<div className="space-y-3">
				{/*user?.externalAccounts.map(
								({ imageUrl, username, id, provider, emailAddress }) => (
									<Alert
										key={id}
										className="flex flex-row items-center gap-4 bg-neutral-900 p-5"
									>
										<Avatar className="size-16">
											<AvatarImage
												src={imageUrl}
												alt={username ?? "user avatar"}
											/>
										</Avatar>
										<AlertDescription>
											<p className="font-bold text-xl">{username}</p>
											<p className="text-muted-foreground text-sm">
												{emailAddress}
											</p>
											<p className="font-mono text-[10px]">{provider}</p>
										</AlertDescription>
									</Alert>
								),
							)*/}
			</div>

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

				{isLoading && <p>This will take a couple of minutes...</p>}
			</div>
		</>
	) : null;
};
