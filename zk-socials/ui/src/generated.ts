import {
	type Address,
	type UseContractEventConfig,
	type UseContractReadConfig,
	type UseContractWriteConfig,
	type UsePrepareContractWriteConfig,
	useContractEvent,
	useContractRead,
	useContractWrite,
	usePrepareContractWrite,
} from "wagmi";
import type {
	PrepareWriteContractResult,
	ReadContractResult,
	WriteContractMode,
} from "wagmi/actions";

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
// zkKYC
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xFB10BdFc968ab4434362109a9110A21b03bF99d5)
 */
export const zkKycABI = [
	{
		stateMutability: "nonpayable",
		type: "constructor",
		inputs: [
			{
				name: "_verifier",
				internalType: "contract IRiscZeroVerifier",
				type: "address",
			},
			{ name: "name", internalType: "string", type: "string" },
			{ name: "symbol", internalType: "string", type: "string" },
		],
	},
	{
		type: "error",
		inputs: [
			{ name: "sender", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
			{ name: "owner", internalType: "address", type: "address" },
		],
		name: "ERC721IncorrectOwner",
	},
	{
		type: "error",
		inputs: [
			{ name: "operator", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
		],
		name: "ERC721InsufficientApproval",
	},
	{
		type: "error",
		inputs: [{ name: "approver", internalType: "address", type: "address" }],
		name: "ERC721InvalidApprover",
	},
	{
		type: "error",
		inputs: [{ name: "operator", internalType: "address", type: "address" }],
		name: "ERC721InvalidOperator",
	},
	{
		type: "error",
		inputs: [{ name: "owner", internalType: "address", type: "address" }],
		name: "ERC721InvalidOwner",
	},
	{
		type: "error",
		inputs: [{ name: "receiver", internalType: "address", type: "address" }],
		name: "ERC721InvalidReceiver",
	},
	{
		type: "error",
		inputs: [{ name: "sender", internalType: "address", type: "address" }],
		name: "ERC721InvalidSender",
	},
	{
		type: "error",
		inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
		name: "ERC721NonexistentToken",
	},
	{
		type: "error",
		inputs: [{ name: "message", internalType: "string", type: "string" }],
		name: "InvalidMint",
	},
	{
		type: "error",
		inputs: [{ name: "message", internalType: "string", type: "string" }],
		name: "NotTokenOwner",
	},
	{
		type: "error",
		inputs: [{ name: "message", internalType: "string", type: "string" }],
		name: "TokenNotTransferable",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "owner",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "approved",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "tokenId",
				internalType: "uint256",
				type: "uint256",
				indexed: true,
			},
		],
		name: "Approval",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "owner",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{
				name: "operator",
				internalType: "address",
				type: "address",
				indexed: true,
			},
			{ name: "approved", internalType: "bool", type: "bool", indexed: false },
		],
		name: "ApprovalForAll",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{
				name: "tokenId",
				internalType: "uint256",
				type: "uint256",
				indexed: true,
			},
		],
		name: "Burned",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "to", internalType: "address", type: "address", indexed: true },
			{
				name: "claimId",
				internalType: "bytes32",
				type: "bytes32",
				indexed: true,
			},
		],
		name: "Minted",
	},
	{
		type: "event",
		anonymous: false,
		inputs: [
			{ name: "from", internalType: "address", type: "address", indexed: true },
			{ name: "to", internalType: "address", type: "address", indexed: true },
			{
				name: "tokenId",
				internalType: "uint256",
				type: "uint256",
				indexed: true,
			},
		],
		name: "Transfer",
	},
	{
		stateMutability: "nonpayable",
		type: "function",
		inputs: [
			{ name: "to", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
		],
		name: "approve",
		outputs: [],
	},
	{
		stateMutability: "view",
		type: "function",
		inputs: [{ name: "owner", internalType: "address", type: "address" }],
		name: "balanceOf",
		outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
	},
	{
		stateMutability: "nonpayable",
		type: "function",
		inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
		name: "burn",
		outputs: [],
	},
	{
		stateMutability: "view",
		type: "function",
		inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
		name: "getApproved",
		outputs: [{ name: "", internalType: "address", type: "address" }],
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
		inputs: [
			{ name: "owner", internalType: "address", type: "address" },
			{ name: "operator", internalType: "address", type: "address" },
		],
		name: "isApprovedForAll",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
	},
	{
		stateMutability: "nonpayable",
		type: "function",
		inputs: [
			{ name: "to", internalType: "address", type: "address" },
			{ name: "claimId", internalType: "bytes32", type: "bytes32" },
			{ name: "postStateDigest", internalType: "bytes32", type: "bytes32" },
			{ name: "seal", internalType: "bytes", type: "bytes" },
		],
		name: "mint",
		outputs: [],
	},
	{
		stateMutability: "view",
		type: "function",
		inputs: [],
		name: "name",
		outputs: [{ name: "", internalType: "string", type: "string" }],
	},
	{
		stateMutability: "view",
		type: "function",
		inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
		name: "ownerOf",
		outputs: [{ name: "", internalType: "address", type: "address" }],
	},
	{
		stateMutability: "nonpayable",
		type: "function",
		inputs: [
			{ name: "from", internalType: "address", type: "address" },
			{ name: "to", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
		],
		name: "safeTransferFrom",
		outputs: [],
	},
	{
		stateMutability: "nonpayable",
		type: "function",
		inputs: [
			{ name: "from", internalType: "address", type: "address" },
			{ name: "to", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
			{ name: "data", internalType: "bytes", type: "bytes" },
		],
		name: "safeTransferFrom",
		outputs: [],
	},
	{
		stateMutability: "nonpayable",
		type: "function",
		inputs: [
			{ name: "operator", internalType: "address", type: "address" },
			{ name: "approved", internalType: "bool", type: "bool" },
		],
		name: "setApprovalForAll",
		outputs: [],
	},
	{
		stateMutability: "view",
		type: "function",
		inputs: [{ name: "interfaceId", internalType: "bytes4", type: "bytes4" }],
		name: "supportsInterface",
		outputs: [{ name: "", internalType: "bool", type: "bool" }],
	},
	{
		stateMutability: "view",
		type: "function",
		inputs: [],
		name: "symbol",
		outputs: [{ name: "", internalType: "string", type: "string" }],
	},
	{
		stateMutability: "view",
		type: "function",
		inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
		name: "tokenURI",
		outputs: [{ name: "", internalType: "string", type: "string" }],
	},
	{
		stateMutability: "nonpayable",
		type: "function",
		inputs: [
			{ name: "from", internalType: "address", type: "address" },
			{ name: "to", internalType: "address", type: "address" },
			{ name: "tokenId", internalType: "uint256", type: "uint256" },
		],
		name: "transferFrom",
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
] as const;

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xFB10BdFc968ab4434362109a9110A21b03bF99d5)
 */
export const zkKycAddress = {
	11155111: "0xFB10BdFc968ab4434362109a9110A21b03bF99d5",
} as const;

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xFB10BdFc968ab4434362109a9110A21b03bF99d5)
 */
export const zkKycConfig = { address: zkKycAddress, abi: zkKycABI } as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link erc20ABI}__.
 */
