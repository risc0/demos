import React from "react";
import ReactDOM from "react-dom/client";
import { ZkAuth } from "./zk-auth";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <div className="flex flex-col items-center pt-20 h-screen">
      <ZkAuth address="0xc8915cc592583036e18724b6a7cBE9685f49FC98" />
    </div>
  </React.StrictMode>,
);
