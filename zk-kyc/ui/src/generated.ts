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
} from 'wagmi'
import {
  ReadContractResult,
  WriteContractMode,
  PrepareWriteContractResult,
} from 'wagmi/actions'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ZID
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x2e42DD957B1C5529FF94DC474FdAdc5afBD031D8)
 */
export const zidABI = [
  {
    stateMutability: 'nonpayable',
    type: 'constructor',
    inputs: [
      {
        name: '_verifier',
        internalType: 'contract IRiscZeroVerifier',
        type: 'address',
      },
      { name: 'name', internalType: 'string', type: 'string' },
      { name: 'symbol', internalType: 'string', type: 'string' },
    ],
  },
  {
    type: 'error',
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'owner', internalType: 'address', type: 'address' },
    ],
    name: 'ERC721IncorrectOwner',
  },
  {
    type: 'error',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC721InsufficientApproval',
  },
  {
    type: 'error',
    inputs: [{ name: 'approver', internalType: 'address', type: 'address' }],
    name: 'ERC721InvalidApprover',
  },
  {
    type: 'error',
    inputs: [{ name: 'operator', internalType: 'address', type: 'address' }],
    name: 'ERC721InvalidOperator',
  },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'ERC721InvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'receiver', internalType: 'address', type: 'address' }],
    name: 'ERC721InvalidReceiver',
  },
  {
    type: 'error',
    inputs: [{ name: 'sender', internalType: 'address', type: 'address' }],
    name: 'ERC721InvalidSender',
  },
  {
    type: 'error',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'ERC721NonexistentToken',
  },
  {
    type: 'error',
    inputs: [{ name: 'message', internalType: 'string', type: 'string' }],
    name: 'InvalidMint',
  },
  {
    type: 'error',
    inputs: [{ name: 'message', internalType: 'string', type: 'string' }],
    name: 'NotTokenOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'message', internalType: 'string', type: 'string' }],
    name: 'TokenNotTransferable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'approved',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'operator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'approved', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'ApprovalForAll',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'Burned',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'claimId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'Minted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'Transfer',
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'burn',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getApproved',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'imageId',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'operator', internalType: 'address', type: 'address' },
    ],
    name: 'isApprovedForAll',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'claimId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'postStateDigest', internalType: 'bytes32', type: 'bytes32' },
      { name: 'seal', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'mint',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'approved', internalType: 'bool', type: 'bool' },
    ],
    name: 'setApprovalForAll',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'verifier',
    outputs: [
      { name: '', internalType: 'contract IRiscZeroVerifier', type: 'address' },
    ],
  },
] as const

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x2e42DD957B1C5529FF94DC474FdAdc5afBD031D8)
 */
export const zidAddress = {
  11155111: '0x2e42DD957B1C5529FF94DC474FdAdc5afBD031D8',
} as const

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x2e42DD957B1C5529FF94DC474FdAdc5afBD031D8)
 */
export const zidConfig = { address: zidAddress, abi: zidABI } as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// erc20
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc20ABI = [
  {
    type: 'event',
    inputs: [
      { name: 'owner', type: 'address', indexed: true },
      { name: 'spender', type: 'address', indexed: true },
      { name: 'value', type: 'uint256', indexed: false },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    inputs: [
      { name: 'from', type: 'address', indexed: true },
      { name: 'to', type: 'address', indexed: true },
      { name: 'value', type: 'uint256', indexed: false },
    ],
    name: 'Transfer',
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'sender', type: 'address' },
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', type: 'bool' }],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link zidABI}__.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x2e42DD957B1C5529FF94DC474FdAdc5afBD031D8)
 */
export function useZidRead<
  TFunctionName extends string,
  TSelectData = ReadContractResult<typeof zidABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof zidABI, TFunctionName, TSelectData>,
    'abi' | 'address'
  > & { chainId?: keyof typeof zidAddress } = {} as any,
) {
  return useContractRead({
    abi: zidABI,
    address: zidAddress[11155111],
    ...config,
  } as UseContractReadConfig<typeof zidABI, TFunctionName, TSelectData>)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link zidABI}__ and `functionName` set to `"balanceOf"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x2e42DD957B1C5529FF94DC474FdAdc5afBD031D8)
 */
export function useZidBalanceOf<
  TFunctionName extends 'balanceOf',
  TSelectData = ReadContractResult<typeof zidABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof zidABI, TFunctionName, TSelectData>,
    'abi' | 'address' | 'functionName'
  > & { chainId?: keyof typeof zidAddress } = {} as any,
) {
  return useContractRead({
    abi: zidABI,
    address: zidAddress[11155111],
    functionName: 'balanceOf',
    ...config,
  } as UseContractReadConfig<typeof zidABI, TFunctionName, TSelectData>)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link zidABI}__ and `functionName` set to `"getApproved"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x2e42DD957B1C5529FF94DC474FdAdc5afBD031D8)
 */