export function useErc20Read<
	TFunctionName extends string,
	TSelectData = ReadContractResult<typeof erc20ABI, TFunctionName>,
>(
	config: Omit<
		UseContractReadConfig<typeof erc20ABI, TFunctionName, TSelectData>,
		"abi"
	> = {} as any,
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
	TSelectData = ReadContractResult<typeof erc20ABI, TFunctionName>,
>(
	config: Omit<
		UseContractReadConfig<typeof erc20ABI, TFunctionName, TSelectData>,
		"abi" | "functionName"
	> = {} as any,
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
	TSelectData = ReadContractResult<typeof erc20ABI, TFunctionName>,
>(
	config: Omit<
		UseContractReadConfig<typeof erc20ABI, TFunctionName, TSelectData>,
		"abi" | "functionName"
	> = {} as any,
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
	TSelectData = ReadContractResult<typeof erc20ABI, TFunctionName>,
>(
	config: Omit<
		UseContractReadConfig<typeof erc20ABI, TFunctionName, TSelectData>,
		"abi" | "functionName"
	> = {} as any,
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
	TSelectData = ReadContractResult<typeof erc20ABI, TFunctionName>,
>(
	config: Omit<
		UseContractReadConfig<typeof erc20ABI, TFunctionName, TSelectData>,
		"abi" | "functionName"
	> = {} as any,
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
	TSelectData = ReadContractResult<typeof erc20ABI, TFunctionName>,
>(
	config: Omit<
		UseContractReadConfig<typeof erc20ABI, TFunctionName, TSelectData>,
		"abi" | "functionName"
	> = {} as any,
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
	TSelectData = ReadContractResult<typeof erc20ABI, TFunctionName>,
>(
	config: Omit<
		UseContractReadConfig<typeof erc20ABI, TFunctionName, TSelectData>,
		"abi" | "functionName"
	> = {} as any,
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
	TMode extends WriteContractMode = undefined,
>(
	config: TMode extends "prepared"
		? UseContractWriteConfig<
				PrepareWriteContractResult<typeof erc20ABI, string>["request"]["abi"],
				TFunctionName,
				TMode
			>
		: UseContractWriteConfig<typeof erc20ABI, TFunctionName, TMode> & {
				abi?: never;
			} = {} as any,
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
			} = {} as any,
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
			} = {} as any,
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
	TMode extends WriteContractMode = undefined,
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
			} = {} as any,
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
	> = {} as any,
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
	> = {} as any,
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
	> = {} as any,
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
	> = {} as any,
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
	> = {} as any,
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
	> = {} as any,
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
	> = {} as any,
) {
	return useContractEvent({
		abi: erc20ABI,
		eventName: "Transfer",
		...config,
	} as UseContractEventConfig<typeof erc20ABI, "Transfer">);
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link zkKycABI}__.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xFB10BdFc968ab4434362109a9110A21b03bF99d5)
 */
export function useZkKycRead<
	TFunctionName extends string,
	TSelectData = ReadContractResult<typeof zkKycABI, TFunctionName>,
>(
	config: Omit<
		UseContractReadConfig<typeof zkKycABI, TFunctionName, TSelectData>,
		"abi" | "address"
	> & { chainId?: keyof typeof zkKycAddress } = {} as any,
) {
	return useContractRead({
		abi: zkKycABI,
		address: zkKycAddress[11155111],
		...config,
	} as UseContractReadConfig<typeof zkKycABI, TFunctionName, TSelectData>);
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link zkKycABI}__ and `functionName` set to `"balanceOf"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xFB10BdFc968ab4434362109a9110A21b03bF99d5)
 */
export function useZkKycBalanceOf<
	TFunctionName extends "balanceOf",
	TSelectData = ReadContractResult<typeof zkKycABI, TFunctionName>,
>(
	config: Omit<
		UseContractReadConfig<typeof zkKycABI, TFunctionName, TSelectData>,
		"abi" | "address" | "functionName"
	> & { chainId?: keyof typeof zkKycAddress } = {} as any,
) {
	return useContractRead({
		abi: zkKycABI,
		address: zkKycAddress[11155111],
		functionName: "balanceOf",
		...config,
	} as UseContractReadConfig<typeof zkKycABI, TFunctionName, TSelectData>);
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link zkKycABI}__ and `functionName` set to `"getApproved"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xFB10BdFc968ab4434362109a9110A21b03bF99d5)
 */
export function useZkKycGetApproved<
	TFunctionName extends "getApproved",
	TSelectData = ReadContractResult<typeof zkKycABI, TFunctionName>,
>(
	config: Omit<
		UseContractReadConfig<typeof zkKycABI, TFunctionName, TSelectData>,
		"abi" | "address" | "functionName"
	> & { chainId?: keyof typeof zkKycAddress } = {} as any,
) {
	return useContractRead({
		abi: zkKycABI,
		address: zkKycAddress[11155111],
		functionName: "getApproved",
		...config,
	} as UseContractReadConfig<typeof zkKycABI, TFunctionName, TSelectData>);
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link zkKycABI}__ and `functionName` set to `"imageId"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xFB10BdFc968ab4434362109a9110A21b03bF99d5)
 */
export function useZkKycImageId<
	TFunctionName extends "imageId",
	TSelectData = ReadContractResult<typeof zkKycABI, TFunctionName>,
>(
	config: Omit<
		UseContractReadConfig<typeof zkKycABI, TFunctionName, TSelectData>,
		"abi" | "address" | "functionName"
	> & { chainId?: keyof typeof zkKycAddress } = {} as any,
) {
	return useContractRead({
		abi: zkKycABI,
		address: zkKycAddress[11155111],
		functionName: "imageId",
		...config,
	} as UseContractReadConfig<typeof zkKycABI, TFunctionName, TSelectData>);
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link zkKycABI}__ and `functionName` set to `"isApprovedForAll"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xFB10BdFc968ab4434362109a9110A21b03bF99d5)
 */
export function useZkKycIsApprovedForAll<
	TFunctionName extends "isApprovedForAll",
	TSelectData = ReadContractResult<typeof zkKycABI, TFunctionName>,
>(
	config: Omit<
		UseContractReadConfig<typeof zkKycABI, TFunctionName, TSelectData>,
		"abi" | "address" | "functionName"
	> & { chainId?: keyof typeof zkKycAddress } = {} as any,
) {
	return useContractRead({
		abi: zkKycABI,
		address: zkKycAddress[11155111],
		functionName: "isApprovedForAll",
		...config,
	} as UseContractReadConfig<typeof zkKycABI, TFunctionName, TSelectData>);
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link zkKycABI}__ and `functionName` set to `"name"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xFB10BdFc968ab4434362109a9110A21b03bF99d5)
 */
export function useZkKycName<
	TFunctionName extends "name",
	TSelectData = ReadContractResult<typeof zkKycABI, TFunctionName>,
>(
	config: Omit<
		UseContractReadConfig<typeof zkKycABI, TFunctionName, TSelectData>,
		"abi" | "address" | "functionName"
	> & { chainId?: keyof typeof zkKycAddress } = {} as any,
) {
	return useContractRead({
		abi: zkKycABI,
		address: zkKycAddress[11155111],
		functionName: "name",
		...config,
	} as UseContractReadConfig<typeof zkKycABI, TFunctionName, TSelectData>);
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link zkKycABI}__ and `functionName` set to `"ownerOf"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xFB10BdFc968ab4434362109a9110A21b03bF99d5)
 */
