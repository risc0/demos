import React from "react";
import { zeroAddress, toHex } from "viem";
import tokens from "../assets/tokens.json";
import { Balance } from "./Balance";
import { Token } from "../libs/types";
import { sha256 } from "@noble/hashes/sha256";

export type TokenData = {
  name: string;
  icon: string;
  address: `0x${string}`;
  decimals: number;
};

interface AccountProps {
  email: string | null;
  disabled: boolean;
  hideClaim?: boolean;
}

const Account: React.FC<AccountProps> = (props) => {
  const { email, disabled, hideClaim } = props;

  const claimId = toHex(sha256(email ?? ""));

  return (
    <>
      <div className="balance-container">
        <Balance
          identity={
            claimId ??
            zeroAddress
          }
          token={tokens["sepolia"][0] as Token}
          disabled={disabled}
          hideClaim={hideClaim}
        />
      </div>
    </>
  );
};

export default Account;
