import { WagmiConfig, createConfig } from "wagmi";
import {
  ConnectKitProvider,
  ConnectKitButton,
  getDefaultConfig,
} from "connectkit";
import { ReactNode, useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import Claim from "./components/Claim";
import Deposit from "./components/Deposit";
import { sepolia } from "wagmi/chains";
import Modal from "./components/Modal";
import "react-toastify/dist/ReactToastify.css";
import { clearCookies } from "./libs/utils";

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
  useEffect(() => {
    clearCookies();
  });

  return (
    <WagmiConfig config={config}>
      <ConnectKitProvider>
        <ToastContainer />
        <div className="app-container">
          <div className="logo-container">
            <img
              className="logo"
              src="/RISC_Zero_Logo_lightmode.png"
              alt="R0 Logo"
            />
          </div>
          <h2 className="title">zkID</h2>
          <p className="subtitle">powered by Bonsai™</p>
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
  const [showComponent, setShowComponent] = useState<"deposit" | "claim">(
    "claim"
  );
  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShowComponent(e.target.value as "deposit" | "claim");
  };
  return (
    <div>
      <div className="card">
        <Claim />
      </div>
    </div>
  );
}

export default App;

function Footer() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{
    title: string;
    content: ReactNode;
  }>({ title: "", content: "" });

  const openModal = (title: string, content: ReactNode) => {
    setModalContent({ title, content });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <footer className="footer">
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={modalContent.title}
      >
        {modalContent.content}
      </Modal>
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
      <button
        onClick={() =>
          openModal(
            "Terms of Service",
            <iframe
              className="tos-content"
              src="./BonsaiPayTermsofService2023.11.07.html"
              title="Terms of Service"
            />
          )
        }
        className="footer-button"
      >
        Terms of Service
      </button>
      <button
        onClick={() =>
          openModal(
            "Privacy Policy",
            <iframe
              className="privacy-content"
              src="./RISCZeroBonsaiWebsitePrivacyPolicy2023.11.07.html"
              title="Privacy Policy"
            />
          )
        }
        className="footer-button"
      >
        Privacy Policy
      </button>
    </footer>
  );
}