export function useZkKycOwnerOf<
	TFunctionName extends "ownerOf",
	TSelectData = ReadContractResult<typeof zkKycABI, TFunctionName>,
>(
	config: Omit<
		UseContractReadConfig<typeof zkKycABI, TFunctionName, TSelectData>,
		"abi" | "address" | "functionName"
	> & { chainId?: keyof typeof zkKycAddress } = {} as any,
) {
	return useContractRead({
		abi: zkKycABI,
		address: zkKycAddress[11155111],
		functionName: "ownerOf",
		...config,
	} as UseContractReadConfig<typeof zkKycABI, TFunctionName, TSelectData>);
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link zkKycABI}__ and `functionName` set to `"supportsInterface"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xFB10BdFc968ab4434362109a9110A21b03bF99d5)
 */
export function useZkKycSupportsInterface<
	TFunctionName extends "supportsInterface",
	TSelectData = ReadContractResult<typeof zkKycABI, TFunctionName>,
>(
	config: Omit<
		UseContractReadConfig<typeof zkKycABI, TFunctionName, TSelectData>,
		"abi" | "address" | "functionName"
	> & { chainId?: keyof typeof zkKycAddress } = {} as any,
) {
	return useContractRead({
		abi: zkKycABI,
		address: zkKycAddress[11155111],
		functionName: "supportsInterface",
		...config,
	} as UseContractReadConfig<typeof zkKycABI, TFunctionName, TSelectData>);
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link zkKycABI}__ and `functionName` set to `"symbol"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xFB10BdFc968ab4434362109a9110A21b03bF99d5)
 */