export function useZidGetApproved<
  TFunctionName extends 'getApproved',
  TSelectData = ReadContractResult<typeof zidABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof zidABI, TFunctionName, TSelectData>,
    'abi' | 'address' | 'functionName'
  > & { chainId?: keyof typeof zidAddress } = {} as any,
) {
  return useContractRead({
    abi: zidABI,
    address: zidAddress[11155111],
    functionName: 'getApproved',
    ...config,
  } as UseContractReadConfig<typeof zidABI, TFunctionName, TSelectData>)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link zidABI}__ and `functionName` set to `"imageId"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x2e42DD957B1C5529FF94DC474FdAdc5afBD031D8)
 */
export function useZidImageId<
  TFunctionName extends 'imageId',
  TSelectData = ReadContractResult<typeof zidABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof zidABI, TFunctionName, TSelectData>,
    'abi' | 'address' | 'functionName'
  > & { chainId?: keyof typeof zidAddress } = {} as any,
) {
  return useContractRead({
    abi: zidABI,
    address: zidAddress[11155111],
    functionName: 'imageId',
    ...config,
  } as UseContractReadConfig<typeof zidABI, TFunctionName, TSelectData>)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link zidABI}__ and `functionName` set to `"isApprovedForAll"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x2e42DD957B1C5529FF94DC474FdAdc5afBD031D8)
 */
export function useZidIsApprovedForAll<
  TFunctionName extends 'isApprovedForAll',
  TSelectData = ReadContractResult<typeof zidABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof zidABI, TFunctionName, TSelectData>,
    'abi' | 'address' | 'functionName'
  > & { chainId?: keyof typeof zidAddress } = {} as any,
) {
  return useContractRead({
    abi: zidABI,
    address: zidAddress[11155111],
    functionName: 'isApprovedForAll',
    ...config,
  } as UseContractReadConfig<typeof zidABI, TFunctionName, TSelectData>)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link zidABI}__ and `functionName` set to `"name"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x2e42DD957B1C5529FF94DC474FdAdc5afBD031D8)
 */
export function useZidName<
  TFunctionName extends 'name',
  TSelectData = ReadContractResult<typeof zidABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof zidABI, TFunctionName, TSelectData>,
    'abi' | 'address' | 'functionName'
  > & { chainId?: keyof typeof zidAddress } = {} as any,
) {
  return useContractRead({
    abi: zidABI,
    address: zidAddress[11155111],
    functionName: 'name',
    ...config,
  } as UseContractReadConfig<typeof zidABI, TFunctionName, TSelectData>)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link zidABI}__ and `functionName` set to `"ownerOf"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x2e42DD957B1C5529FF94DC474FdAdc5afBD031D8)
 */
export function useZidOwnerOf<
  TFunctionName extends 'ownerOf',
  TSelectData = ReadContractResult<typeof zidABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof zidABI, TFunctionName, TSelectData>,
    'abi' | 'address' | 'functionName'
  > & { chainId?: keyof typeof zidAddress } = {} as any,
) {
  return useContractRead({
    abi: zidABI,
    address: zidAddress[11155111],
    functionName: 'ownerOf',
    ...config,
  } as UseContractReadConfig<typeof zidABI, TFunctionName, TSelectData>)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link zidABI}__ and `functionName` set to `"supportsInterface"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x2e42DD957B1C5529FF94DC474FdAdc5afBD031D8)
 */
export function useZidSupportsInterface<
  TFunctionName extends 'supportsInterface',
  TSelectData = ReadContractResult<typeof zidABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof zidABI, TFunctionName, TSelectData>,
    'abi' | 'address' | 'functionName'
  > & { chainId?: keyof typeof zidAddress } = {} as any,
) {
  return useContractRead({
    abi: zidABI,
    address: zidAddress[11155111],
    functionName: 'supportsInterface',
    ...config,
  } as UseContractReadConfig<typeof zidABI, TFunctionName, TSelectData>)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link zidABI}__ and `functionName` set to `"symbol"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x2e42DD957B1C5529FF94DC474FdAdc5afBD031D8)
 */
