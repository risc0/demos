import React from "react";
import ReactDOM from "react-dom/client";
import { ZkAuth } from "./zk-auth";

// biome-ignore lint/style/noNonNullAssertion: ignore
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <div className="flex h-screen flex-col items-center pt-20">
      <ZkAuth address="0xc8915cc592583036e18724b6a7cBE9685f49FC98" />
    </div>
  </React.StrictMode>,
);
