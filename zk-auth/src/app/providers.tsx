"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { TooltipProvider } from "@risc0/ui/tooltip";
import { ThemeProvider } from "next-themes";
import env from "~/env";

export function Providers({ children }) {
	return (
		<GoogleOAuthProvider clientId={env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
			<ThemeProvider
				attribute="class"
				defaultTheme="light"
				disableTransitionOnChange
				enableSystem
				enableColorScheme
			>
				<TooltipProvider>{children}</TooltipProvider>
			</ThemeProvider>
		</GoogleOAuthProvider>
	);
}
