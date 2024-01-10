import React, { useEffect, useState } from "react";
import { formatUnits } from "viem";
import { useZrpClaimBalance, useZrpClaim } from "../generated";
import { Token, SnarkReceipt } from "../libs/types";
import { encodeAbiParameters, parseAbiParameters } from "viem";

interface MintProps {}

export const Mint: React.FC<MintProps> = ({}) => {
  // Utility function to ensure strings have a '0x' prefix
  const prefix0x = (str: string): `0x${string}` => `0x${str}`;

  // Utility function to convert string to BigInt with a '0x' prefix
  const bn = (str: string | `0x${string}`): bigint => BigInt(prefix0x(str));

  const [encodedProof, setEncodedProof] = useState<string | null>(null);

  useEffect(() => {
    const updateSnark = async () => {
      // Find the snark cookie and parse its value
      const snarkCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("snark="));
      const snarkValue = snarkCookie?.split("=")[1];
      if (!snarkValue) return;

      const receipt: SnarkReceipt = JSON.parse(snarkValue);

      // Encode the snark using ABI parameters
      const snarkEncoded = encodeAbiParameters(
        parseAbiParameters("(uint256[2] a, uint256[2][2] b, uint256[2] c)"),
        [
          {
            a: [bn(receipt.snark.a[0]), bn(receipt.snark.a[1])],
            b: [
              [bn(receipt.snark.b[0][0]), bn(receipt.snark.b[0][1])],
              [bn(receipt.snark.b[1][0]), bn(receipt.snark.b[1][1])],
            ],
            c: [bn(receipt.snark.c[0]), bn(receipt.snark.c[1])],
          },
        ]
      );

      // Encode the data using ABI parameters
      const dataEncoded = encodeAbiParameters(
        parseAbiParameters(
          "(bytes seal, bytes32 postStateDigest, bytes journal)"
        ),
        [
          {
            seal: snarkEncoded,
            postStateDigest: prefix0x(receipt.post_state_digest),
            journal: prefix0x(receipt.journal),
          },
        ]
      );

      // Update the state with the encoded proof
      setEncodedProof(dataEncoded);
    };

    updateSnark();

    const intervalId = setInterval(updateSnark, 1000); // Set an interval to update the snark every second

    return () => clearInterval(intervalId);
  });

  // const { write: claim } = useZrpClaim({
  //   args: [
  //     encodedProof as `0x${string}`,
  //     token.address as `0x${string}`,
  //   ] as never,
  // });

  // Function to handle minting
  const handleClaim = () => claim();

  return (
    <>
      <button>{`Mint`}</button>
    </>
  );
};

export default Mint;
