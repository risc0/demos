"use client";

import "@risc0/zkauth/style.css"; // load the zkAuth stylesheet
import { ZkAuth } from "@risc0/zkauth";

export default function HomePage() {
  return (
    <main>
      <ZkAuth
        address="0xc8915cc592583036e18724b6a7cBE9685f49FC98" // address to prove ownership of
      />
    </main>
  );
}
