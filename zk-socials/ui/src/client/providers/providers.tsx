"use client";

import { TooltipProvider } from "@risc0/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { WagmiProvider } from "wagmi";
import { config } from "~/wagmi";
import { Toaster } from "../toaster/toaster";

export function Providers({ children }) {
	const [queryClient] = useState(() => new QueryClient());

	return (
		<WagmiProvider config={config}>
			<QueryClientProvider client={queryClient}>
				<ThemeProvider
					attribute="class"
					defaultTheme="dark"
					disableTransitionOnChange
					enableSystem
					enableColorScheme
				>
					<TooltipProvider>{children}</TooltipProvider>
					<Toaster visibleToasts={3} richColors duration={8000} />
				</ThemeProvider>
			</QueryClientProvider>
		</WagmiProvider>
	);
}
