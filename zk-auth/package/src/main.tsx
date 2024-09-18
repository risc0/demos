import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ZkAuth } from "./zk-auth";

const container = document.getElementById("zkauth");

if (!container) {
  throw new Error("No container found, make sure to include an HTML element with id 'zkauth'");
}

const address = container.getAttribute("data-address");

if (!address) {
  throw new Error(
    "No address found, make sure to include a 'data-address' attribute on the HTML element with id 'zkauth'",
  );
}

createRoot(container).render(
  <StrictMode>
    <ZkAuth address={address} />
  </StrictMode>,
);