export function useZidSymbol<
  TFunctionName extends 'symbol',
  TSelectData = ReadContractResult<typeof zidABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof zidABI, TFunctionName, TSelectData>,
    'abi' | 'address' | 'functionName'
  > & { chainId?: keyof typeof zidAddress } = {} as any,
) {
  return useContractRead({
    abi: zidABI,
    address: zidAddress[11155111],
    functionName: 'symbol',
    ...config,
  } as UseContractReadConfig<typeof zidABI, TFunctionName, TSelectData>)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link zidABI}__ and `functionName` set to `"tokenURI"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x2e42DD957B1C5529FF94DC474FdAdc5afBD031D8)
 */
export function useZidTokenUri<
  TFunctionName extends 'tokenURI',
  TSelectData = ReadContractResult<typeof zidABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof zidABI, TFunctionName, TSelectData>,
    'abi' | 'address' | 'functionName'
  > & { chainId?: keyof typeof zidAddress } = {} as any,
) {
  return useContractRead({
    abi: zidABI,
    address: zidAddress[11155111],
    functionName: 'tokenURI',
    ...config,
  } as UseContractReadConfig<typeof zidABI, TFunctionName, TSelectData>)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link zidABI}__ and `functionName` set to `"verifier"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x2e42DD957B1C5529FF94DC474FdAdc5afBD031D8)
 */
export function useZidVerifier<
  TFunctionName extends 'verifier',
  TSelectData = ReadContractResult<typeof zidABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof zidABI, TFunctionName, TSelectData>,
    'abi' | 'address' | 'functionName'
  > & { chainId?: keyof typeof zidAddress } = {} as any,
) {
  return useContractRead({
    abi: zidABI,
    address: zidAddress[11155111],
    functionName: 'verifier',
    ...config,
  } as UseContractReadConfig<typeof zidABI, TFunctionName, TSelectData>)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link zidABI}__.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x2e42DD957B1C5529FF94DC474FdAdc5afBD031D8)
 */
export function useZidWrite<
  TFunctionName extends string,
  TMode extends WriteContractMode = undefined,
  TChainId extends number = keyof typeof zidAddress,
>(
  config: TMode extends 'prepared'
    ? UseContractWriteConfig<
        PrepareWriteContractResult<typeof zidABI, string>['request']['abi'],
        TFunctionName,
        TMode
      > & { address?: Address; chainId?: TChainId }
    : UseContractWriteConfig<typeof zidABI, TFunctionName, TMode> & {
        abi?: never
        address?: never
        chainId?: TChainId
      } = {} as any,
) {
  return useContractWrite<typeof zidABI, TFunctionName, TMode>({
    abi: zidABI,
    address: zidAddress[11155111],
    ...config,
  } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link zidABI}__ and `functionName` set to `"approve"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x2e42DD957B1C5529FF94DC474FdAdc5afBD031D8)
 */
export function useZidApprove<
  TMode extends WriteContractMode = undefined,
  TChainId extends number = keyof typeof zidAddress,
>(
  config: TMode extends 'prepared'
    ? UseContractWriteConfig<
        PrepareWriteContractResult<typeof zidABI, 'approve'>['request']['abi'],
        'approve',
        TMode
      > & { address?: Address; chainId?: TChainId; functionName?: 'approve' }
    : UseContractWriteConfig<typeof zidABI, 'approve', TMode> & {
        abi?: never
        address?: never
        chainId?: TChainId
        functionName?: 'approve'
      } = {} as any,
) {
  return useContractWrite<typeof zidABI, 'approve', TMode>({
    abi: zidABI,
    address: zidAddress[11155111],
    functionName: 'approve',
    ...config,
  } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link zidABI}__ and `functionName` set to `"burn"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x2e42DD957B1C5529FF94DC474FdAdc5afBD031D8)
 */
export function useZidBurn<
  TMode extends WriteContractMode = undefined,
  TChainId extends number = keyof typeof zidAddress,
