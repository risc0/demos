import "dotenv/config";

import { defineConfig } from "@wagmi/cli";
import { etherscan, react } from "@wagmi/cli/plugins";
import { erc20Abi } from "viem";
import { sepolia } from "wagmi/chains";

if (!process.env.ETHERSCAN_APIKEY) {
  throw new Error("Missing ETHERSCAN_APIKEY");
}

if (!process.env.NEXT_PUBLIC_CONTRACT_ADDRESS) {
  throw new Error("Missing NEXT_PUBLIC_CONTRACT_ADDRESS");
}

export default defineConfig({
  out: "src/generated.ts",
  contracts: [
    {
      name: "erc20",
      abi: erc20Abi,
    },
  ],
  plugins: [
    etherscan({
      apiKey: process.env.ETHERSCAN_APIKEY,
      chainId: sepolia.id,
      contracts: [
        {
          name: "zkKYC",
          address: {
            [sepolia.id]: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
          },
        },
      ],
    }),
    react(),
  ],
});