export function useZkKycSymbol<
	TFunctionName extends "symbol",
	TSelectData = ReadContractResult<typeof zkKycABI, TFunctionName>,
>(
	config: Omit<
		UseContractReadConfig<typeof zkKycABI, TFunctionName, TSelectData>,
		"abi" | "address" | "functionName"
	> & { chainId?: keyof typeof zkKycAddress } = {} as any,
) {
	return useContractRead({
		abi: zkKycABI,
		address: zkKycAddress[11155111],
		functionName: "symbol",
		...config,
	} as UseContractReadConfig<typeof zkKycABI, TFunctionName, TSelectData>);
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link zkKycABI}__ and `functionName` set to `"tokenURI"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xFB10BdFc968ab4434362109a9110A21b03bF99d5)
 */
export function useZkKycTokenUri<
	TFunctionName extends "tokenURI",
	TSelectData = ReadContractResult<typeof zkKycABI, TFunctionName>,
>(
	config: Omit<
		UseContractReadConfig<typeof zkKycABI, TFunctionName, TSelectData>,
		"abi" | "address" | "functionName"
	> & { chainId?: keyof typeof zkKycAddress } = {} as any,
) {
	return useContractRead({
		abi: zkKycABI,
		address: zkKycAddress[11155111],
		functionName: "tokenURI",
		...config,
	} as UseContractReadConfig<typeof zkKycABI, TFunctionName, TSelectData>);
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link zkKycABI}__ and `functionName` set to `"verifier"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xFB10BdFc968ab4434362109a9110A21b03bF99d5)
 */
