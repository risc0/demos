"use client";

import { Button } from "@risc0/ui/button";
import type React from "react";
import { useCallback, useState } from "react";
import { useZkKycMintedEvent } from "~/generated";

export const Prove = () => {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isMinted, setIsMinted] = useState<boolean>(false);

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

		console.log("jwtCookie", jwtCookie);
		console.log("jwtToken", jwtToken);

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

	return (
		<>
			<Button
				isLoading={isLoading}
				onClick={handleClick}
				disabled={isMinted || isLoading}
			>
				{isMinted ? "Minted" : "Prove with Bonsai™"}
			</Button>

			{isLoading && <p>This will take a couple of minutes...</p>}
		</>
	);
};
