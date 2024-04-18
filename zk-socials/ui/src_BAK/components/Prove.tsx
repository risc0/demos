import type React from "react";
import { useCallback, useState } from "react";
import { useZkKycMintedEvent } from "../generated";

interface ProveProps {
	disabled: boolean;
	onNext: () => void;
}

const Prove: React.FC<ProveProps> = ({ disabled }) => {
	const [isLoading, setIsLoading] = useState(false);
	const [isMinted, setIsMinted] = useState(false);

	const { VITE_API_HOST } = import.meta.env;

	useZkKycMintedEvent({
		listener: () => {
			setIsMinted(true);
		},
	});

	const handleClick = useCallback(async () => {
		setIsLoading(true);

		const jwtCookie = document.cookie
			.split("; ")
			.find((row) => row.startsWith("id_token="));
		const jwt = jwtCookie?.split("=")[1];

		if (!jwt) {
			console.error("JWT not found");
			setIsLoading(false);
			return;
		}

		try {
			const response = await fetch(`${VITE_API_HOST}/authenticate`, {
				method: "GET",
				headers: {
					"X-Auth-Token": jwt,
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<button
				onClick={handleClick}
				disabled={isMinted || isLoading || disabled}
			>
				{isMinted ? "Minted" : isLoading ? "Proving..." : "Prove with Bonsai™"}
			</button>
			{isLoading && <p>This will take a couple of minutes...</p>}
		</>
	);
};

export default Prove;