export function useZkKycVerifier<
	TFunctionName extends "verifier",
	TSelectData = ReadContractResult<typeof zkKycABI, TFunctionName>,
>(
	config: Omit<
		UseContractReadConfig<typeof zkKycABI, TFunctionName, TSelectData>,
		"abi" | "address" | "functionName"
	> & { chainId?: keyof typeof zkKycAddress } = {} as any,
) {
	return useContractRead({
		abi: zkKycABI,
		address: zkKycAddress[11155111],
		functionName: "verifier",
		...config,
	} as UseContractReadConfig<typeof zkKycABI, TFunctionName, TSelectData>);
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link zkKycABI}__.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xFB10BdFc968ab4434362109a9110A21b03bF99d5)
 */
export function useZkKycWrite<
	TFunctionName extends string,
	TMode extends WriteContractMode = undefined,
	TChainId extends number = keyof typeof zkKycAddress,
>(
	config: TMode extends "prepared"
		? UseContractWriteConfig<
				PrepareWriteContractResult<typeof zkKycABI, string>["request"]["abi"],
				TFunctionName,
				TMode
			> & { address?: Address; chainId?: TChainId }
		: UseContractWriteConfig<typeof zkKycABI, TFunctionName, TMode> & {
				abi?: never;
				address?: never;
				chainId?: TChainId;
			} = {} as any,
) {
	return useContractWrite<typeof zkKycABI, TFunctionName, TMode>({
		abi: zkKycABI,
		address: zkKycAddress[11155111],
		...config,
	} as any);
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link zkKycABI}__ and `functionName` set to `"approve"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xFB10BdFc968ab4434362109a9110A21b03bF99d5)
 */
export function useZkKycApprove<
	TMode extends WriteContractMode = undefined,
	TChainId extends number = keyof typeof zkKycAddress,
>(
	config: TMode extends "prepared"
		? UseContractWriteConfig<
				PrepareWriteContractResult<
					typeof zkKycABI,
					"approve"
				>["request"]["abi"],
				"approve",
				TMode
			> & { address?: Address; chainId?: TChainId; functionName?: "approve" }
		: UseContractWriteConfig<typeof zkKycABI, "approve", TMode> & {
				abi?: never;
				address?: never;
				chainId?: TChainId;
				functionName?: "approve";
			} = {} as any,
) {
	return useContractWrite<typeof zkKycABI, "approve", TMode>({
		abi: zkKycABI,
		address: zkKycAddress[11155111],
		functionName: "approve",
		...config,
	} as any);
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link zkKycABI}__ and `functionName` set to `"burn"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xFB10BdFc968ab4434362109a9110A21b03bF99d5)
 */
export function useZkKycBurn<
	TMode extends WriteContractMode = undefined,
	TChainId extends number = keyof typeof zkKycAddress,
