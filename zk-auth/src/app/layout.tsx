import "@risc0/ui/styles/globals.css";

import type { PropsWithChildren } from "react";
import { Providers } from "./providers";

export default function RootLayout({ children }: PropsWithChildren) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
