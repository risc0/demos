import { http, createConfig } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { coinbaseWallet, injected } from "wagmi/connectors";

export const config = createConfig({
	chains: [mainnet, sepolia],
	connectors: [injected(), coinbaseWallet({ appName: "zkSocials" })],
	ssr: true,
	transports: {
		[mainnet.id]: http(),
		[sepolia.id]: http(),
	},
});

declare module "wagmi" {
	interface Register {
		config: typeof config;
	}
}