>(
	config: TMode extends "prepared"
		? UseContractWriteConfig<
				PrepareWriteContractResult<typeof zkKycABI, "burn">["request"]["abi"],
				"burn",
				TMode
			> & { address?: Address; chainId?: TChainId; functionName?: "burn" }
		: UseContractWriteConfig<typeof zkKycABI, "burn", TMode> & {
				abi?: never;
				address?: never;
				chainId?: TChainId;
				functionName?: "burn";
			} = {} as any,
) {
	return useContractWrite<typeof zkKycABI, "burn", TMode>({
		abi: zkKycABI,
		address: zkKycAddress[11155111],
		functionName: "burn",
		...config,
	} as any);
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link zkKycABI}__ and `functionName` set to `"mint"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xFB10BdFc968ab4434362109a9110A21b03bF99d5)
 */
export function useZkKycMint<
	TMode extends WriteContractMode = undefined,
	TChainId extends number = keyof typeof zkKycAddress,
>(
	config: TMode extends "prepared"
		? UseContractWriteConfig<
				PrepareWriteContractResult<typeof zkKycABI, "mint">["request"]["abi"],
				"mint",
				TMode
			> & { address?: Address; chainId?: TChainId; functionName?: "mint" }
		: UseContractWriteConfig<typeof zkKycABI, "mint", TMode> & {
				abi?: never;
				address?: never;
				chainId?: TChainId;
				functionName?: "mint";
			} = {} as any,
) {
	return useContractWrite<typeof zkKycABI, "mint", TMode>({
		abi: zkKycABI,
		address: zkKycAddress[11155111],
		functionName: "mint",
		...config,
	} as any);
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link zkKycABI}__ and `functionName` set to `"safeTransferFrom"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xFB10BdFc968ab4434362109a9110A21b03bF99d5)
 */
export function useZkKycSafeTransferFrom<
	TMode extends WriteContractMode = undefined,
	TChainId extends number = keyof typeof zkKycAddress,
>(
	config: TMode extends "prepared"
		? UseContractWriteConfig<
				PrepareWriteContractResult<
					typeof zkKycABI,
					"safeTransferFrom"
				>["request"]["abi"],
				"safeTransferFrom",
				TMode
			> & {
				address?: Address;
				chainId?: TChainId;
				functionName?: "safeTransferFrom";
			}
		: UseContractWriteConfig<typeof zkKycABI, "safeTransferFrom", TMode> & {
				abi?: never;
				address?: never;
				chainId?: TChainId;
				functionName?: "safeTransferFrom";
			} = {} as any,
) {
	return useContractWrite<typeof zkKycABI, "safeTransferFrom", TMode>({
		abi: zkKycABI,
		address: zkKycAddress[11155111],
		functionName: "safeTransferFrom",
		...config,
	} as any);
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link zkKycABI}__ and `functionName` set to `"setApprovalForAll"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xFB10BdFc968ab4434362109a9110A21b03bF99d5)
 */
export function useZkKycSetApprovalForAll<
	TMode extends WriteContractMode = undefined,
	TChainId extends number = keyof typeof zkKycAddress,
>(
	config: TMode extends "prepared"
		? UseContractWriteConfig<
				PrepareWriteContractResult<
					typeof zkKycABI,
					"setApprovalForAll"
				>["request"]["abi"],
				"setApprovalForAll",
				TMode
			> & {
				address?: Address;
				chainId?: TChainId;
				functionName?: "setApprovalForAll";
			}
		: UseContractWriteConfig<typeof zkKycABI, "setApprovalForAll", TMode> & {
				abi?: never;
				address?: never;
				chainId?: TChainId;
				functionName?: "setApprovalForAll";
			} = {} as any,
) {
	return useContractWrite<typeof zkKycABI, "setApprovalForAll", TMode>({
		abi: zkKycABI,
		address: zkKycAddress[11155111],
		functionName: "setApprovalForAll",
		...config,
	} as any);
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link zkKycABI}__ and `functionName` set to `"transferFrom"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xFB10BdFc968ab4434362109a9110A21b03bF99d5)
 */
export function useZkKycTransferFrom<
	TMode extends WriteContractMode = undefined,
	TChainId extends number = keyof typeof zkKycAddress,
>(
	config: TMode extends "prepared"
		? UseContractWriteConfig<
				PrepareWriteContractResult<
					typeof zkKycABI,
					"transferFrom"
				>["request"]["abi"],
				"transferFrom",
				TMode
			> & {
				address?: Address;
				chainId?: TChainId;
				functionName?: "transferFrom";
			}
		: UseContractWriteConfig<typeof zkKycABI, "transferFrom", TMode> & {
				abi?: never;
				address?: never;
				chainId?: TChainId;
				functionName?: "transferFrom";
			} = {} as any,
) {
	return useContractWrite<typeof zkKycABI, "transferFrom", TMode>({
		abi: zkKycABI,
		address: zkKycAddress[11155111],
		functionName: "transferFrom",
		...config,
	} as any);
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link zkKycABI}__.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xFB10BdFc968ab4434362109a9110A21b03bF99d5)
 */
