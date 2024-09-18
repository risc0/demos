import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ZkAuth } from "./zk-auth";

const container = document.getElementById("root");

if (!container) {
  throw new Error("No container found, make sure to include an HTML element with id 'zkauth'");
}

createRoot(container).render(
  <StrictMode>
    <ZkAuth
      address="0xc8915cc592583036e18724b6a7cBE9685f49FC98"
      onSnarkComplete={console.info}
      onStarkComplete={console.info}
    />
  </StrictMode>,
);
