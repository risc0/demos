import { sleep } from "@risc0/ui/utils/sleep";
import type { Dispatch, SetStateAction } from "react";
import { type SnarkSessionStatusRes, bonsaiSnarkProving, getBonsaiSnarkStatus } from "../_actions/bonsai-proving";

export async function doSnarkProving({
  starkUuid,
  setSnarkPollingResults,
}: { starkUuid: string; setSnarkPollingResults: Dispatch<SetStateAction<SnarkSessionStatusRes | undefined>> }) {
  const snarkUuid = await bonsaiSnarkProving({ uuid: starkUuid });

  if (!snarkUuid) {
    throw new Error("SNARK UUID not found");
  }

  let snarkStatus = await getBonsaiSnarkStatus({ uuid: snarkUuid });

  setSnarkPollingResults(snarkStatus);

  // Poll until the session is not RUNNING
  while (snarkStatus.status === "RUNNING") {
    await sleep(4000); // Wait for 4 seconds

    snarkStatus = await getBonsaiSnarkStatus({ uuid: snarkUuid });
    setSnarkPollingResults(snarkStatus);
  }

  return { snarkStatus };
}
