import { sleep } from "@risc0/ui/utils/sleep";
import isEqual from "lodash-es/isEqual";
import type { Dispatch, SetStateAction } from "react";

type StarkSessionStatusRes = {
	status: string;
	// Add other properties as needed
};

async function bonsaiStarkProving({
	iss,
	token,
}: { iss: "Google" | "test"; token: string }): Promise<string> {
	const response = await fetch(
		"https://zk-auth.vercel.app/api/bonsai/stark-proving",
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ iss, token }),
		},
	);
	if (!response.ok) {
		throw new Error("Failed to start STARK proving");
	}

	const data = await response.json();

	return data.uuid;
}

async function getBonsaiStarkStatus(
	uuid: string,
): Promise<StarkSessionStatusRes> {
	const response = await fetch(
		`https://zk-auth.vercel.app/api/bonsai/stark-status?uuid=${uuid}`,
	);

	if (!response.ok) {
		throw new Error("Failed to get STARK status");
	}

	return response.json();
}

export async function doStarkProving({
	iss,
	token,
	setStarkPollingResults,
}: {
	iss: "Google" | "test";
	token: string;
	setStarkPollingResults: Dispatch<
		SetStateAction<StarkSessionStatusRes[] | undefined>
	>;
}) {
	const starkUuid = await bonsaiStarkProving({ iss, token });

	if (!starkUuid) {
		throw new Error("STARK UUID not found");
	}

	// STARK
	let starkStatus = await getBonsaiStarkStatus(starkUuid);

	setStarkPollingResults([starkStatus]);

	// Poll until the session is not RUNNING
	while (starkStatus.status === "RUNNING") {
		await sleep(4000); // Wait for 4 seconds
		starkStatus = await getBonsaiStarkStatus(starkUuid);

		setStarkPollingResults((prevResults) => {
			const lastStarkStatus = prevResults?.at(-1);

			if (!isEqual(lastStarkStatus, starkStatus)) {
				return [...(prevResults ?? []), starkStatus];
			}

			return prevResults;
		});
	}

	return {
		starkUuid,
		starkStatus,
	};
}