export function usePrepareZkKycWrite<TFunctionName extends string>(
	config: Omit<
		UsePrepareContractWriteConfig<typeof zkKycABI, TFunctionName>,
		"abi" | "address"
	> & { chainId?: keyof typeof zkKycAddress } = {} as any,
) {
	return usePrepareContractWrite({
		abi: zkKycABI,
		address: zkKycAddress[11155111],
		...config,
	} as UsePrepareContractWriteConfig<typeof zkKycABI, TFunctionName>);
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link zkKycABI}__ and `functionName` set to `"approve"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xFB10BdFc968ab4434362109a9110A21b03bF99d5)
 */
export function usePrepareZkKycApprove(
	config: Omit<
		UsePrepareContractWriteConfig<typeof zkKycABI, "approve">,
		"abi" | "address" | "functionName"
	> & { chainId?: keyof typeof zkKycAddress } = {} as any,
) {
	return usePrepareContractWrite({
		abi: zkKycABI,
		address: zkKycAddress[11155111],
		functionName: "approve",
		...config,
	} as UsePrepareContractWriteConfig<typeof zkKycABI, "approve">);
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link zkKycABI}__ and `functionName` set to `"burn"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xFB10BdFc968ab4434362109a9110A21b03bF99d5)
 */
export function usePrepareZkKycBurn(
	config: Omit<
		UsePrepareContractWriteConfig<typeof zkKycABI, "burn">,
		"abi" | "address" | "functionName"
	> & { chainId?: keyof typeof zkKycAddress } = {} as any,
) {
	return usePrepareContractWrite({
		abi: zkKycABI,
		address: zkKycAddress[11155111],
		functionName: "burn",
		...config,
	} as UsePrepareContractWriteConfig<typeof zkKycABI, "burn">);
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link zkKycABI}__ and `functionName` set to `"mint"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xFB10BdFc968ab4434362109a9110A21b03bF99d5)
 */
export function usePrepareZkKycMint(
	config: Omit<
		UsePrepareContractWriteConfig<typeof zkKycABI, "mint">,
		"abi" | "address" | "functionName"
	> & { chainId?: keyof typeof zkKycAddress } = {} as any,
) {
	return usePrepareContractWrite({
		abi: zkKycABI,
		address: zkKycAddress[11155111],
		functionName: "mint",
		...config,
	} as UsePrepareContractWriteConfig<typeof zkKycABI, "mint">);
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link zkKycABI}__ and `functionName` set to `"safeTransferFrom"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xFB10BdFc968ab4434362109a9110A21b03bF99d5)
 */
export function usePrepareZkKycSafeTransferFrom(
	config: Omit<
		UsePrepareContractWriteConfig<typeof zkKycABI, "safeTransferFrom">,
		"abi" | "address" | "functionName"
	> & { chainId?: keyof typeof zkKycAddress } = {} as any,
) {
	return usePrepareContractWrite({
		abi: zkKycABI,
		address: zkKycAddress[11155111],
		functionName: "safeTransferFrom",
		...config,
	} as UsePrepareContractWriteConfig<typeof zkKycABI, "safeTransferFrom">);
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link zkKycABI}__ and `functionName` set to `"setApprovalForAll"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xFB10BdFc968ab4434362109a9110A21b03bF99d5)
 */
export function usePrepareZkKycSetApprovalForAll(
	config: Omit<
		UsePrepareContractWriteConfig<typeof zkKycABI, "setApprovalForAll">,
		"abi" | "address" | "functionName"
	> & { chainId?: keyof typeof zkKycAddress } = {} as any,
) {
	return usePrepareContractWrite({
		abi: zkKycABI,
		address: zkKycAddress[11155111],
		functionName: "setApprovalForAll",
		...config,
	} as UsePrepareContractWriteConfig<typeof zkKycABI, "setApprovalForAll">);
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link zkKycABI}__ and `functionName` set to `"transferFrom"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xFB10BdFc968ab4434362109a9110A21b03bF99d5)
 */
