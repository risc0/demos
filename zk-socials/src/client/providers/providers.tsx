"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { TooltipProvider } from "@risc0/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { WagmiProvider } from "wagmi";
import env from "~/env";
import { config } from "~/wagmi";

const queryClient = new QueryClient();

export function Providers({ children }) {
  return (
    <GoogleOAuthProvider clientId={env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            disableTransitionOnChange
            enableSystem
            enableColorScheme
          >
            <TooltipProvider>{children}</TooltipProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </GoogleOAuthProvider>
  );
}
