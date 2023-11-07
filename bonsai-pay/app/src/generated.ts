/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useContractRead,
  UseContractReadConfig,
  useContractWrite,
  Address,
  UseContractWriteConfig,
  usePrepareContractWrite,
  UsePrepareContractWriteConfig,
  useContractEvent,
  UseContractEventConfig,
} from "wagmi";
import {
  ReadContractResult,
  WriteContractMode,
  PrepareWriteContractResult,
} from "wagmi/actions";

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ZRP
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xE4793Ef0efFF43976b0Bd368B02680F96598e237)
 */
export const zrpABI = [
  {
    stateMutability: "nonpayable",
    type: "constructor",
    inputs: [
      {
        name: "initVerifier",
        internalType: "contract IRiscZeroVerifier",
        type: "address",
      },
      { name: "initImgId", internalType: "bytes32", type: "bytes32" },
    ],
  },
  {
    type: "error",
    inputs: [{ name: "id", internalType: "bytes32", type: "bytes32" }],
    name: "ClaimFailed",
  },
  {
    type: "error",
    inputs: [{ name: "id", internalType: "bytes32", type: "bytes32" }],
    name: "DepositAlreadyExists",
  },
  {
    type: "error",
    inputs: [{ name: "id", internalType: "bytes32", type: "bytes32" }],
    name: "DepositFailed",
  },
  {
    type: "error",
    inputs: [{ name: "id", internalType: "bytes32", type: "bytes32" }],
    name: "InvalidDepositState",
  },
  { type: "error", inputs: [], name: "InvalidFee" },
  {
    type: "error",
    inputs: [
      {
        name: "proof",
        internalType: "struct Types.Proof",
        type: "tuple",
        components: [
          { name: "seal", internalType: "bytes", type: "bytes" },
          { name: "postStateDigest", internalType: "bytes32", type: "bytes32" },
          { name: "journal", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "InvalidProof",
  },
  {
    type: "error",
    inputs: [{ name: "id", internalType: "bytes32", type: "bytes32" }],
    name: "WithdrawFailed",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "id", internalType: "bytes", type: "bytes", indexed: true },
      {
        name: "account",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Claimed",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "id", internalType: "bytes", type: "bytes", indexed: true },
      {
        name: "account",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Deposited",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "previousOwner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "newOwner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "OwnershipTransferred",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "account",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "Paused",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "account",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "Unpaused",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "id", internalType: "bytes", type: "bytes", indexed: true },
      {
        name: "account",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Withdrawn",
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "amount", internalType: "uint256", type: "uint256" }],
    name: "calculateFee",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "data", internalType: "bytes", type: "bytes" },
      { name: "token", internalType: "address", type: "address" },
    ],
    name: "claim",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    name: "claimBalance",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "claimFee",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "payable",
    type: "function",
    inputs: [
      { name: "id", internalType: "bytes", type: "bytes" },
      { name: "token", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "salt", internalType: "uint256", type: "uint256" },
    ],
    name: "deposit",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    name: "depositBalance",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "pure",
    type: "function",
    inputs: [
      { name: "id", internalType: "bytes", type: "bytes" },
      { name: "token", internalType: "address", type: "address" },
    ],
    name: "getClaimId",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
  },
  {
    stateMutability: "pure",
    type: "function",
    inputs: [
      { name: "depositor", internalType: "address", type: "address" },
      { name: "id", internalType: "bytes", type: "bytes" },
      { name: "token", internalType: "address", type: "address" },
      { name: "salt", internalType: "uint256", type: "uint256" },
    ],
    name: "getDepositId",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "imageId",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "owner",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [],
    name: "pause",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "paused",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "feePercentage", internalType: "uint256", type: "uint256" },
    ],
    name: "setFee",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "newImageId", internalType: "bytes32", type: "bytes32" }],
    name: "setImageId",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      {
        name: "newVerifier",
        internalType: "contract IRiscZeroVerifier",
        type: "address",
      },
    ],
    name: "setVerifier",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "newOwner", internalType: "address", type: "address" }],
    name: "transferOwnership",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [],
    name: "unpause",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "verifier",
    outputs: [
      { name: "", internalType: "contract IRiscZeroVerifier", type: "address" },
    ],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "to", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
    ],
    name: "withdrawContract",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "id", internalType: "bytes", type: "bytes" },
      { name: "token", internalType: "address", type: "address" },
      { name: "salt", internalType: "uint256", type: "uint256" },
    ],
    name: "withdrawDeposit",
    outputs: [],
  },
] as const;

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xE4793Ef0efFF43976b0Bd368B02680F96598e237)
 */
export const zrpAddress = {
  11155111: "0xE4793Ef0efFF43976b0Bd368B02680F96598e237",
} as const;

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xE4793Ef0efFF43976b0Bd368B02680F96598e237)
 */
