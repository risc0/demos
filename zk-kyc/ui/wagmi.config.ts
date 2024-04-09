import { defineConfig } from "@wagmi/cli";
import { etherscan, react } from "@wagmi/cli/plugins";
import { erc20ABI } from "wagmi";
import { goerli } from "wagmi/chains";
import "dotenv/config";

if (!process.env.ETHERSCAN_APIKEY) {
  throw new Error("Missing ETHERSCAN_API_KEY");
}

if (!process.env.VITE_CUSTODY_ADDRESS) {
  throw new Error("Missing ZID_ADDRESS");
}

export default defineConfig({
  out: "src/generated.ts",
  contracts: [
    {
      name: "erc20",
      abi: erc20ABI,
    },
  ],
  plugins: [
    etherscan({
      apiKey: process.env.ETHERSCAN_APIKEY,
      chainId: goerli.id,
      contracts: [
        {
          name: "ZID",
          address: {
            [goerli.id]: process.env.VITE_CUSTODY_ADDRESS as `0x${string}`,
          },
        },
      ],
    }),
    react(),
  ],
});
