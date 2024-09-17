import { sleep } from "@risc0/ui/utils/sleep";
import type { Dispatch, SetStateAction } from "react";

type SnarkSessionStatusRes = {
	status: string;
	// Add other properties as needed
};

async function bonsaiSnarkProving(uuid: string): Promise<string> {
	const response = await fetch("/api/bonsai/snark-proving", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ uuid }),
	});

	if (!response.ok) {
		throw new Error("Failed to start SNARK proving");
	}

	const data = await response.json();

	return data.uuid;
}

async function getBonsaiSnarkStatus(
	uuid: string,
): Promise<SnarkSessionStatusRes> {
	const response = await fetch(`/api/bonsai/snark-status?uuid=${uuid}`);

	if (!response.ok) {
		throw new Error("Failed to get SNARK status");
	}

	return response.json();
}

export async function doSnarkProving({
	starkUuid,
	setSnarkPollingResults,
}: {
	starkUuid: string;
	setSnarkPollingResults: Dispatch<
		SetStateAction<SnarkSessionStatusRes | undefined>
	>;
}) {
	const snarkUuid = await bonsaiSnarkProving(starkUuid);

	if (!snarkUuid) {
		throw new Error("SNARK UUID not found");
	}

	let snarkStatus = await getBonsaiSnarkStatus(snarkUuid);

	setSnarkPollingResults(snarkStatus);

	// Poll until the session is not RUNNING
	while (snarkStatus.status === "RUNNING") {
		await sleep(4000); // Wait for 4 seconds
		snarkStatus = await getBonsaiSnarkStatus(snarkUuid);

		setSnarkPollingResults(snarkStatus);
	}

	return { snarkStatus };
}