export const zrpConfig = { address: zrpAddress, abi: zrpABI } as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// erc20
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc20ABI = [
  {
    type: "event",
    inputs: [
      { name: "owner", type: "address", indexed: true },
      { name: "spender", type: "address", indexed: true },
      { name: "value", type: "uint256", indexed: false },
    ],
    name: "Approval",
  },
  {
    type: "event",
    inputs: [
      { name: "from", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "value", type: "uint256", indexed: false },
    ],
    name: "Transfer",
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "name",
    outputs: [{ name: "", type: "string" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "recipient", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "sender", type: "address" },
      { name: "recipient", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link zrpABI}__.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xE4793Ef0efFF43976b0Bd368B02680F96598e237)
 */
export function useZrpRead<
  TFunctionName extends string,
  TSelectData = ReadContractResult<typeof zrpABI, TFunctionName>
>(
  config: Omit<
    UseContractReadConfig<typeof zrpABI, TFunctionName, TSelectData>,
    "abi" | "address"
  > & { chainId?: keyof typeof zrpAddress } = {} as any
) {
  return useContractRead({
    abi: zrpABI,
    address: zrpAddress[11155111],
    ...config,
  } as UseContractReadConfig<typeof zrpABI, TFunctionName, TSelectData>);
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link zrpABI}__ and `functionName` set to `"calculateFee"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xE4793Ef0efFF43976b0Bd368B02680F96598e237)
 */
export function useZrpCalculateFee<
  TFunctionName extends "calculateFee",
  TSelectData = ReadContractResult<typeof zrpABI, TFunctionName>
>(
  config: Omit<
    UseContractReadConfig<typeof zrpABI, TFunctionName, TSelectData>,
    "abi" | "address" | "functionName"
  > & { chainId?: keyof typeof zrpAddress } = {} as any
) {
  return useContractRead({
    abi: zrpABI,
    address: zrpAddress[11155111],
    functionName: "calculateFee",
    ...config,
  } as UseContractReadConfig<typeof zrpABI, TFunctionName, TSelectData>);
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link zrpABI}__ and `functionName` set to `"claimBalance"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xE4793Ef0efFF43976b0Bd368B02680F96598e237)
 */
export function useZrpClaimBalance<
  TFunctionName extends "claimBalance",
  TSelectData = ReadContractResult<typeof zrpABI, TFunctionName>
>(
  config: Omit<
    UseContractReadConfig<typeof zrpABI, TFunctionName, TSelectData>,
    "abi" | "address" | "functionName"
  > & { chainId?: keyof typeof zrpAddress } = {} as any
) {
  return useContractRead({
    abi: zrpABI,
    address: zrpAddress[11155111],
    functionName: "claimBalance",
    ...config,
  } as UseContractReadConfig<typeof zrpABI, TFunctionName, TSelectData>);
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link zrpABI}__ and `functionName` set to `"claimFee"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xE4793Ef0efFF43976b0Bd368B02680F96598e237)
 */
export function useZrpClaimFee<
  TFunctionName extends "claimFee",
  TSelectData = ReadContractResult<typeof zrpABI, TFunctionName>
>(
  config: Omit<
    UseContractReadConfig<typeof zrpABI, TFunctionName, TSelectData>,
    "abi" | "address" | "functionName"
  > & { chainId?: keyof typeof zrpAddress } = {} as any
) {
  return useContractRead({
    abi: zrpABI,
    address: zrpAddress[11155111],
    functionName: "claimFee",
    ...config,
  } as UseContractReadConfig<typeof zrpABI, TFunctionName, TSelectData>);
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link zrpABI}__ and `functionName` set to `"depositBalance"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xE4793Ef0efFF43976b0Bd368B02680F96598e237)
 */
export function useZrpDepositBalance<
  TFunctionName extends "depositBalance",
  TSelectData = ReadContractResult<typeof zrpABI, TFunctionName>
>(
  config: Omit<
    UseContractReadConfig<typeof zrpABI, TFunctionName, TSelectData>,
    "abi" | "address" | "functionName"
  > & { chainId?: keyof typeof zrpAddress } = {} as any
) {
  return useContractRead({
    abi: zrpABI,
    address: zrpAddress[11155111],
    functionName: "depositBalance",
    ...config,
  } as UseContractReadConfig<typeof zrpABI, TFunctionName, TSelectData>);
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link zrpABI}__ and `functionName` set to `"getClaimId"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xE4793Ef0efFF43976b0Bd368B02680F96598e237)
 */
export function useZrpGetClaimId<
  TFunctionName extends "getClaimId",
  TSelectData = ReadContractResult<typeof zrpABI, TFunctionName>
>(
  config: Omit<
    UseContractReadConfig<typeof zrpABI, TFunctionName, TSelectData>,
    "abi" | "address" | "functionName"
  > & { chainId?: keyof typeof zrpAddress } = {} as any
) {
  return useContractRead({
    abi: zrpABI,
    address: zrpAddress[11155111],
    functionName: "getClaimId",
    ...config,
  } as UseContractReadConfig<typeof zrpABI, TFunctionName, TSelectData>);
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link zrpABI}__ and `functionName` set to `"getDepositId"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xE4793Ef0efFF43976b0Bd368B02680F96598e237)
 */
export function useZrpGetDepositId<
  TFunctionName extends "getDepositId",
  TSelectData = ReadContractResult<typeof zrpABI, TFunctionName>
>(
  config: Omit<
    UseContractReadConfig<typeof zrpABI, TFunctionName, TSelectData>,
    "abi" | "address" | "functionName"
  > & { chainId?: keyof typeof zrpAddress } = {} as any
) {
  return useContractRead({
    abi: zrpABI,
    address: zrpAddress[11155111],
    functionName: "getDepositId",
    ...config,
  } as UseContractReadConfig<typeof zrpABI, TFunctionName, TSelectData>);
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link zrpABI}__ and `functionName` set to `"imageId"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xE4793Ef0efFF43976b0Bd368B02680F96598e237)
 */
export function useZrpImageId<
  TFunctionName extends "imageId",
  TSelectData = ReadContractResult<typeof zrpABI, TFunctionName>
>(
  config: Omit<
    UseContractReadConfig<typeof zrpABI, TFunctionName, TSelectData>,
    "abi" | "address" | "functionName"
  > & { chainId?: keyof typeof zrpAddress } = {} as any
) {
  return useContractRead({
    abi: zrpABI,
    address: zrpAddress[11155111],
    functionName: "imageId",
    ...config,
  } as UseContractReadConfig<typeof zrpABI, TFunctionName, TSelectData>);
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link zrpABI}__ and `functionName` set to `"owner"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xE4793Ef0efFF43976b0Bd368B02680F96598e237)
 */
export function useZrpOwner<
  TFunctionName extends "owner",
  TSelectData = ReadContractResult<typeof zrpABI, TFunctionName>