>(
  config: TMode extends 'prepared'
    ? UseContractWriteConfig<
        PrepareWriteContractResult<typeof zidABI, 'burn'>['request']['abi'],
        'burn',
        TMode
      > & { address?: Address; chainId?: TChainId; functionName?: 'burn' }
    : UseContractWriteConfig<typeof zidABI, 'burn', TMode> & {
        abi?: never
        address?: never
        chainId?: TChainId
        functionName?: 'burn'
      } = {} as any,
) {
  return useContractWrite<typeof zidABI, 'burn', TMode>({
    abi: zidABI,
    address: zidAddress[11155111],
    functionName: 'burn',
    ...config,
  } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link zidABI}__ and `functionName` set to `"mint"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x2e42DD957B1C5529FF94DC474FdAdc5afBD031D8)
 */
export function useZidMint<
  TMode extends WriteContractMode = undefined,
  TChainId extends number = keyof typeof zidAddress,
>(
  config: TMode extends 'prepared'
    ? UseContractWriteConfig<
        PrepareWriteContractResult<typeof zidABI, 'mint'>['request']['abi'],
        'mint',
        TMode
      > & { address?: Address; chainId?: TChainId; functionName?: 'mint' }
    : UseContractWriteConfig<typeof zidABI, 'mint', TMode> & {
        abi?: never
        address?: never
        chainId?: TChainId
        functionName?: 'mint'
      } = {} as any,
) {
  return useContractWrite<typeof zidABI, 'mint', TMode>({
    abi: zidABI,
    address: zidAddress[11155111],
    functionName: 'mint',
    ...config,
  } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link zidABI}__ and `functionName` set to `"safeTransferFrom"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x2e42DD957B1C5529FF94DC474FdAdc5afBD031D8)
 */
export function useZidSafeTransferFrom<
  TMode extends WriteContractMode = undefined,
  TChainId extends number = keyof typeof zidAddress,
>(
  config: TMode extends 'prepared'
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof zidABI,
          'safeTransferFrom'
        >['request']['abi'],
        'safeTransferFrom',
        TMode
      > & {
        address?: Address
        chainId?: TChainId
        functionName?: 'safeTransferFrom'
      }
    : UseContractWriteConfig<typeof zidABI, 'safeTransferFrom', TMode> & {
        abi?: never
        address?: never
        chainId?: TChainId
        functionName?: 'safeTransferFrom'
      } = {} as any,
) {
  return useContractWrite<typeof zidABI, 'safeTransferFrom', TMode>({
    abi: zidABI,
    address: zidAddress[11155111],
    functionName: 'safeTransferFrom',
    ...config,
  } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link zidABI}__ and `functionName` set to `"setApprovalForAll"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x2e42DD957B1C5529FF94DC474FdAdc5afBD031D8)
 */
export function useZidSetApprovalForAll<
  TMode extends WriteContractMode = undefined,
  TChainId extends number = keyof typeof zidAddress,
>(
  config: TMode extends 'prepared'
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof zidABI,
          'setApprovalForAll'
        >['request']['abi'],
        'setApprovalForAll',
        TMode
      > & {
        address?: Address
        chainId?: TChainId
        functionName?: 'setApprovalForAll'
      }
    : UseContractWriteConfig<typeof zidABI, 'setApprovalForAll', TMode> & {
        abi?: never
        address?: never
        chainId?: TChainId
        functionName?: 'setApprovalForAll'
      } = {} as any,
) {
  return useContractWrite<typeof zidABI, 'setApprovalForAll', TMode>({
    abi: zidABI,
    address: zidAddress[11155111],
    functionName: 'setApprovalForAll',
    ...config,
  } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link zidABI}__ and `functionName` set to `"transferFrom"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x2e42DD957B1C5529FF94DC474FdAdc5afBD031D8)
 */
export function useZidTransferFrom<
  TMode extends WriteContractMode = undefined,
  TChainId extends number = keyof typeof zidAddress,
>(
  config: TMode extends 'prepared'
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof zidABI,
          'transferFrom'
        >['request']['abi'],
        'transferFrom',
        TMode
      > & {
        address?: Address
        chainId?: TChainId
        functionName?: 'transferFrom'
      }
    : UseContractWriteConfig<typeof zidABI, 'transferFrom', TMode> & {
        abi?: never
        address?: never
        chainId?: TChainId
        functionName?: 'transferFrom'
      } = {} as any,
) {
  return useContractWrite<typeof zidABI, 'transferFrom', TMode>({
    abi: zidABI,
    address: zidAddress[11155111],
    functionName: 'transferFrom',
    ...config,
  } as any)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link zidABI}__.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x2e42DD957B1C5529FF94DC474FdAdc5afBD031D8)
 */
