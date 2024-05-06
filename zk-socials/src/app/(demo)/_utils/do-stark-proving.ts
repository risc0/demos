import { sleep } from "@risc0/ui/utils/sleep";
import isEqual from "lodash-es/isEqual";
import type { Dispatch, SetStateAction } from "react";
import { type StarkSessionStatusRes, bonsaiStarkProving, getBonsaiStarkStatus } from "../_actions/bonsai-proving";

export async function doStarkProving({
  iss,
  token,
  setStarkPollingResults,
}: {
  iss: "Google" | "test";
  token: string;
  setStarkPollingResults: Dispatch<SetStateAction<StarkSessionStatusRes[] | undefined>>;
}) {
  const starkUuid = await bonsaiStarkProving({ iss, token });

  if (!starkUuid) {
    throw new Error("STARK UUID not found");
  }

  // STARK
  let starkStatus = await getBonsaiStarkStatus({ uuid: starkUuid });

  setStarkPollingResults([starkStatus]);

  // Poll until the session is not RUNNING
  while (starkStatus.status === "RUNNING") {
    await sleep(4000); // Wait for 4 seconds
    starkStatus = await getBonsaiStarkStatus({ uuid: starkUuid });

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