>(
  config: Omit<
    UseContractReadConfig<typeof zrpABI, TFunctionName, TSelectData>,
    "abi" | "address" | "functionName"
  > & { chainId?: keyof typeof zrpAddress } = {} as any
) {
  return useContractRead({
    abi: zrpABI,
    address: zrpAddress[11155111],
    functionName: "owner",
    ...config,
  } as UseContractReadConfig<typeof zrpABI, TFunctionName, TSelectData>);
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link zrpABI}__ and `functionName` set to `"paused"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xE4793Ef0efFF43976b0Bd368B02680F96598e237)
 */
export function useZrpPaused<
  TFunctionName extends "paused",
  TSelectData = ReadContractResult<typeof zrpABI, TFunctionName>
>(
  config: Omit<
    UseContractReadConfig<typeof zrpABI, TFunctionName, TSelectData>,
    "abi" | "address" | "functionName"
  > & { chainId?: keyof typeof zrpAddress } = {} as any
) {
  return useContractRead({
    abi: zrpABI,
    address: zrpAddress[11155111],
    functionName: "paused",
    ...config,
  } as UseContractReadConfig<typeof zrpABI, TFunctionName, TSelectData>);
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link zrpABI}__ and `functionName` set to `"verifier"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xE4793Ef0efFF43976b0Bd368B02680F96598e237)
 */
export function useZrpVerifier<
  TFunctionName extends "verifier",
  TSelectData = ReadContractResult<typeof zrpABI, TFunctionName>
>(
  config: Omit<
    UseContractReadConfig<typeof zrpABI, TFunctionName, TSelectData>,
    "abi" | "address" | "functionName"
  > & { chainId?: keyof typeof zrpAddress } = {} as any
) {
  return useContractRead({
    abi: zrpABI,
    address: zrpAddress[11155111],
    functionName: "verifier",
    ...config,
  } as UseContractReadConfig<typeof zrpABI, TFunctionName, TSelectData>);
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link zrpABI}__.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xE4793Ef0efFF43976b0Bd368B02680F96598e237)
 */
export function useZrpWrite<
  TFunctionName extends string,
  TMode extends WriteContractMode = undefined,
  TChainId extends number = keyof typeof zrpAddress
>(
  config: TMode extends "prepared"
    ? UseContractWriteConfig<
        PrepareWriteContractResult<typeof zrpABI, string>["request"]["abi"],
        TFunctionName,
        TMode
      > & { address?: Address; chainId?: TChainId }
    : UseContractWriteConfig<typeof zrpABI, TFunctionName, TMode> & {
        abi?: never;
        address?: never;
        chainId?: TChainId;
      } = {} as any
) {
  return useContractWrite<typeof zrpABI, TFunctionName, TMode>({
    abi: zrpABI,
    address: zrpAddress[11155111],
    ...config,
  } as any);
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link zrpABI}__ and `functionName` set to `"claim"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xE4793Ef0efFF43976b0Bd368B02680F96598e237)
 */
export function useZrpClaim<
  TMode extends WriteContractMode = undefined,
  TChainId extends number = keyof typeof zrpAddress
>(
  config: TMode extends "prepared"
    ? UseContractWriteConfig<
        PrepareWriteContractResult<typeof zrpABI, "claim">["request"]["abi"],
        "claim",
        TMode
      > & { address?: Address; chainId?: TChainId; functionName?: "claim" }
    : UseContractWriteConfig<typeof zrpABI, "claim", TMode> & {
        abi?: never;
        address?: never;
        chainId?: TChainId;
        functionName?: "claim";
      } = {} as any
) {
  return useContractWrite<typeof zrpABI, "claim", TMode>({
    abi: zrpABI,
    address: zrpAddress[11155111],
    functionName: "claim",
    ...config,
  } as any);
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link zrpABI}__ and `functionName` set to `"deposit"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xE4793Ef0efFF43976b0Bd368B02680F96598e237)
 */
export function useZrpDeposit<
  TMode extends WriteContractMode = undefined,
  TChainId extends number = keyof typeof zrpAddress
>(
  config: TMode extends "prepared"
    ? UseContractWriteConfig<
        PrepareWriteContractResult<typeof zrpABI, "deposit">["request"]["abi"],
        "deposit",
        TMode
      > & { address?: Address; chainId?: TChainId; functionName?: "deposit" }
    : UseContractWriteConfig<typeof zrpABI, "deposit", TMode> & {
        abi?: never;
        address?: never;
        chainId?: TChainId;
        functionName?: "deposit";
      } = {} as any
) {
  return useContractWrite<typeof zrpABI, "deposit", TMode>({
    abi: zrpABI,
    address: zrpAddress[11155111],
    functionName: "deposit",
    ...config,
  } as any);
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link zrpABI}__ and `functionName` set to `"pause"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xE4793Ef0efFF43976b0Bd368B02680F96598e237)
 */
export function useZrpPause<
  TMode extends WriteContractMode = undefined,
  TChainId extends number = keyof typeof zrpAddress
>(
  config: TMode extends "prepared"
    ? UseContractWriteConfig<
        PrepareWriteContractResult<typeof zrpABI, "pause">["request"]["abi"],
        "pause",
        TMode
      > & { address?: Address; chainId?: TChainId; functionName?: "pause" }
    : UseContractWriteConfig<typeof zrpABI, "pause", TMode> & {
        abi?: never;
        address?: never;
        chainId?: TChainId;
        functionName?: "pause";
      } = {} as any
) {
  return useContractWrite<typeof zrpABI, "pause", TMode>({
    abi: zrpABI,
    address: zrpAddress[11155111],
    functionName: "pause",
    ...config,
  } as any);
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link zrpABI}__ and `functionName` set to `"renounceOwnership"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xE4793Ef0efFF43976b0Bd368B02680F96598e237)
 */
export function useZrpRenounceOwnership<
  TMode extends WriteContractMode = undefined,
  TChainId extends number = keyof typeof zrpAddress
