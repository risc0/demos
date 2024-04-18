"use client";

import { TooltipProvider } from "@risc0/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { Toaster } from "../toaster/toaster";

export function Providers({ children }) {
	return (
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
	);
}
