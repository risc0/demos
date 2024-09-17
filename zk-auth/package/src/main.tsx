import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";

const address = document.getElementById("zkauth")?.getAttribute("data-address");

createRoot(document.getElementById("zkauth")!).render(
	<StrictMode>
		<App address={address ?? ""} />
	</StrictMode>,
);