>(
  config: TMode extends "prepared"
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof zrpABI,
          "renounceOwnership"
        >["request"]["abi"],
        "renounceOwnership",
        TMode
      > & {
        address?: Address;
        chainId?: TChainId;
        functionName?: "renounceOwnership";
      }
    : UseContractWriteConfig<typeof zrpABI, "renounceOwnership", TMode> & {
        abi?: never;
        address?: never;
        chainId?: TChainId;
        functionName?: "renounceOwnership";
      } = {} as any
) {
  return useContractWrite<typeof zrpABI, "renounceOwnership", TMode>({
    abi: zrpABI,
    address: zrpAddress[11155111],
    functionName: "renounceOwnership",
    ...config,
  } as any);
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link zrpABI}__ and `functionName` set to `"setFee"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xE4793Ef0efFF43976b0Bd368B02680F96598e237)
 */
export function useZrpSetFee<
  TMode extends WriteContractMode = undefined,
  TChainId extends number = keyof typeof zrpAddress
>(
  config: TMode extends "prepared"
    ? UseContractWriteConfig<
        PrepareWriteContractResult<typeof zrpABI, "setFee">["request"]["abi"],
        "setFee",
        TMode
      > & { address?: Address; chainId?: TChainId; functionName?: "setFee" }
    : UseContractWriteConfig<typeof zrpABI, "setFee", TMode> & {
        abi?: never;
        address?: never;
        chainId?: TChainId;
        functionName?: "setFee";
      } = {} as any
) {
  return useContractWrite<typeof zrpABI, "setFee", TMode>({
    abi: zrpABI,
    address: zrpAddress[11155111],
    functionName: "setFee",
    ...config,
  } as any);
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link zrpABI}__ and `functionName` set to `"setImageId"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xE4793Ef0efFF43976b0Bd368B02680F96598e237)
 */
export function useZrpSetImageId<
  TMode extends WriteContractMode = undefined,
  TChainId extends number = keyof typeof zrpAddress
>(
  config: TMode extends "prepared"
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof zrpABI,
          "setImageId"
        >["request"]["abi"],
        "setImageId",
        TMode
      > & { address?: Address; chainId?: TChainId; functionName?: "setImageId" }
    : UseContractWriteConfig<typeof zrpABI, "setImageId", TMode> & {
        abi?: never;
        address?: never;
        chainId?: TChainId;
        functionName?: "setImageId";
      } = {} as any
) {
  return useContractWrite<typeof zrpABI, "setImageId", TMode>({
    abi: zrpABI,
    address: zrpAddress[11155111],
    functionName: "setImageId",
    ...config,
  } as any);
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link zrpABI}__ and `functionName` set to `"setVerifier"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xE4793Ef0efFF43976b0Bd368B02680F96598e237)
 */
export function useZrpSetVerifier<
  TMode extends WriteContractMode = undefined,
  TChainId extends number = keyof typeof zrpAddress
>(
  config: TMode extends "prepared"
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof zrpABI,
          "setVerifier"
        >["request"]["abi"],
        "setVerifier",
        TMode
      > & {
        address?: Address;
        chainId?: TChainId;
        functionName?: "setVerifier";
      }
    : UseContractWriteConfig<typeof zrpABI, "setVerifier", TMode> & {
        abi?: never;
        address?: never;
        chainId?: TChainId;
        functionName?: "setVerifier";
      } = {} as any
) {
  return useContractWrite<typeof zrpABI, "setVerifier", TMode>({
    abi: zrpABI,
    address: zrpAddress[11155111],
    functionName: "setVerifier",
    ...config,
  } as any);
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link zrpABI}__ and `functionName` set to `"transferOwnership"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xE4793Ef0efFF43976b0Bd368B02680F96598e237)
 */
export function useZrpTransferOwnership<
  TMode extends WriteContractMode = undefined,
  TChainId extends number = keyof typeof zrpAddress
>(
  config: TMode extends "prepared"
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof zrpABI,
          "transferOwnership"
        >["request"]["abi"],
        "transferOwnership",
        TMode
      > & {
        address?: Address;
        chainId?: TChainId;
        functionName?: "transferOwnership";
      }
    : UseContractWriteConfig<typeof zrpABI, "transferOwnership", TMode> & {
        abi?: never;
        address?: never;
        chainId?: TChainId;
        functionName?: "transferOwnership";
      } = {} as any
) {
  return useContractWrite<typeof zrpABI, "transferOwnership", TMode>({
    abi: zrpABI,
    address: zrpAddress[11155111],
    functionName: "transferOwnership",
    ...config,
  } as any);
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link zrpABI}__ and `functionName` set to `"unpause"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xE4793Ef0efFF43976b0Bd368B02680F96598e237)
 */
export function useZrpUnpause<
  TMode extends WriteContractMode = undefined,
  TChainId extends number = keyof typeof zrpAddress
>(
  config: TMode extends "prepared"
    ? UseContractWriteConfig<
        PrepareWriteContractResult<typeof zrpABI, "unpause">["request"]["abi"],
        "unpause",
        TMode
      > & { address?: Address; chainId?: TChainId; functionName?: "unpause" }
    : UseContractWriteConfig<typeof zrpABI, "unpause", TMode> & {
        abi?: never;
        address?: never;
        chainId?: TChainId;
        functionName?: "unpause";
      } = {} as any
) {
  return useContractWrite<typeof zrpABI, "unpause", TMode>({
    abi: zrpABI,
    address: zrpAddress[11155111],
    functionName: "unpause",
    ...config,
  } as any);
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link zrpABI}__ and `functionName` set to `"withdrawContract"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xE4793Ef0efFF43976b0Bd368B02680F96598e237)
 */
export function useZrpWithdrawContract<
  TMode extends WriteContractMode = undefined,
  TChainId extends number = keyof typeof zrpAddress
