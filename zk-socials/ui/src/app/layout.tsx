import "@risc0/ui/styles/globals.css";
import "~/styles/styles.css";

import { cn } from "@risc0/ui/cn";
import { JetBrains_Mono } from "next/font/google";
import type { PropsWithChildren } from "react";
import { Providers } from "~/client/providers/providers";

export const metadata = {
	title: {
		template: "%s | zk-socials",
		default: "zk-socials",
	},
	icons: [
		{
			rel: "icon",
			url: "/favicon.png",
		},
	],
};

const fontMono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-jetbrains-mono",
});

export default function RootLayout({ children }: PropsWithChildren) {
	return (
		<html lang="en" suppressHydrationWarning className="h-full">
			<body
				className={cn("flex min-h-full flex-col font-sans", fontMono.variable)}
			>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
