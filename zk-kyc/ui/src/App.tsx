import { WagmiConfig, createConfig } from "wagmi";
import {
  ConnectKitProvider,
  ConnectKitButton,
  getDefaultConfig,
} from "connectkit";
import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import Steps from "./components/Steps";
import { goerli } from "wagmi/chains";
import "react-toastify/dist/ReactToastify.css";
import { clearCookies } from "./libs/utils";

const { VITE_ALCHEMY_ID, VITE_WALLET_CONNECT_ID } = import.meta.env;

const config = createConfig(
  getDefaultConfig({
    alchemyId: VITE_ALCHEMY_ID,
    walletConnectProjectId: VITE_WALLET_CONNECT_ID,
    appName: "zk-KYC",
    chains: [goerli],
  })
);

function App() {
  useEffect(() => {
    clearCookies();
  });

  return (
    <WagmiConfig config={config}>
      <ConnectKitProvider>
        <ToastContainer />
        <div className="app-container">
          <h2 className="title">zk-KYC</h2>
          <p className="subtitle">Verify and mint your onchain identity.</p>
          <ConnectKitButton mode="light" />
          <ViewSelection />
          <p className="read-the-docs">This is for demo purposes only.</p>
          <p className="read-the-docs">
            Please read our{" "}
            <a
              href="https://github.com/risc0/demos/blob/main/bonsai-pay/README.md"
              target="_blank"
              rel="noreferrer"
            >
              docs
            </a>{" "}
            for more information.
          </p>
        </div>
        <Footer />
        <ToastContainer />
      </ConnectKitProvider>
    </WagmiConfig>
  );
}

function ViewSelection() {
  return (
    <div>
      <div className="card">
        <Steps />
      </div>
    </div>
  );
}

export default App;

function Footer() {
  return (
    <footer className="footer">
      <a href="https://www.risczero.com/news/bonsai-pay">About</a>
      <a
        href="https://github.com/risc0/demos/tree/main/bonsai-pay"
        className="footer-link"
      >
        Github
      </a>
      <a href="https://bonsai.xyz" className="footer-link">
        Bonsai
      </a>
    </footer>
  );
}