>(
  config: TMode extends "prepared"
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof zrpABI,
          "withdrawContract"
        >["request"]["abi"],
        "withdrawContract",
        TMode
      > & {
        address?: Address;
        chainId?: TChainId;
        functionName?: "withdrawContract";
      }
    : UseContractWriteConfig<typeof zrpABI, "withdrawContract", TMode> & {
        abi?: never;
        address?: never;
        chainId?: TChainId;
        functionName?: "withdrawContract";
      } = {} as any
) {
  return useContractWrite<typeof zrpABI, "withdrawContract", TMode>({
    abi: zrpABI,
    address: zrpAddress[11155111],
    functionName: "withdrawContract",
    ...config,
  } as any);
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link zrpABI}__ and `functionName` set to `"withdrawDeposit"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xE4793Ef0efFF43976b0Bd368B02680F96598e237)
 */
export function useZrpWithdrawDeposit<
  TMode extends WriteContractMode = undefined,
  TChainId extends number = keyof typeof zrpAddress
>(
  config: TMode extends "prepared"
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof zrpABI,
          "withdrawDeposit"
        >["request"]["abi"],
        "withdrawDeposit",
        TMode
      > & {
        address?: Address;
        chainId?: TChainId;
        functionName?: "withdrawDeposit";
      }
    : UseContractWriteConfig<typeof zrpABI, "withdrawDeposit", TMode> & {
        abi?: never;
        address?: never;
        chainId?: TChainId;
        functionName?: "withdrawDeposit";
      } = {} as any
) {
  return useContractWrite<typeof zrpABI, "withdrawDeposit", TMode>({
    abi: zrpABI,
    address: zrpAddress[11155111],
    functionName: "withdrawDeposit",
    ...config,
  } as any);
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link zrpABI}__.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xE4793Ef0efFF43976b0Bd368B02680F96598e237)
 */
export function usePrepareZrpWrite<TFunctionName extends string>(
  config: Omit<
    UsePrepareContractWriteConfig<typeof zrpABI, TFunctionName>,
    "abi" | "address"
  > & { chainId?: keyof typeof zrpAddress } = {} as any
) {
  return usePrepareContractWrite({
    abi: zrpABI,
    address: zrpAddress[11155111],
    ...config,
  } as UsePrepareContractWriteConfig<typeof zrpABI, TFunctionName>);
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link zrpABI}__ and `functionName` set to `"claim"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xE4793Ef0efFF43976b0Bd368B02680F96598e237)
 */
export function usePrepareZrpClaim(
  config: Omit<
    UsePrepareContractWriteConfig<typeof zrpABI, "claim">,
    "abi" | "address" | "functionName"
  > & { chainId?: keyof typeof zrpAddress } = {} as any
) {
  return usePrepareContractWrite({
    abi: zrpABI,
    address: zrpAddress[11155111],
    functionName: "claim",
    ...config,
  } as UsePrepareContractWriteConfig<typeof zrpABI, "claim">);
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link zrpABI}__ and `functionName` set to `"deposit"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xE4793Ef0efFF43976b0Bd368B02680F96598e237)
 */
export function usePrepareZrpDeposit(
  config: Omit<
    UsePrepareContractWriteConfig<typeof zrpABI, "deposit">,
    "abi" | "address" | "functionName"
  > & { chainId?: keyof typeof zrpAddress } = {} as any
) {
  return usePrepareContractWrite({
    abi: zrpABI,
    address: zrpAddress[11155111],
    functionName: "deposit",
    ...config,
  } as UsePrepareContractWriteConfig<typeof zrpABI, "deposit">);
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link zrpABI}__ and `functionName` set to `"pause"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xE4793Ef0efFF43976b0Bd368B02680F96598e237)
 */
export function usePrepareZrpPause(
  config: Omit<
    UsePrepareContractWriteConfig<typeof zrpABI, "pause">,
    "abi" | "address" | "functionName"
  > & { chainId?: keyof typeof zrpAddress } = {} as any
) {
  return usePrepareContractWrite({
    abi: zrpABI,
    address: zrpAddress[11155111],
    functionName: "pause",
    ...config,
  } as UsePrepareContractWriteConfig<typeof zrpABI, "pause">);
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link zrpABI}__ and `functionName` set to `"renounceOwnership"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xE4793Ef0efFF43976b0Bd368B02680F96598e237)
 */
export function usePrepareZrpRenounceOwnership(
  config: Omit<
    UsePrepareContractWriteConfig<typeof zrpABI, "renounceOwnership">,
    "abi" | "address" | "functionName"
  > & { chainId?: keyof typeof zrpAddress } = {} as any
) {
  return usePrepareContractWrite({
    abi: zrpABI,
    address: zrpAddress[11155111],
    functionName: "renounceOwnership",
    ...config,
  } as UsePrepareContractWriteConfig<typeof zrpABI, "renounceOwnership">);
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link zrpABI}__ and `functionName` set to `"setFee"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xE4793Ef0efFF43976b0Bd368B02680F96598e237)
 */
export function usePrepareZrpSetFee(
  config: Omit<
    UsePrepareContractWriteConfig<typeof zrpABI, "setFee">,
    "abi" | "address" | "functionName"
  > & { chainId?: keyof typeof zrpAddress } = {} as any
) {
  return usePrepareContractWrite({
    abi: zrpABI,
    address: zrpAddress[11155111],
    functionName: "setFee",
    ...config,
  } as UsePrepareContractWriteConfig<typeof zrpABI, "setFee">);
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link zrpABI}__ and `functionName` set to `"setImageId"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xE4793Ef0efFF43976b0Bd368B02680F96598e237)
 */
export function usePrepareZrpSetImageId(
  config: Omit<
    UsePrepareContractWriteConfig<typeof zrpABI, "setImageId">,
    "abi" | "address" | "functionName"
  > & { chainId?: keyof typeof zrpAddress } = {} as any
) {
  return usePrepareContractWrite({
    abi: zrpABI,
    address: zrpAddress[11155111],
    functionName: "setImageId",
    ...config,
  } as UsePrepareContractWriteConfig<typeof zrpABI, "setImageId">);
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link zrpABI}__ and `functionName` set to `"setVerifier"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xE4793Ef0efFF43976b0Bd368B02680F96598e237)
 */