export function usePrepareZidWrite<TFunctionName extends string>(
  config: Omit<
    UsePrepareContractWriteConfig<typeof zidABI, TFunctionName>,
    'abi' | 'address'
  > & { chainId?: keyof typeof zidAddress } = {} as any,
) {
  return usePrepareContractWrite({
    abi: zidABI,
    address: zidAddress[11155111],
    ...config,
  } as UsePrepareContractWriteConfig<typeof zidABI, TFunctionName>)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link zidABI}__ and `functionName` set to `"approve"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x2e42DD957B1C5529FF94DC474FdAdc5afBD031D8)
 */
export function usePrepareZidApprove(
  config: Omit<
    UsePrepareContractWriteConfig<typeof zidABI, 'approve'>,
    'abi' | 'address' | 'functionName'
  > & { chainId?: keyof typeof zidAddress } = {} as any,
) {
  return usePrepareContractWrite({
    abi: zidABI,
    address: zidAddress[11155111],
    functionName: 'approve',
    ...config,
  } as UsePrepareContractWriteConfig<typeof zidABI, 'approve'>)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link zidABI}__ and `functionName` set to `"burn"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x2e42DD957B1C5529FF94DC474FdAdc5afBD031D8)
 */
export function usePrepareZidBurn(
  config: Omit<
    UsePrepareContractWriteConfig<typeof zidABI, 'burn'>,
    'abi' | 'address' | 'functionName'
  > & { chainId?: keyof typeof zidAddress } = {} as any,
) {
  return usePrepareContractWrite({
    abi: zidABI,
    address: zidAddress[11155111],
    functionName: 'burn',
    ...config,
  } as UsePrepareContractWriteConfig<typeof zidABI, 'burn'>)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link zidABI}__ and `functionName` set to `"mint"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x2e42DD957B1C5529FF94DC474FdAdc5afBD031D8)
 */
export function usePrepareZidMint(
  config: Omit<
    UsePrepareContractWriteConfig<typeof zidABI, 'mint'>,
    'abi' | 'address' | 'functionName'
  > & { chainId?: keyof typeof zidAddress } = {} as any,
) {
  return usePrepareContractWrite({
    abi: zidABI,
    address: zidAddress[11155111],
    functionName: 'mint',
    ...config,
  } as UsePrepareContractWriteConfig<typeof zidABI, 'mint'>)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link zidABI}__ and `functionName` set to `"safeTransferFrom"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x2e42DD957B1C5529FF94DC474FdAdc5afBD031D8)
 */
export function usePrepareZidSafeTransferFrom(
  config: Omit<
    UsePrepareContractWriteConfig<typeof zidABI, 'safeTransferFrom'>,
    'abi' | 'address' | 'functionName'
  > & { chainId?: keyof typeof zidAddress } = {} as any,
) {
  return usePrepareContractWrite({
    abi: zidABI,
    address: zidAddress[11155111],
    functionName: 'safeTransferFrom',
    ...config,
  } as UsePrepareContractWriteConfig<typeof zidABI, 'safeTransferFrom'>)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link zidABI}__ and `functionName` set to `"setApprovalForAll"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x2e42DD957B1C5529FF94DC474FdAdc5afBD031D8)
 */
export function usePrepareZidSetApprovalForAll(
  config: Omit<
    UsePrepareContractWriteConfig<typeof zidABI, 'setApprovalForAll'>,
    'abi' | 'address' | 'functionName'
  > & { chainId?: keyof typeof zidAddress } = {} as any,
) {
  return usePrepareContractWrite({
    abi: zidABI,
    address: zidAddress[11155111],
    functionName: 'setApprovalForAll',
    ...config,
  } as UsePrepareContractWriteConfig<typeof zidABI, 'setApprovalForAll'>)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link zidABI}__ and `functionName` set to `"transferFrom"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x2e42DD957B1C5529FF94DC474FdAdc5afBD031D8)
 */
export function usePrepareZidTransferFrom(
  config: Omit<
    UsePrepareContractWriteConfig<typeof zidABI, 'transferFrom'>,
    'abi' | 'address' | 'functionName'
  > & { chainId?: keyof typeof zidAddress } = {} as any,
) {
  return usePrepareContractWrite({
    abi: zidABI,
    address: zidAddress[11155111],
    functionName: 'transferFrom',
    ...config,
  } as UsePrepareContractWriteConfig<typeof zidABI, 'transferFrom'>)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link zidABI}__.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x2e42DD957B1C5529FF94DC474FdAdc5afBD031D8)
 */
