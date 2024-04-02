import React, { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { useWaitForTransaction, useAccount } from "wagmi";
import { useBonsaiPayDeposit } from "../generated";
import Modal from "./Modal";
import tokens from "../assets/tokens.json";
import { Token } from "../libs/types";
import { parseEther, toHex} from "viem";
import { toast } from "react-toastify";
import { sha256 } from "@noble/hashes/sha256";

interface DepositProps {}

const Deposit: React.FC<DepositProps> = () => {
  const { isConnected } = useAccount();
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [to, setTo] = useState<string>("");
  const [debouncedTo] = useDebounce(to, 500);
  const [amount, setAmount] = useState<string>("");
  const [debouncedAmount] = useDebounce(amount, 500);

  const { data: txn, write: sendTxn } = useBonsaiPayDeposit({
    args: [
      toHex(sha256(debouncedTo))
    ] as never,
    value: parseEther(debouncedAmount) as never,
  });

  const { isLoading: isSending, isSuccess: sentSuccessful } =
    useWaitForTransaction({
      hash: txn?.hash,
    });

  const toggleModal = () => setModalOpen((prev) => !prev);

  const isTokenSelected = !!selectedToken;

  const handleSend = () => {
    if (!isValidEmail(to)) {
      return;
    }

    if (!isValidAmount(amount)) {
      return;
    }

    sendTxn?.();
  };

  useEffect(() => {
    if (sentSuccessful) {
      const Msg = () => (
        <div>
          Successfully sent {amount} ETH to {to}
          <div>
            <a href={`https://sepolia.etherscan.io/tx/${txn?.hash}`}>
              View on Etherscan
            </a>
          </div>
        </div>
      );
      toast(Msg, { toastId: txn?.hash });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentSuccessful]);

  return (
    <div className="deposit-container">
      <button
        className="select-token-btn"
        onClick={toggleModal}
        disabled={isSending}
      >
        <span className="arrow-down">
          <img src={selectedToken?.icon} alt={selectedToken?.name} />
          {selectedToken ? selectedToken.name : "Select Token"}
        </span>
      </button>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <h5>Send</h5>
        <input
          className="input-field"
          aria-label="Recipient"
          onChange={(e) => setTo(e.target.value)}
          placeholder="Recipient Email"
          value={to}
          type="email"
        />
        <input
          className="input-field"
          aria-label="Amount"
          onChange={(e) => setAmount(e.target.value.toString())}
          placeholder="Amount"
          value={amount}
          type="number"
          min="0"
          step={1e-18}
        />
        <button
          type="submit"
          disabled={
            isSending ||
            !sendTxn ||
            !to ||
            !amount ||
            !isValidEmail(to) ||
            !isValidAmount(amount) ||
            !isTokenSelected ||
            !isConnected
          }
        >
          {isSending ? "Sending..." : "Send"}
        </button>
      </form>

      <Modal isOpen={isModalOpen} onClose={toggleModal} title="Select Token">
        {(tokens["sepolia"] as Token[]).map((token: Token) => (
          <div key={token.address}>
            <button
              onClick={() => {
                setSelectedToken(token);
                toggleModal();
              }}
            >
              <img src={token.icon} alt={token.name} />
              {token.name}
            </button>
          </div>
        ))}
      </Modal>
    </div>
  );
};

export default Deposit;

// Utility function to validate email using regex
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Utility function to validate amount is numeric and greater than 0
const isValidAmount = (amount) => {
  const num = Number(amount);
  return !isNaN(num) && num > 0;
};