export function usePrepareZrpSetVerifier(
  config: Omit<
    UsePrepareContractWriteConfig<typeof zrpABI, "setVerifier">,
    "abi" | "address" | "functionName"
  > & { chainId?: keyof typeof zrpAddress } = {} as any
) {
  return usePrepareContractWrite({
    abi: zrpABI,
    address: zrpAddress[11155111],
    functionName: "setVerifier",
    ...config,
  } as UsePrepareContractWriteConfig<typeof zrpABI, "setVerifier">);
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link zrpABI}__ and `functionName` set to `"transferOwnership"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xE4793Ef0efFF43976b0Bd368B02680F96598e237)
 */
export function usePrepareZrpTransferOwnership(
  config: Omit<
    UsePrepareContractWriteConfig<typeof zrpABI, "transferOwnership">,
    "abi" | "address" | "functionName"
  > & { chainId?: keyof typeof zrpAddress } = {} as any
) {
  return usePrepareContractWrite({
    abi: zrpABI,
    address: zrpAddress[11155111],
    functionName: "transferOwnership",
    ...config,
  } as UsePrepareContractWriteConfig<typeof zrpABI, "transferOwnership">);
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link zrpABI}__ and `functionName` set to `"unpause"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xE4793Ef0efFF43976b0Bd368B02680F96598e237)
 */
export function usePrepareZrpUnpause(
  config: Omit<
    UsePrepareContractWriteConfig<typeof zrpABI, "unpause">,
    "abi" | "address" | "functionName"
  > & { chainId?: keyof typeof zrpAddress } = {} as any
) {
  return usePrepareContractWrite({
    abi: zrpABI,
    address: zrpAddress[11155111],
    functionName: "unpause",
    ...config,
  } as UsePrepareContractWriteConfig<typeof zrpABI, "unpause">);
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link zrpABI}__ and `functionName` set to `"withdrawContract"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xE4793Ef0efFF43976b0Bd368B02680F96598e237)
 */
export function usePrepareZrpWithdrawContract(
  config: Omit<
    UsePrepareContractWriteConfig<typeof zrpABI, "withdrawContract">,
    "abi" | "address" | "functionName"
  > & { chainId?: keyof typeof zrpAddress } = {} as any
) {
  return usePrepareContractWrite({
    abi: zrpABI,
    address: zrpAddress[11155111],
    functionName: "withdrawContract",
    ...config,
  } as UsePrepareContractWriteConfig<typeof zrpABI, "withdrawContract">);
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link zrpABI}__ and `functionName` set to `"withdrawDeposit"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xE4793Ef0efFF43976b0Bd368B02680F96598e237)
 */
export function usePrepareZrpWithdrawDeposit(
  config: Omit<
    UsePrepareContractWriteConfig<typeof zrpABI, "withdrawDeposit">,
    "abi" | "address" | "functionName"
  > & { chainId?: keyof typeof zrpAddress } = {} as any
) {
  return usePrepareContractWrite({
    abi: zrpABI,
    address: zrpAddress[11155111],
    functionName: "withdrawDeposit",
    ...config,
  } as UsePrepareContractWriteConfig<typeof zrpABI, "withdrawDeposit">);
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link zrpABI}__.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xE4793Ef0efFF43976b0Bd368B02680F96598e237)
 */
export function useZrpEvent<TEventName extends string>(
  config: Omit<
    UseContractEventConfig<typeof zrpABI, TEventName>,
    "abi" | "address"
  > & { chainId?: keyof typeof zrpAddress } = {} as any
) {
  return useContractEvent({
    abi: zrpABI,
    address: zrpAddress[11155111],
    ...config,
  } as UseContractEventConfig<typeof zrpABI, TEventName>);
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link zrpABI}__ and `eventName` set to `"Claimed"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xE4793Ef0efFF43976b0Bd368B02680F96598e237)
 */
export function useZrpClaimedEvent(
  config: Omit<
    UseContractEventConfig<typeof zrpABI, "Claimed">,
    "abi" | "address" | "eventName"
  > & { chainId?: keyof typeof zrpAddress } = {} as any
) {
  return useContractEvent({
    abi: zrpABI,
    address: zrpAddress[11155111],
    eventName: "Claimed",
    ...config,
  } as UseContractEventConfig<typeof zrpABI, "Claimed">);
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link zrpABI}__ and `eventName` set to `"Deposited"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xE4793Ef0efFF43976b0Bd368B02680F96598e237)
 */
export function useZrpDepositedEvent(
  config: Omit<
    UseContractEventConfig<typeof zrpABI, "Deposited">,
    "abi" | "address" | "eventName"
  > & { chainId?: keyof typeof zrpAddress } = {} as any
) {
  return useContractEvent({
    abi: zrpABI,
    address: zrpAddress[11155111],
    eventName: "Deposited",
    ...config,
  } as UseContractEventConfig<typeof zrpABI, "Deposited">);
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link zrpABI}__ and `eventName` set to `"OwnershipTransferred"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xE4793Ef0efFF43976b0Bd368B02680F96598e237)
 */
export function useZrpOwnershipTransferredEvent(
  config: Omit<
    UseContractEventConfig<typeof zrpABI, "OwnershipTransferred">,
    "abi" | "address" | "eventName"
  > & { chainId?: keyof typeof zrpAddress } = {} as any
) {
  return useContractEvent({
    abi: zrpABI,
    address: zrpAddress[11155111],
    eventName: "OwnershipTransferred",
    ...config,
  } as UseContractEventConfig<typeof zrpABI, "OwnershipTransferred">);
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link zrpABI}__ and `eventName` set to `"Paused"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xE4793Ef0efFF43976b0Bd368B02680F96598e237)
 */