export function usePrepareZkKycTransferFrom(
	config: Omit<
		UsePrepareContractWriteConfig<typeof zkKycABI, "transferFrom">,
		"abi" | "address" | "functionName"
	> & { chainId?: keyof typeof zkKycAddress } = {} as any,
) {
	return usePrepareContractWrite({
		abi: zkKycABI,
		address: zkKycAddress[11155111],
		functionName: "transferFrom",
		...config,
	} as UsePrepareContractWriteConfig<typeof zkKycABI, "transferFrom">);
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link zkKycABI}__.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xFB10BdFc968ab4434362109a9110A21b03bF99d5)
 */
export function useZkKycEvent<TEventName extends string>(
	config: Omit<
		UseContractEventConfig<typeof zkKycABI, TEventName>,
		"abi" | "address"
	> & { chainId?: keyof typeof zkKycAddress } = {} as any,
) {
	return useContractEvent({
		abi: zkKycABI,
		address: zkKycAddress[11155111],
		...config,
	} as UseContractEventConfig<typeof zkKycABI, TEventName>);
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link zkKycABI}__ and `eventName` set to `"Approval"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xFB10BdFc968ab4434362109a9110A21b03bF99d5)
 */
export function useZkKycApprovalEvent(
	config: Omit<
		UseContractEventConfig<typeof zkKycABI, "Approval">,
		"abi" | "address" | "eventName"
	> & { chainId?: keyof typeof zkKycAddress } = {} as any,
) {
	return useContractEvent({
		abi: zkKycABI,
		address: zkKycAddress[11155111],
		eventName: "Approval",
		...config,
	} as UseContractEventConfig<typeof zkKycABI, "Approval">);
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link zkKycABI}__ and `eventName` set to `"ApprovalForAll"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xFB10BdFc968ab4434362109a9110A21b03bF99d5)
 */
export function useZkKycApprovalForAllEvent(
	config: Omit<
		UseContractEventConfig<typeof zkKycABI, "ApprovalForAll">,
		"abi" | "address" | "eventName"
	> & { chainId?: keyof typeof zkKycAddress } = {} as any,
) {
	return useContractEvent({
		abi: zkKycABI,
		address: zkKycAddress[11155111],
		eventName: "ApprovalForAll",
		...config,
	} as UseContractEventConfig<typeof zkKycABI, "ApprovalForAll">);
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link zkKycABI}__ and `eventName` set to `"Burned"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xFB10BdFc968ab4434362109a9110A21b03bF99d5)
 */
export function useZkKycBurnedEvent(
	config: Omit<
		UseContractEventConfig<typeof zkKycABI, "Burned">,
		"abi" | "address" | "eventName"
	> & { chainId?: keyof typeof zkKycAddress } = {} as any,
) {
	return useContractEvent({
		abi: zkKycABI,
		address: zkKycAddress[11155111],
		eventName: "Burned",
		...config,
	} as UseContractEventConfig<typeof zkKycABI, "Burned">);
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link zkKycABI}__ and `eventName` set to `"Minted"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xFB10BdFc968ab4434362109a9110A21b03bF99d5)
 */
export function useZkKycMintedEvent(
	config: Omit<
		UseContractEventConfig<typeof zkKycABI, "Minted">,
		"abi" | "address" | "eventName"
	> & { chainId?: keyof typeof zkKycAddress } = {} as any,
) {
	return useContractEvent({
		abi: zkKycABI,
		address: zkKycAddress[11155111],
		eventName: "Minted",
		...config,
	} as UseContractEventConfig<typeof zkKycABI, "Minted">);
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link zkKycABI}__ and `eventName` set to `"Transfer"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xFB10BdFc968ab4434362109a9110A21b03bF99d5)
 */
export function useZkKycTransferEvent(
	config: Omit<
		UseContractEventConfig<typeof zkKycABI, "Transfer">,
		"abi" | "address" | "eventName"
	> & { chainId?: keyof typeof zkKycAddress } = {} as any,
) {
	return useContractEvent({
		abi: zkKycABI,
		address: zkKycAddress[11155111],
		eventName: "Transfer",
		...config,
	} as UseContractEventConfig<typeof zkKycABI, "Transfer">);
}
