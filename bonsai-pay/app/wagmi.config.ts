import { defineConfig } from "@wagmi/cli";
import { etherscan, react } from "@wagmi/cli/plugins";
import { erc20ABI } from "wagmi";
import { sepolia, localhost, goerli } from "wagmi/chains";
import "dotenv/config";

if (!process.env.ETHERSCAN_APIKEY) {
  throw new Error("Missing ETHERSCAN_API_KEY");
}

if (!process.env.VITE_CUSTODY_ADDRESS) {
  throw new Error("Missing ZRP_ADDRESS");
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
      chainId: localhost.id,
      contracts: [
        {
          name: "ZRP",
          address: {
            // [sepolia.id]: process.env.VITE_CUSTODY_ADDRESS as `0x${string}`,
            [localhost.id]: "0x1E4945FD6732bCCfB0ff21C0a76B57770e9b727f" as `0x${string}`,
          },
        },
      ],
    }),
    react(),
  ],
});