export function useZrpPausedEvent(
  config: Omit<
    UseContractEventConfig<typeof zrpABI, "Paused">,
    "abi" | "address" | "eventName"
  > & { chainId?: keyof typeof zrpAddress } = {} as any
) {
  return useContractEvent({
    abi: zrpABI,
    address: zrpAddress[11155111],
    eventName: "Paused",
    ...config,
  } as UseContractEventConfig<typeof zrpABI, "Paused">);
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link zrpABI}__ and `eventName` set to `"Unpaused"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xE4793Ef0efFF43976b0Bd368B02680F96598e237)
 */
export function useZrpUnpausedEvent(
  config: Omit<
    UseContractEventConfig<typeof zrpABI, "Unpaused">,
    "abi" | "address" | "eventName"
  > & { chainId?: keyof typeof zrpAddress } = {} as any
) {
  return useContractEvent({
    abi: zrpABI,
    address: zrpAddress[11155111],
    eventName: "Unpaused",
    ...config,
  } as UseContractEventConfig<typeof zrpABI, "Unpaused">);
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link zrpABI}__ and `eventName` set to `"Withdrawn"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xE4793Ef0efFF43976b0Bd368B02680F96598e237)
 */
export function useZrpWithdrawnEvent(
  config: Omit<
    UseContractEventConfig<typeof zrpABI, "Withdrawn">,
    "abi" | "address" | "eventName"
  > & { chainId?: keyof typeof zrpAddress } = {} as any
) {
  return useContractEvent({
    abi: zrpABI,
    address: zrpAddress[11155111],
    eventName: "Withdrawn",
    ...config,
  } as UseContractEventConfig<typeof zrpABI, "Withdrawn">);
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link erc20ABI}__.
 */
export function useErc20Read<
  TFunctionName extends string,
  TSelectData = ReadContractResult<typeof erc20ABI, TFunctionName>
>(
  config: Omit<
    UseContractReadConfig<typeof erc20ABI, TFunctionName, TSelectData>,
    "abi"
  > = {} as any
) {
  return useContractRead({ abi: erc20ABI, ...config } as UseContractReadConfig<
    typeof erc20ABI,
    TFunctionName,
    TSelectData
  >);
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link erc20ABI}__ and `functionName` set to `"allowance"`.
 */
export function useErc20Allowance<
  TFunctionName extends "allowance",
  TSelectData = ReadContractResult<typeof erc20ABI, TFunctionName>
>(
  config: Omit<
    UseContractReadConfig<typeof erc20ABI, TFunctionName, TSelectData>,
    "abi" | "functionName"
  > = {} as any
) {
  return useContractRead({
    abi: erc20ABI,
    functionName: "allowance",
    ...config,
  } as UseContractReadConfig<typeof erc20ABI, TFunctionName, TSelectData>);
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link erc20ABI}__ and `functionName` set to `"balanceOf"`.
 */
export function useErc20BalanceOf<
  TFunctionName extends "balanceOf",
  TSelectData = ReadContractResult<typeof erc20ABI, TFunctionName>
>(
  config: Omit<
    UseContractReadConfig<typeof erc20ABI, TFunctionName, TSelectData>,
    "abi" | "functionName"
  > = {} as any
) {
  return useContractRead({
    abi: erc20ABI,
    functionName: "balanceOf",
    ...config,
  } as UseContractReadConfig<typeof erc20ABI, TFunctionName, TSelectData>);
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link erc20ABI}__ and `functionName` set to `"decimals"`.
 */
export function useErc20Decimals<
  TFunctionName extends "decimals",
  TSelectData = ReadContractResult<typeof erc20ABI, TFunctionName>
>(
  config: Omit<
    UseContractReadConfig<typeof erc20ABI, TFunctionName, TSelectData>,
    "abi" | "functionName"
  > = {} as any
) {
  return useContractRead({
    abi: erc20ABI,
    functionName: "decimals",
    ...config,
  } as UseContractReadConfig<typeof erc20ABI, TFunctionName, TSelectData>);
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link erc20ABI}__ and `functionName` set to `"name"`.
 */
export function useErc20Name<
  TFunctionName extends "name",
  TSelectData = ReadContractResult<typeof erc20ABI, TFunctionName>
>(
  config: Omit<
    UseContractReadConfig<typeof erc20ABI, TFunctionName, TSelectData>,
    "abi" | "functionName"
  > = {} as any
) {
  return useContractRead({
    abi: erc20ABI,
    functionName: "name",
    ...config,
  } as UseContractReadConfig<typeof erc20ABI, TFunctionName, TSelectData>);
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link erc20ABI}__ and `functionName` set to `"symbol"`.
 */
export function useErc20Symbol<
  TFunctionName extends "symbol",
  TSelectData = ReadContractResult<typeof erc20ABI, TFunctionName>
>(
  config: Omit<
    UseContractReadConfig<typeof erc20ABI, TFunctionName, TSelectData>,
    "abi" | "functionName"
  > = {} as any
) {
  return useContractRead({
    abi: erc20ABI,
    functionName: "symbol",
    ...config,
  } as UseContractReadConfig<typeof erc20ABI, TFunctionName, TSelectData>);
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link erc20ABI}__ and `functionName` set to `"totalSupply"`.
 */
export function useErc20TotalSupply<
  TFunctionName extends "totalSupply",
  TSelectData = ReadContractResult<typeof erc20ABI, TFunctionName>
>(
  config: Omit<
    UseContractReadConfig<typeof erc20ABI, TFunctionName, TSelectData>,
    "abi" | "functionName"
  > = {} as any
) {
  return useContractRead({
    abi: erc20ABI,
    functionName: "totalSupply",
    ...config,
  } as UseContractReadConfig<typeof erc20ABI, TFunctionName, TSelectData>);
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link erc20ABI}__.
 */
