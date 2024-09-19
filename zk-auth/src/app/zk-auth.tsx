"use client";

import "@risc0/zkauth/style.css"; // load the zkAuth stylesheet
import { ZkAuth } from "@risc0/zkauth";

export default function ZkAuthExample() {
  return (
    <ZkAuth
      address="0xc8915cc592583036e18724b6a7cBE9685f49FC98" // address to prove ownership of
      onStarkComplete={(starkResults) => {
        console.info("Stark completed:", starkResults);
      }}
      onSnarkComplete={(snarkResults) => {
        console.info("Snark completed:", snarkResults);
      }}
    />
  );
}