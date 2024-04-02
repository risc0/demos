import React, { useEffect } from "react";
import { formatUnits } from "viem";
import { Token } from "../libs/types";
import { useBonsaiPayBalanceOf } from "../generated";

interface BalanceProps {
  identity: `0x${string}`;
  token: Token;
  disabled: boolean;
  hideClaim?: boolean;
}

export const Balance: React.FC<BalanceProps> = ({
  identity,
  token,
  disabled,
  hideClaim,
}) => {

  const { data: balance, refetch: refetchBalance
   } = useBonsaiPayBalanceOf({
    args: [identity],
  });

  // refresh balance every 5 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      refetchBalance?.();
    }, 5000);

    return () => clearInterval(intervalId);
  });

  return (
    <>
    <div>
      <p>Availiable Balance:</p>
    </div>
      <div className="balance">
        <img src={token.icon} alt={token.name} />
        <p>
          {` ${formatUnits(balance || 0n, token.decimals)} ${token.name}
        `}
        </p>
      </div>
      <button
        disabled={disabled}
        hidden={hideClaim ?? false}
      >
        {`Claim ${token.name}`}
      </button>
    </>
  );
};