export function useErc20Write<
  TFunctionName extends string,
  TMode extends WriteContractMode = undefined
>(
  config: TMode extends "prepared"
    ? UseContractWriteConfig<
        PrepareWriteContractResult<typeof erc20ABI, string>["request"]["abi"],
        TFunctionName,
        TMode
      >
    : UseContractWriteConfig<typeof erc20ABI, TFunctionName, TMode> & {
        abi?: never;
      } = {} as any
) {
  return useContractWrite<typeof erc20ABI, TFunctionName, TMode>({
    abi: erc20ABI,
    ...config,
  } as any);
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link erc20ABI}__ and `functionName` set to `"approve"`.
 */
export function useErc20Approve<TMode extends WriteContractMode = undefined>(
  config: TMode extends "prepared"
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof erc20ABI,
          "approve"
        >["request"]["abi"],
        "approve",
        TMode
      > & { functionName?: "approve" }
    : UseContractWriteConfig<typeof erc20ABI, "approve", TMode> & {
        abi?: never;
        functionName?: "approve";
      } = {} as any
) {
  return useContractWrite<typeof erc20ABI, "approve", TMode>({
    abi: erc20ABI,
    functionName: "approve",
    ...config,
  } as any);
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link erc20ABI}__ and `functionName` set to `"transfer"`.
 */
export function useErc20Transfer<TMode extends WriteContractMode = undefined>(
  config: TMode extends "prepared"
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof erc20ABI,
          "transfer"
        >["request"]["abi"],
        "transfer",
        TMode
      > & { functionName?: "transfer" }
    : UseContractWriteConfig<typeof erc20ABI, "transfer", TMode> & {
        abi?: never;
        functionName?: "transfer";
      } = {} as any
) {
  return useContractWrite<typeof erc20ABI, "transfer", TMode>({
    abi: erc20ABI,
    functionName: "transfer",
    ...config,
  } as any);
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link erc20ABI}__ and `functionName` set to `"transferFrom"`.
 */
export function useErc20TransferFrom<
  TMode extends WriteContractMode = undefined
>(
  config: TMode extends "prepared"
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof erc20ABI,
          "transferFrom"
        >["request"]["abi"],
        "transferFrom",
        TMode
      > & { functionName?: "transferFrom" }
    : UseContractWriteConfig<typeof erc20ABI, "transferFrom", TMode> & {
        abi?: never;
        functionName?: "transferFrom";
      } = {} as any
) {
  return useContractWrite<typeof erc20ABI, "transferFrom", TMode>({
    abi: erc20ABI,
    functionName: "transferFrom",
    ...config,
  } as any);
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link erc20ABI}__.
 */
export function usePrepareErc20Write<TFunctionName extends string>(
  config: Omit<
    UsePrepareContractWriteConfig<typeof erc20ABI, TFunctionName>,
    "abi"
  > = {} as any
) {
  return usePrepareContractWrite({
    abi: erc20ABI,
    ...config,
  } as UsePrepareContractWriteConfig<typeof erc20ABI, TFunctionName>);
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link erc20ABI}__ and `functionName` set to `"approve"`.
 */
export function usePrepareErc20Approve(
  config: Omit<
    UsePrepareContractWriteConfig<typeof erc20ABI, "approve">,
    "abi" | "functionName"
  > = {} as any
) {
  return usePrepareContractWrite({
    abi: erc20ABI,
    functionName: "approve",
    ...config,
  } as UsePrepareContractWriteConfig<typeof erc20ABI, "approve">);
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link erc20ABI}__ and `functionName` set to `"transfer"`.
 */
export function usePrepareErc20Transfer(
  config: Omit<
    UsePrepareContractWriteConfig<typeof erc20ABI, "transfer">,
    "abi" | "functionName"
  > = {} as any
) {
  return usePrepareContractWrite({
    abi: erc20ABI,
    functionName: "transfer",
    ...config,
  } as UsePrepareContractWriteConfig<typeof erc20ABI, "transfer">);
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link erc20ABI}__ and `functionName` set to `"transferFrom"`.
 */
export function usePrepareErc20TransferFrom(
  config: Omit<
    UsePrepareContractWriteConfig<typeof erc20ABI, "transferFrom">,
    "abi" | "functionName"
  > = {} as any
) {
  return usePrepareContractWrite({
    abi: erc20ABI,
    functionName: "transferFrom",
    ...config,
  } as UsePrepareContractWriteConfig<typeof erc20ABI, "transferFrom">);
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link erc20ABI}__.
 */
export function useErc20Event<TEventName extends string>(
  config: Omit<
    UseContractEventConfig<typeof erc20ABI, TEventName>,
    "abi"
  > = {} as any
) {
  return useContractEvent({
    abi: erc20ABI,
    ...config,
  } as UseContractEventConfig<typeof erc20ABI, TEventName>);
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link erc20ABI}__ and `eventName` set to `"Approval"`.
 */
export function useErc20ApprovalEvent(
  config: Omit<
    UseContractEventConfig<typeof erc20ABI, "Approval">,
    "abi" | "eventName"
  > = {} as any
) {
  return useContractEvent({
    abi: erc20ABI,
    eventName: "Approval",
    ...config,
  } as UseContractEventConfig<typeof erc20ABI, "Approval">);
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link erc20ABI}__ and `eventName` set to `"Transfer"`.
 */
export function useErc20TransferEvent(
  config: Omit<
    UseContractEventConfig<typeof erc20ABI, "Transfer">,
    "abi" | "eventName"
  > = {} as any
) {
  return useContractEvent({
    abi: erc20ABI,
    eventName: "Transfer",
    ...config,
  } as UseContractEventConfig<typeof erc20ABI, "Transfer">);
}