export function useZidEvent<TEventName extends string>(
  config: Omit<
    UseContractEventConfig<typeof zidABI, TEventName>,
    'abi' | 'address'
  > & { chainId?: keyof typeof zidAddress } = {} as any,
) {
  return useContractEvent({
    abi: zidABI,
    address: zidAddress[11155111],
    ...config,
  } as UseContractEventConfig<typeof zidABI, TEventName>)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link zidABI}__ and `eventName` set to `"Approval"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x2e42DD957B1C5529FF94DC474FdAdc5afBD031D8)
 */
export function useZidApprovalEvent(
  config: Omit<
    UseContractEventConfig<typeof zidABI, 'Approval'>,
    'abi' | 'address' | 'eventName'
  > & { chainId?: keyof typeof zidAddress } = {} as any,
) {
  return useContractEvent({
    abi: zidABI,
    address: zidAddress[11155111],
    eventName: 'Approval',
    ...config,
  } as UseContractEventConfig<typeof zidABI, 'Approval'>)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link zidABI}__ and `eventName` set to `"ApprovalForAll"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x2e42DD957B1C5529FF94DC474FdAdc5afBD031D8)
 */
export function useZidApprovalForAllEvent(
  config: Omit<
    UseContractEventConfig<typeof zidABI, 'ApprovalForAll'>,
    'abi' | 'address' | 'eventName'
  > & { chainId?: keyof typeof zidAddress } = {} as any,
) {
  return useContractEvent({
    abi: zidABI,
    address: zidAddress[11155111],
    eventName: 'ApprovalForAll',
    ...config,
  } as UseContractEventConfig<typeof zidABI, 'ApprovalForAll'>)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link zidABI}__ and `eventName` set to `"Burned"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x2e42DD957B1C5529FF94DC474FdAdc5afBD031D8)
 */
export function useZidBurnedEvent(
  config: Omit<
    UseContractEventConfig<typeof zidABI, 'Burned'>,
    'abi' | 'address' | 'eventName'
  > & { chainId?: keyof typeof zidAddress } = {} as any,
) {
  return useContractEvent({
    abi: zidABI,
    address: zidAddress[11155111],
    eventName: 'Burned',
    ...config,
  } as UseContractEventConfig<typeof zidABI, 'Burned'>)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link zidABI}__ and `eventName` set to `"Minted"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x2e42DD957B1C5529FF94DC474FdAdc5afBD031D8)
 */
