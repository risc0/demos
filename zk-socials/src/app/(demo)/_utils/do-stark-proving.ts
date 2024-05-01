import { sleep } from "@risc0/ui/utils/sleep";
import type { Dispatch, SetStateAction } from "react";
import { type StarkSessionStatusRes, bonsaiStarkProving, getBonsaiStarkStatus } from "../_actions/bonsai-proving";

export async function doStarkProving({
  iss,
  token,
  setStarkPollingResults,
}: {
  iss: "Facebook" | "Google" | "test";
  token: string;
  setStarkPollingResults: Dispatch<SetStateAction<StarkSessionStatusRes | undefined>>;
}) {
  const starkUuid = await bonsaiStarkProving({ iss, token });

  console.log("starkUuid", starkUuid);

  if (!starkUuid) {
    throw new Error("STARK UUID not found");
  }

  // STARK
  let starkStatus = await getBonsaiStarkStatus({ uuid: starkUuid });
  console.log("starkStatus", starkStatus);

  setStarkPollingResults(starkStatus);

  // Poll until the session is not RUNNING
  while (starkStatus.status === "RUNNING") {
    await sleep(4000); // Wait for 4 seconds

    starkStatus = await getBonsaiStarkStatus({ uuid: starkUuid });
    console.log("starkStatus", starkStatus);
    setStarkPollingResults(starkStatus);
  }

  console.log("starkUuid", starkUuid);
  console.log("starkStatus", starkStatus);
  return {
    starkUuid,
    starkStatus,
  };
}
