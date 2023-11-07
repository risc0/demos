import { WagmiConfig, createConfig } from "wagmi";
import {
  ConnectKitProvider,
  ConnectKitButton,
  getDefaultConfig,
} from "connectkit";
import { useState } from "react";
import { ToastContainer } from "react-toastify";
import Claim from "./components/Claim";
import Deposit from "./components/Deposit";
import { sepolia } from "wagmi/chains";

const { VITE_ALCHEMY_ID, VITE_WALLET_CONNECT_ID } = import.meta.env;

const config = createConfig(
  getDefaultConfig({
    alchemyId: VITE_ALCHEMY_ID,
    walletConnectProjectId: VITE_WALLET_CONNECT_ID,
    appName: "Bonsai Pay",
    chains: [sepolia],
  })
);

function App() {
  return (
    <WagmiConfig config={config}>
      <ConnectKitProvider>
        <div className="app-container">
          <div className="logo-container">
            <img
              className="logo"
              src="/RISC_Zero_Logo_lightmode.png"
              alt="R0 Logo"
            />
          </div>
          <p className="subtitle">powered by Bonsai™</p>
          <ConnectKitButton />
          <ViewSelection />
          <p className="read-the-docs">This is for demo purposes only.</p>
        </div>
        <Footer />
        <ToastContainer />
      </ConnectKitProvider>
    </WagmiConfig>
  );
}

function ViewSelection() {
  const [showComponent, setShowComponent] = useState<"deposit" | "claim">(
    "claim"
  );
  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShowComponent(e.target.value as "deposit" | "claim");
  };
  return (
    <div>
      <div className="radio-container">
        <label>
          <input
            className="radio-input"
            type="radio"
            value="deposit"
            checked={showComponent === "deposit"}
            onChange={handleRadioChange}
          />
          Deposit
        </label>
        <label>
          <input
            className="radio-input"
            type="radio"
            value="claim"
            checked={showComponent === "claim"}
            onChange={handleRadioChange}
          />
          Claim
        </label>
      </div>
      <div className="card">
        {showComponent === "deposit" ? <Deposit /> : <Claim />}
      </div>
    </div>
  );
}

export default App;

function Footer() {
  return (
    <footer className="footer">
      <a href="/about" className="footer-link">
        About
      </a>
      <a href="https://bonsai.xyz" className="footer-link">
        Bonsai
      </a>
      <a href="https://github.com" className="footer-link">
        Github
      </a>
      <a href="https://risczero.com" className="footer-link">
        RISC Zero
      </a>
      <a href="/terms-of-service" className="footer-link">
        Terms of Service
      </a>
      <a href="/privacy" className="footer-link">
        Privacy Policy
      </a>
    </footer>
  );
}