export function useZidMintedEvent(
  config: Omit<
    UseContractEventConfig<typeof zidABI, 'Minted'>,
    'abi' | 'address' | 'eventName'
  > & { chainId?: keyof typeof zidAddress } = {} as any,
) {
  return useContractEvent({
    abi: zidABI,
    address: zidAddress[11155111],
    eventName: 'Minted',
    ...config,
  } as UseContractEventConfig<typeof zidABI, 'Minted'>)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link zidABI}__ and `eventName` set to `"Transfer"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x2e42DD957B1C5529FF94DC474FdAdc5afBD031D8)
 */
export function useZidTransferEvent(
  config: Omit<
    UseContractEventConfig<typeof zidABI, 'Transfer'>,
    'abi' | 'address' | 'eventName'
  > & { chainId?: keyof typeof zidAddress } = {} as any,
) {
  return useContractEvent({
    abi: zidABI,
    address: zidAddress[11155111],
    eventName: 'Transfer',
    ...config,
  } as UseContractEventConfig<typeof zidABI, 'Transfer'>)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link erc20ABI}__.
 */
export function useErc20Read<
  TFunctionName extends string,
  TSelectData = ReadContractResult<typeof erc20ABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof erc20ABI, TFunctionName, TSelectData>,
    'abi'
  > = {} as any,
) {
  return useContractRead({ abi: erc20ABI, ...config } as UseContractReadConfig<
    typeof erc20ABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link erc20ABI}__ and `functionName` set to `"allowance"`.
 */
export function useErc20Allowance<
  TFunctionName extends 'allowance',
  TSelectData = ReadContractResult<typeof erc20ABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof erc20ABI, TFunctionName, TSelectData>,
    'abi' | 'functionName'
  > = {} as any,
) {
  return useContractRead({
    abi: erc20ABI,
    functionName: 'allowance',
    ...config,
  } as UseContractReadConfig<typeof erc20ABI, TFunctionName, TSelectData>)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link erc20ABI}__ and `functionName` set to `"balanceOf"`.
 */
export function useErc20BalanceOf<
  TFunctionName extends 'balanceOf',
  TSelectData = ReadContractResult<typeof erc20ABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof erc20ABI, TFunctionName, TSelectData>,
    'abi' | 'functionName'
  > = {} as any,
) {
  return useContractRead({
    abi: erc20ABI,
    functionName: 'balanceOf',
    ...config,
  } as UseContractReadConfig<typeof erc20ABI, TFunctionName, TSelectData>)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link erc20ABI}__ and `functionName` set to `"decimals"`.
 */
export function useErc20Decimals<
  TFunctionName extends 'decimals',
  TSelectData = ReadContractResult<typeof erc20ABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof erc20ABI, TFunctionName, TSelectData>,
    'abi' | 'functionName'
  > = {} as any,
) {
  return useContractRead({
    abi: erc20ABI,
    functionName: 'decimals',
    ...config,
  } as UseContractReadConfig<typeof erc20ABI, TFunctionName, TSelectData>)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link erc20ABI}__ and `functionName` set to `"name"`.
 */
export function useErc20Name<
  TFunctionName extends 'name',
  TSelectData = ReadContractResult<typeof erc20ABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof erc20ABI, TFunctionName, TSelectData>,
    'abi' | 'functionName'
  > = {} as any,
) {
  return useContractRead({
    abi: erc20ABI,
    functionName: 'name',
    ...config,
  } as UseContractReadConfig<typeof erc20ABI, TFunctionName, TSelectData>)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link erc20ABI}__ and `functionName` set to `"symbol"`.
 */
export function useErc20Symbol<
  TFunctionName extends 'symbol',
  TSelectData = ReadContractResult<typeof erc20ABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof erc20ABI, TFunctionName, TSelectData>,
    'abi' | 'functionName'
  > = {} as any,
) {
  return useContractRead({
    abi: erc20ABI,
    functionName: 'symbol',
    ...config,
  } as UseContractReadConfig<typeof erc20ABI, TFunctionName, TSelectData>)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link erc20ABI}__ and `functionName` set to `"totalSupply"`.
 */
export function useErc20TotalSupply<
  TFunctionName extends 'totalSupply',
  TSelectData = ReadContractResult<typeof erc20ABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof erc20ABI, TFunctionName, TSelectData>,
    'abi' | 'functionName'
  > = {} as any,
) {
  return useContractRead({
    abi: erc20ABI,
    functionName: 'totalSupply',
    ...config,
  } as UseContractReadConfig<typeof erc20ABI, TFunctionName, TSelectData>)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link erc20ABI}__.
 */
export function useErc20Write<
  TFunctionName extends string,
  TMode extends WriteContractMode = undefined,
>(
  config: TMode extends 'prepared'
    ? UseContractWriteConfig<
        PrepareWriteContractResult<typeof erc20ABI, string>['request']['abi'],
        TFunctionName,
        TMode
      >
    : UseContractWriteConfig<typeof erc20ABI, TFunctionName, TMode> & {
        abi?: never
      } = {} as any,
) {
  return useContractWrite<typeof erc20ABI, TFunctionName, TMode>({
    abi: erc20ABI,
    ...config,
  } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link erc20ABI}__ and `functionName` set to `"approve"`.
 */
export function useErc20Approve<TMode extends WriteContractMode = undefined>(
  config: TMode extends 'prepared'
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof erc20ABI,
          'approve'
        >['request']['abi'],
        'approve',
        TMode
      > & { functionName?: 'approve' }
    : UseContractWriteConfig<typeof erc20ABI, 'approve', TMode> & {
        abi?: never
        functionName?: 'approve'
      } = {} as any,
) {
  return useContractWrite<typeof erc20ABI, 'approve', TMode>({
    abi: erc20ABI,
    functionName: 'approve',
    ...config,
  } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link erc20ABI}__ and `functionName` set to `"transfer"`.
 */
export function useErc20Transfer<TMode extends WriteContractMode = undefined>(
  config: TMode extends 'prepared'
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof erc20ABI,
          'transfer'
        >['request']['abi'],
        'transfer',
        TMode
      > & { functionName?: 'transfer' }
    : UseContractWriteConfig<typeof erc20ABI, 'transfer', TMode> & {
        abi?: never
        functionName?: 'transfer'
      } = {} as any,
) {
  return useContractWrite<typeof erc20ABI, 'transfer', TMode>({
    abi: erc20ABI,
    functionName: 'transfer',
    ...config,
  } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link erc20ABI}__ and `functionName` set to `"transferFrom"`.
 */
export function useErc20TransferFrom<
  TMode extends WriteContractMode = undefined,
>(
  config: TMode extends 'prepared'
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof erc20ABI,
          'transferFrom'
        >['request']['abi'],
        'transferFrom',
        TMode
      > & { functionName?: 'transferFrom' }
    : UseContractWriteConfig<typeof erc20ABI, 'transferFrom', TMode> & {
        abi?: never
        functionName?: 'transferFrom'
      } = {} as any,
) {
  return useContractWrite<typeof erc20ABI, 'transferFrom', TMode>({
    abi: erc20ABI,
    functionName: 'transferFrom',
    ...config,
  } as any)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link erc20ABI}__.
 */
export function usePrepareErc20Write<TFunctionName extends string>(
  config: Omit<
    UsePrepareContractWriteConfig<typeof erc20ABI, TFunctionName>,
    'abi'
  > = {} as any,
) {
  return usePrepareContractWrite({
    abi: erc20ABI,
    ...config,
  } as UsePrepareContractWriteConfig<typeof erc20ABI, TFunctionName>)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link erc20ABI}__ and `functionName` set to `"approve"`.
 */
export function usePrepareErc20Approve(
  config: Omit<
    UsePrepareContractWriteConfig<typeof erc20ABI, 'approve'>,
    'abi' | 'functionName'
  > = {} as any,
) {
  return usePrepareContractWrite({
    abi: erc20ABI,
    functionName: 'approve',
    ...config,
  } as UsePrepareContractWriteConfig<typeof erc20ABI, 'approve'>)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link erc20ABI}__ and `functionName` set to `"transfer"`.
 */
export function usePrepareErc20Transfer(
  config: Omit<
    UsePrepareContractWriteConfig<typeof erc20ABI, 'transfer'>,
    'abi' | 'functionName'
  > = {} as any,
) {
  return usePrepareContractWrite({
    abi: erc20ABI,
    functionName: 'transfer',
    ...config,
  } as UsePrepareContractWriteConfig<typeof erc20ABI, 'transfer'>)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link erc20ABI}__ and `functionName` set to `"transferFrom"`.
 */
export function usePrepareErc20TransferFrom(
  config: Omit<
    UsePrepareContractWriteConfig<typeof erc20ABI, 'transferFrom'>,
    'abi' | 'functionName'
  > = {} as any,
) {
  return usePrepareContractWrite({
    abi: erc20ABI,
    functionName: 'transferFrom',
    ...config,
  } as UsePrepareContractWriteConfig<typeof erc20ABI, 'transferFrom'>)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link erc20ABI}__.
 */
export function useErc20Event<TEventName extends string>(
  config: Omit<
    UseContractEventConfig<typeof erc20ABI, TEventName>,
    'abi'
  > = {} as any,
) {
  return useContractEvent({
    abi: erc20ABI,
    ...config,
  } as UseContractEventConfig<typeof erc20ABI, TEventName>)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link erc20ABI}__ and `eventName` set to `"Approval"`.
 */
export function useErc20ApprovalEvent(
  config: Omit<
    UseContractEventConfig<typeof erc20ABI, 'Approval'>,
    'abi' | 'eventName'
  > = {} as any,
) {
  return useContractEvent({
    abi: erc20ABI,
    eventName: 'Approval',
    ...config,
  } as UseContractEventConfig<typeof erc20ABI, 'Approval'>)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link erc20ABI}__ and `eventName` set to `"Transfer"`.
 */
export function useErc20TransferEvent(
  config: Omit<
    UseContractEventConfig<typeof erc20ABI, 'Transfer'>,
    'abi' | 'eventName'
  > = {} as any,
) {
  return useContractEvent({
    abi: erc20ABI,
    eventName: 'Transfer',
    ...config,
  } as UseContractEventConfig<typeof erc20ABI, 'Transfer'>)
}
