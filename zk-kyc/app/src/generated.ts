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
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x28C7dDC12b3F7b81D2a4C73eC06d1d8C1a78B24e)
 */
export const zidABI = [
  {
    stateMutability: 'nonpayable',
    type: 'constructor',
    inputs: [
      {
        name: 'initVerifier',
        internalType: 'contract IRiscZeroVerifier',
        type: 'address',
      },
      { name: 'initImgId', internalType: 'bytes32', type: 'bytes32' },
    ],
  },
  {
    type: 'error',
    inputs: [
      {
        name: 'proof',
        internalType: 'struct Types.Proof',
        type: 'tuple',
        components: [
          { name: 'seal', internalType: 'bytes', type: 'bytes' },
          { name: 'postStateDigest', internalType: 'bytes32', type: 'bytes32' },
          { name: 'journal', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    name: 'InvalidProof',
  },
  { type: 'error', inputs: [], name: 'NotProofOwner' },
  {
    type: 'error',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'id', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'NotTokenOwner',
  },
  { type: 'error', inputs: [], name: 'TokenAlreadyMinted' },
  {
    type: 'error',
    inputs: [{ name: 'id', internalType: 'uint256', type: 'uint256' }],
    name: 'TokenNotFound',
  },
  { type: 'error', inputs: [], name: 'TokenNotTransferable' },
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
        name: '_fromTokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: '_toTokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'BatchMetadataUpdate',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'id', internalType: 'uint256', type: 'uint256', indexed: true },
      {
        name: 'burner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'Burned',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: '_tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'MetadataUpdate',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'id', internalType: 'uint256', type: 'uint256', indexed: true },
      {
        name: 'minter',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'tokenURI',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
    ],
    name: 'Minted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Paused',
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
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Unpaused',
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
    inputs: [],
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
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'getProof',
    outputs: [
      {
        name: '',
        internalType: 'struct Types.Proof',
        type: 'tuple',
        components: [
          { name: 'seal', internalType: 'bytes', type: 'bytes' },
          { name: 'postStateDigest', internalType: 'bytes32', type: 'bytes32' },
          { name: 'journal', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
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
      { name: 'data', internalType: 'bytes', type: 'bytes' },
      { name: 'tokenURI', internalType: 'string', type: 'string' },
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
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
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
    inputs: [],
    name: 'pause',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'paused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
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
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'newImageId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'setImageId',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      {
        name: 'newVerifier',
        internalType: 'contract IRiscZeroVerifier',
        type: 'address',
      },
    ],
    name: 'setVerifier',
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
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [],
    name: 'unpause',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'data', internalType: 'bytes', type: 'bytes' }],
    name: 'updateProof',
    outputs: [],
  },
] as const

/**
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x28C7dDC12b3F7b81D2a4C73eC06d1d8C1a78B24e)
 */
export const zidAddress = {
  5: '0x28C7dDC12b3F7b81D2a4C73eC06d1d8C1a78B24e',
} as const

/**
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x28C7dDC12b3F7b81D2a4C73eC06d1d8C1a78B24e)
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
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x28C7dDC12b3F7b81D2a4C73eC06d1d8C1a78B24e)
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
    address: zidAddress[5],
    ...config,
  } as UseContractReadConfig<typeof zidABI, TFunctionName, TSelectData>)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link zidABI}__ and `functionName` set to `"balanceOf"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x28C7dDC12b3F7b81D2a4C73eC06d1d8C1a78B24e)
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
    address: zidAddress[5],
    functionName: 'balanceOf',
    ...config,
  } as UseContractReadConfig<typeof zidABI, TFunctionName, TSelectData>)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link zidABI}__ and `functionName` set to `"getApproved"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x28C7dDC12b3F7b81D2a4C73eC06d1d8C1a78B24e)
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
    address: zidAddress[5],
    functionName: 'getApproved',
    ...config,
  } as UseContractReadConfig<typeof zidABI, TFunctionName, TSelectData>)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link zidABI}__ and `functionName` set to `"getProof"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x28C7dDC12b3F7b81D2a4C73eC06d1d8C1a78B24e)
 */
export function useZidGetProof<
  TFunctionName extends 'getProof',
  TSelectData = ReadContractResult<typeof zidABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof zidABI, TFunctionName, TSelectData>,
    'abi' | 'address' | 'functionName'
  > & { chainId?: keyof typeof zidAddress } = {} as any,
) {
  return useContractRead({
    abi: zidABI,
    address: zidAddress[5],
    functionName: 'getProof',
    ...config,
  } as UseContractReadConfig<typeof zidABI, TFunctionName, TSelectData>)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link zidABI}__ and `functionName` set to `"imageId"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x28C7dDC12b3F7b81D2a4C73eC06d1d8C1a78B24e)
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
    address: zidAddress[5],
    functionName: 'imageId',
    ...config,
  } as UseContractReadConfig<typeof zidABI, TFunctionName, TSelectData>)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link zidABI}__ and `functionName` set to `"isApprovedForAll"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x28C7dDC12b3F7b81D2a4C73eC06d1d8C1a78B24e)
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
    address: zidAddress[5],
    functionName: 'isApprovedForAll',
    ...config,
  } as UseContractReadConfig<typeof zidABI, TFunctionName, TSelectData>)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link zidABI}__ and `functionName` set to `"name"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x28C7dDC12b3F7b81D2a4C73eC06d1d8C1a78B24e)
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
    address: zidAddress[5],
    functionName: 'name',
    ...config,
  } as UseContractReadConfig<typeof zidABI, TFunctionName, TSelectData>)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link zidABI}__ and `functionName` set to `"owner"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x28C7dDC12b3F7b81D2a4C73eC06d1d8C1a78B24e)
 */
export function useZidOwner<
  TFunctionName extends 'owner',
  TSelectData = ReadContractResult<typeof zidABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof zidABI, TFunctionName, TSelectData>,
    'abi' | 'address' | 'functionName'
  > & { chainId?: keyof typeof zidAddress } = {} as any,
) {
  return useContractRead({
    abi: zidABI,
    address: zidAddress[5],
    functionName: 'owner',
    ...config,
  } as UseContractReadConfig<typeof zidABI, TFunctionName, TSelectData>)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link zidABI}__ and `functionName` set to `"ownerOf"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x28C7dDC12b3F7b81D2a4C73eC06d1d8C1a78B24e)
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
    address: zidAddress[5],
    functionName: 'ownerOf',
    ...config,
  } as UseContractReadConfig<typeof zidABI, TFunctionName, TSelectData>)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link zidABI}__ and `functionName` set to `"paused"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x28C7dDC12b3F7b81D2a4C73eC06d1d8C1a78B24e)
 */
export function useZidPaused<
  TFunctionName extends 'paused',
  TSelectData = ReadContractResult<typeof zidABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof zidABI, TFunctionName, TSelectData>,
    'abi' | 'address' | 'functionName'
  > & { chainId?: keyof typeof zidAddress } = {} as any,
) {
  return useContractRead({
    abi: zidABI,
    address: zidAddress[5],
    functionName: 'paused',
    ...config,
  } as UseContractReadConfig<typeof zidABI, TFunctionName, TSelectData>)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link zidABI}__ and `functionName` set to `"supportsInterface"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x28C7dDC12b3F7b81D2a4C73eC06d1d8C1a78B24e)
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
    address: zidAddress[5],
    functionName: 'supportsInterface',
    ...config,
  } as UseContractReadConfig<typeof zidABI, TFunctionName, TSelectData>)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link zidABI}__ and `functionName` set to `"symbol"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x28C7dDC12b3F7b81D2a4C73eC06d1d8C1a78B24e)
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
    address: zidAddress[5],
    functionName: 'symbol',
    ...config,
  } as UseContractReadConfig<typeof zidABI, TFunctionName, TSelectData>)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link zidABI}__ and `functionName` set to `"tokenURI"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x28C7dDC12b3F7b81D2a4C73eC06d1d8C1a78B24e)
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
    address: zidAddress[5],
    functionName: 'tokenURI',
    ...config,
  } as UseContractReadConfig<typeof zidABI, TFunctionName, TSelectData>)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link zidABI}__.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x28C7dDC12b3F7b81D2a4C73eC06d1d8C1a78B24e)
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
    address: zidAddress[5],
    ...config,
  } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link zidABI}__ and `functionName` set to `"approve"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x28C7dDC12b3F7b81D2a4C73eC06d1d8C1a78B24e)
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
    address: zidAddress[5],
    functionName: 'approve',
    ...config,
  } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link zidABI}__ and `functionName` set to `"burn"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x28C7dDC12b3F7b81D2a4C73eC06d1d8C1a78B24e)
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
    address: zidAddress[5],
    functionName: 'burn',
    ...config,
  } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link zidABI}__ and `functionName` set to `"mint"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x28C7dDC12b3F7b81D2a4C73eC06d1d8C1a78B24e)
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
    address: zidAddress[5],
    functionName: 'mint',
    ...config,
  } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link zidABI}__ and `functionName` set to `"pause"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x28C7dDC12b3F7b81D2a4C73eC06d1d8C1a78B24e)
 */
export function useZidPause<
  TMode extends WriteContractMode = undefined,
  TChainId extends number = keyof typeof zidAddress,
>(
  config: TMode extends 'prepared'
    ? UseContractWriteConfig<
        PrepareWriteContractResult<typeof zidABI, 'pause'>['request']['abi'],
        'pause',
        TMode
      > & { address?: Address; chainId?: TChainId; functionName?: 'pause' }
    : UseContractWriteConfig<typeof zidABI, 'pause', TMode> & {
        abi?: never
        address?: never
        chainId?: TChainId
        functionName?: 'pause'
      } = {} as any,
) {
  return useContractWrite<typeof zidABI, 'pause', TMode>({
    abi: zidABI,
    address: zidAddress[5],
    functionName: 'pause',
    ...config,
  } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link zidABI}__ and `functionName` set to `"renounceOwnership"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x28C7dDC12b3F7b81D2a4C73eC06d1d8C1a78B24e)
 */
export function useZidRenounceOwnership<
  TMode extends WriteContractMode = undefined,
  TChainId extends number = keyof typeof zidAddress,
>(
  config: TMode extends 'prepared'
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof zidABI,
          'renounceOwnership'
        >['request']['abi'],
        'renounceOwnership',
        TMode
      > & {
        address?: Address
        chainId?: TChainId
        functionName?: 'renounceOwnership'
      }
    : UseContractWriteConfig<typeof zidABI, 'renounceOwnership', TMode> & {
        abi?: never
        address?: never
        chainId?: TChainId
        functionName?: 'renounceOwnership'
      } = {} as any,
) {
  return useContractWrite<typeof zidABI, 'renounceOwnership', TMode>({
    abi: zidABI,
    address: zidAddress[5],
    functionName: 'renounceOwnership',
    ...config,
  } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link zidABI}__ and `functionName` set to `"safeTransferFrom"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x28C7dDC12b3F7b81D2a4C73eC06d1d8C1a78B24e)
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
    address: zidAddress[5],
    functionName: 'safeTransferFrom',
    ...config,
  } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link zidABI}__ and `functionName` set to `"setApprovalForAll"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x28C7dDC12b3F7b81D2a4C73eC06d1d8C1a78B24e)
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
    address: zidAddress[5],
    functionName: 'setApprovalForAll',
    ...config,
  } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link zidABI}__ and `functionName` set to `"setImageId"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x28C7dDC12b3F7b81D2a4C73eC06d1d8C1a78B24e)
 */
export function useZidSetImageId<
  TMode extends WriteContractMode = undefined,
  TChainId extends number = keyof typeof zidAddress,
>(
  config: TMode extends 'prepared'
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof zidABI,
          'setImageId'
        >['request']['abi'],
        'setImageId',
        TMode
      > & { address?: Address; chainId?: TChainId; functionName?: 'setImageId' }
    : UseContractWriteConfig<typeof zidABI, 'setImageId', TMode> & {
        abi?: never
        address?: never
        chainId?: TChainId
        functionName?: 'setImageId'
      } = {} as any,
) {
  return useContractWrite<typeof zidABI, 'setImageId', TMode>({
    abi: zidABI,
    address: zidAddress[5],
    functionName: 'setImageId',
    ...config,
  } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link zidABI}__ and `functionName` set to `"setVerifier"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x28C7dDC12b3F7b81D2a4C73eC06d1d8C1a78B24e)
 */
export function useZidSetVerifier<
  TMode extends WriteContractMode = undefined,
  TChainId extends number = keyof typeof zidAddress,
>(
  config: TMode extends 'prepared'
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof zidABI,
          'setVerifier'
        >['request']['abi'],
        'setVerifier',
        TMode
      > & {
        address?: Address
        chainId?: TChainId
        functionName?: 'setVerifier'
      }
    : UseContractWriteConfig<typeof zidABI, 'setVerifier', TMode> & {
        abi?: never
        address?: never
        chainId?: TChainId
        functionName?: 'setVerifier'
      } = {} as any,
) {
  return useContractWrite<typeof zidABI, 'setVerifier', TMode>({
    abi: zidABI,
    address: zidAddress[5],
    functionName: 'setVerifier',
    ...config,
  } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link zidABI}__ and `functionName` set to `"transferFrom"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x28C7dDC12b3F7b81D2a4C73eC06d1d8C1a78B24e)
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
    address: zidAddress[5],
    functionName: 'transferFrom',
    ...config,
  } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link zidABI}__ and `functionName` set to `"transferOwnership"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x28C7dDC12b3F7b81D2a4C73eC06d1d8C1a78B24e)
 */
export function useZidTransferOwnership<
  TMode extends WriteContractMode = undefined,
  TChainId extends number = keyof typeof zidAddress,
>(
  config: TMode extends 'prepared'
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof zidABI,
          'transferOwnership'
        >['request']['abi'],
        'transferOwnership',
        TMode
      > & {
        address?: Address
        chainId?: TChainId
        functionName?: 'transferOwnership'
      }
    : UseContractWriteConfig<typeof zidABI, 'transferOwnership', TMode> & {
        abi?: never
        address?: never
        chainId?: TChainId
        functionName?: 'transferOwnership'
      } = {} as any,
) {
  return useContractWrite<typeof zidABI, 'transferOwnership', TMode>({
    abi: zidABI,
    address: zidAddress[5],
    functionName: 'transferOwnership',
    ...config,
  } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link zidABI}__ and `functionName` set to `"unpause"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x28C7dDC12b3F7b81D2a4C73eC06d1d8C1a78B24e)
 */
export function useZidUnpause<
  TMode extends WriteContractMode = undefined,
  TChainId extends number = keyof typeof zidAddress,
>(
  config: TMode extends 'prepared'
    ? UseContractWriteConfig<
        PrepareWriteContractResult<typeof zidABI, 'unpause'>['request']['abi'],
        'unpause',
        TMode
      > & { address?: Address; chainId?: TChainId; functionName?: 'unpause' }
    : UseContractWriteConfig<typeof zidABI, 'unpause', TMode> & {
        abi?: never
        address?: never
        chainId?: TChainId
        functionName?: 'unpause'
      } = {} as any,
) {
  return useContractWrite<typeof zidABI, 'unpause', TMode>({
    abi: zidABI,
    address: zidAddress[5],
    functionName: 'unpause',
    ...config,
  } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link zidABI}__ and `functionName` set to `"updateProof"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x28C7dDC12b3F7b81D2a4C73eC06d1d8C1a78B24e)
 */
export function useZidUpdateProof<
  TMode extends WriteContractMode = undefined,
  TChainId extends number = keyof typeof zidAddress,
>(
  config: TMode extends 'prepared'
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof zidABI,
          'updateProof'
        >['request']['abi'],
        'updateProof',
        TMode
      > & {
        address?: Address
        chainId?: TChainId
        functionName?: 'updateProof'
      }
    : UseContractWriteConfig<typeof zidABI, 'updateProof', TMode> & {
        abi?: never
        address?: never
        chainId?: TChainId
        functionName?: 'updateProof'
      } = {} as any,
) {
  return useContractWrite<typeof zidABI, 'updateProof', TMode>({
    abi: zidABI,
    address: zidAddress[5],
    functionName: 'updateProof',
    ...config,
  } as any)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link zidABI}__.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x28C7dDC12b3F7b81D2a4C73eC06d1d8C1a78B24e)
 */
export function usePrepareZidWrite<TFunctionName extends string>(
  config: Omit<
    UsePrepareContractWriteConfig<typeof zidABI, TFunctionName>,
    'abi' | 'address'
  > & { chainId?: keyof typeof zidAddress } = {} as any,
) {
  return usePrepareContractWrite({
    abi: zidABI,
    address: zidAddress[5],
    ...config,
  } as UsePrepareContractWriteConfig<typeof zidABI, TFunctionName>)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link zidABI}__ and `functionName` set to `"approve"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x28C7dDC12b3F7b81D2a4C73eC06d1d8C1a78B24e)
 */
export function usePrepareZidApprove(
  config: Omit<
    UsePrepareContractWriteConfig<typeof zidABI, 'approve'>,
    'abi' | 'address' | 'functionName'
  > & { chainId?: keyof typeof zidAddress } = {} as any,
) {
  return usePrepareContractWrite({
    abi: zidABI,
    address: zidAddress[5],
    functionName: 'approve',
    ...config,
  } as UsePrepareContractWriteConfig<typeof zidABI, 'approve'>)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link zidABI}__ and `functionName` set to `"burn"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x28C7dDC12b3F7b81D2a4C73eC06d1d8C1a78B24e)
 */
export function usePrepareZidBurn(
  config: Omit<
    UsePrepareContractWriteConfig<typeof zidABI, 'burn'>,
    'abi' | 'address' | 'functionName'
  > & { chainId?: keyof typeof zidAddress } = {} as any,
) {
  return usePrepareContractWrite({
    abi: zidABI,
    address: zidAddress[5],
    functionName: 'burn',
    ...config,
  } as UsePrepareContractWriteConfig<typeof zidABI, 'burn'>)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link zidABI}__ and `functionName` set to `"mint"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x28C7dDC12b3F7b81D2a4C73eC06d1d8C1a78B24e)
 */
export function usePrepareZidMint(
  config: Omit<
    UsePrepareContractWriteConfig<typeof zidABI, 'mint'>,
    'abi' | 'address' | 'functionName'
  > & { chainId?: keyof typeof zidAddress } = {} as any,
) {
  return usePrepareContractWrite({
    abi: zidABI,
    address: zidAddress[5],
    functionName: 'mint',
    ...config,
  } as UsePrepareContractWriteConfig<typeof zidABI, 'mint'>)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link zidABI}__ and `functionName` set to `"pause"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x28C7dDC12b3F7b81D2a4C73eC06d1d8C1a78B24e)
 */
export function usePrepareZidPause(
  config: Omit<
    UsePrepareContractWriteConfig<typeof zidABI, 'pause'>,
    'abi' | 'address' | 'functionName'
  > & { chainId?: keyof typeof zidAddress } = {} as any,
) {
  return usePrepareContractWrite({
    abi: zidABI,
    address: zidAddress[5],
    functionName: 'pause',
    ...config,
  } as UsePrepareContractWriteConfig<typeof zidABI, 'pause'>)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link zidABI}__ and `functionName` set to `"renounceOwnership"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x28C7dDC12b3F7b81D2a4C73eC06d1d8C1a78B24e)
 */
export function usePrepareZidRenounceOwnership(
  config: Omit<
    UsePrepareContractWriteConfig<typeof zidABI, 'renounceOwnership'>,
    'abi' | 'address' | 'functionName'
  > & { chainId?: keyof typeof zidAddress } = {} as any,
) {
  return usePrepareContractWrite({
    abi: zidABI,
    address: zidAddress[5],
    functionName: 'renounceOwnership',
    ...config,
  } as UsePrepareContractWriteConfig<typeof zidABI, 'renounceOwnership'>)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link zidABI}__ and `functionName` set to `"safeTransferFrom"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x28C7dDC12b3F7b81D2a4C73eC06d1d8C1a78B24e)
 */
export function usePrepareZidSafeTransferFrom(
  config: Omit<
    UsePrepareContractWriteConfig<typeof zidABI, 'safeTransferFrom'>,
    'abi' | 'address' | 'functionName'
  > & { chainId?: keyof typeof zidAddress } = {} as any,
) {
  return usePrepareContractWrite({
    abi: zidABI,
    address: zidAddress[5],
    functionName: 'safeTransferFrom',
    ...config,
  } as UsePrepareContractWriteConfig<typeof zidABI, 'safeTransferFrom'>)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link zidABI}__ and `functionName` set to `"setApprovalForAll"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x28C7dDC12b3F7b81D2a4C73eC06d1d8C1a78B24e)
 */
export function usePrepareZidSetApprovalForAll(
  config: Omit<
    UsePrepareContractWriteConfig<typeof zidABI, 'setApprovalForAll'>,
    'abi' | 'address' | 'functionName'
  > & { chainId?: keyof typeof zidAddress } = {} as any,
) {
  return usePrepareContractWrite({
    abi: zidABI,
    address: zidAddress[5],
    functionName: 'setApprovalForAll',
    ...config,
  } as UsePrepareContractWriteConfig<typeof zidABI, 'setApprovalForAll'>)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link zidABI}__ and `functionName` set to `"setImageId"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x28C7dDC12b3F7b81D2a4C73eC06d1d8C1a78B24e)
 */
export function usePrepareZidSetImageId(
  config: Omit<
    UsePrepareContractWriteConfig<typeof zidABI, 'setImageId'>,
    'abi' | 'address' | 'functionName'
  > & { chainId?: keyof typeof zidAddress } = {} as any,
) {
  return usePrepareContractWrite({
    abi: zidABI,
    address: zidAddress[5],
    functionName: 'setImageId',
    ...config,
  } as UsePrepareContractWriteConfig<typeof zidABI, 'setImageId'>)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link zidABI}__ and `functionName` set to `"setVerifier"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x28C7dDC12b3F7b81D2a4C73eC06d1d8C1a78B24e)
 */
export function usePrepareZidSetVerifier(
  config: Omit<
    UsePrepareContractWriteConfig<typeof zidABI, 'setVerifier'>,
    'abi' | 'address' | 'functionName'
  > & { chainId?: keyof typeof zidAddress } = {} as any,
) {
  return usePrepareContractWrite({
    abi: zidABI,
    address: zidAddress[5],
    functionName: 'setVerifier',
    ...config,
  } as UsePrepareContractWriteConfig<typeof zidABI, 'setVerifier'>)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link zidABI}__ and `functionName` set to `"transferFrom"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x28C7dDC12b3F7b81D2a4C73eC06d1d8C1a78B24e)
 */
export function usePrepareZidTransferFrom(
  config: Omit<
    UsePrepareContractWriteConfig<typeof zidABI, 'transferFrom'>,
    'abi' | 'address' | 'functionName'
  > & { chainId?: keyof typeof zidAddress } = {} as any,
) {
  return usePrepareContractWrite({
    abi: zidABI,
    address: zidAddress[5],
    functionName: 'transferFrom',
    ...config,
  } as UsePrepareContractWriteConfig<typeof zidABI, 'transferFrom'>)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link zidABI}__ and `functionName` set to `"transferOwnership"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x28C7dDC12b3F7b81D2a4C73eC06d1d8C1a78B24e)
 */
export function usePrepareZidTransferOwnership(
  config: Omit<
    UsePrepareContractWriteConfig<typeof zidABI, 'transferOwnership'>,
    'abi' | 'address' | 'functionName'
  > & { chainId?: keyof typeof zidAddress } = {} as any,
) {
  return usePrepareContractWrite({
    abi: zidABI,
    address: zidAddress[5],
    functionName: 'transferOwnership',
    ...config,
  } as UsePrepareContractWriteConfig<typeof zidABI, 'transferOwnership'>)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link zidABI}__ and `functionName` set to `"unpause"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x28C7dDC12b3F7b81D2a4C73eC06d1d8C1a78B24e)
 */
export function usePrepareZidUnpause(
  config: Omit<
    UsePrepareContractWriteConfig<typeof zidABI, 'unpause'>,
    'abi' | 'address' | 'functionName'
  > & { chainId?: keyof typeof zidAddress } = {} as any,
) {
  return usePrepareContractWrite({
    abi: zidABI,
    address: zidAddress[5],
    functionName: 'unpause',
    ...config,
  } as UsePrepareContractWriteConfig<typeof zidABI, 'unpause'>)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link zidABI}__ and `functionName` set to `"updateProof"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x28C7dDC12b3F7b81D2a4C73eC06d1d8C1a78B24e)
 */
export function usePrepareZidUpdateProof(
  config: Omit<
    UsePrepareContractWriteConfig<typeof zidABI, 'updateProof'>,
    'abi' | 'address' | 'functionName'
  > & { chainId?: keyof typeof zidAddress } = {} as any,
) {
  return usePrepareContractWrite({
    abi: zidABI,
    address: zidAddress[5],
    functionName: 'updateProof',
    ...config,
  } as UsePrepareContractWriteConfig<typeof zidABI, 'updateProof'>)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link zidABI}__.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x28C7dDC12b3F7b81D2a4C73eC06d1d8C1a78B24e)
 */
export function useZidEvent<TEventName extends string>(
  config: Omit<
    UseContractEventConfig<typeof zidABI, TEventName>,
    'abi' | 'address'
  > & { chainId?: keyof typeof zidAddress } = {} as any,
) {
  return useContractEvent({
    abi: zidABI,
    address: zidAddress[5],
    ...config,
  } as UseContractEventConfig<typeof zidABI, TEventName>)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link zidABI}__ and `eventName` set to `"Approval"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x28C7dDC12b3F7b81D2a4C73eC06d1d8C1a78B24e)
 */
export function useZidApprovalEvent(
  config: Omit<
    UseContractEventConfig<typeof zidABI, 'Approval'>,
    'abi' | 'address' | 'eventName'
  > & { chainId?: keyof typeof zidAddress } = {} as any,
) {
  return useContractEvent({
    abi: zidABI,
    address: zidAddress[5],
    eventName: 'Approval',
    ...config,
  } as UseContractEventConfig<typeof zidABI, 'Approval'>)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link zidABI}__ and `eventName` set to `"ApprovalForAll"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x28C7dDC12b3F7b81D2a4C73eC06d1d8C1a78B24e)
 */
export function useZidApprovalForAllEvent(
  config: Omit<
    UseContractEventConfig<typeof zidABI, 'ApprovalForAll'>,
    'abi' | 'address' | 'eventName'
  > & { chainId?: keyof typeof zidAddress } = {} as any,
) {
  return useContractEvent({
    abi: zidABI,
    address: zidAddress[5],
    eventName: 'ApprovalForAll',
    ...config,
  } as UseContractEventConfig<typeof zidABI, 'ApprovalForAll'>)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link zidABI}__ and `eventName` set to `"BatchMetadataUpdate"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x28C7dDC12b3F7b81D2a4C73eC06d1d8C1a78B24e)
 */
export function useZidBatchMetadataUpdateEvent(
  config: Omit<
    UseContractEventConfig<typeof zidABI, 'BatchMetadataUpdate'>,
    'abi' | 'address' | 'eventName'
  > & { chainId?: keyof typeof zidAddress } = {} as any,
) {
  return useContractEvent({
    abi: zidABI,
    address: zidAddress[5],
    eventName: 'BatchMetadataUpdate',
    ...config,
  } as UseContractEventConfig<typeof zidABI, 'BatchMetadataUpdate'>)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link zidABI}__ and `eventName` set to `"Burned"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x28C7dDC12b3F7b81D2a4C73eC06d1d8C1a78B24e)
 */
export function useZidBurnedEvent(
  config: Omit<
    UseContractEventConfig<typeof zidABI, 'Burned'>,
    'abi' | 'address' | 'eventName'
  > & { chainId?: keyof typeof zidAddress } = {} as any,
) {
  return useContractEvent({
    abi: zidABI,
    address: zidAddress[5],
    eventName: 'Burned',
    ...config,
  } as UseContractEventConfig<typeof zidABI, 'Burned'>)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link zidABI}__ and `eventName` set to `"MetadataUpdate"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x28C7dDC12b3F7b81D2a4C73eC06d1d8C1a78B24e)
 */
export function useZidMetadataUpdateEvent(
  config: Omit<
    UseContractEventConfig<typeof zidABI, 'MetadataUpdate'>,
    'abi' | 'address' | 'eventName'
  > & { chainId?: keyof typeof zidAddress } = {} as any,
) {
  return useContractEvent({
    abi: zidABI,
    address: zidAddress[5],
    eventName: 'MetadataUpdate',
    ...config,
  } as UseContractEventConfig<typeof zidABI, 'MetadataUpdate'>)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link zidABI}__ and `eventName` set to `"Minted"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x28C7dDC12b3F7b81D2a4C73eC06d1d8C1a78B24e)
 */
export function useZidMintedEvent(
  config: Omit<
    UseContractEventConfig<typeof zidABI, 'Minted'>,
    'abi' | 'address' | 'eventName'
  > & { chainId?: keyof typeof zidAddress } = {} as any,
) {
  return useContractEvent({
    abi: zidABI,
    address: zidAddress[5],
    eventName: 'Minted',
    ...config,
  } as UseContractEventConfig<typeof zidABI, 'Minted'>)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link zidABI}__ and `eventName` set to `"OwnershipTransferred"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x28C7dDC12b3F7b81D2a4C73eC06d1d8C1a78B24e)
 */
export function useZidOwnershipTransferredEvent(
  config: Omit<
    UseContractEventConfig<typeof zidABI, 'OwnershipTransferred'>,
    'abi' | 'address' | 'eventName'
  > & { chainId?: keyof typeof zidAddress } = {} as any,
) {
  return useContractEvent({
    abi: zidABI,
    address: zidAddress[5],
    eventName: 'OwnershipTransferred',
    ...config,
  } as UseContractEventConfig<typeof zidABI, 'OwnershipTransferred'>)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link zidABI}__ and `eventName` set to `"Paused"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x28C7dDC12b3F7b81D2a4C73eC06d1d8C1a78B24e)
 */
export function useZidPausedEvent(
  config: Omit<
    UseContractEventConfig<typeof zidABI, 'Paused'>,
    'abi' | 'address' | 'eventName'
  > & { chainId?: keyof typeof zidAddress } = {} as any,
) {
  return useContractEvent({
    abi: zidABI,
    address: zidAddress[5],
    eventName: 'Paused',
    ...config,
  } as UseContractEventConfig<typeof zidABI, 'Paused'>)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link zidABI}__ and `eventName` set to `"Transfer"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x28C7dDC12b3F7b81D2a4C73eC06d1d8C1a78B24e)
 */
export function useZidTransferEvent(
  config: Omit<
    UseContractEventConfig<typeof zidABI, 'Transfer'>,
    'abi' | 'address' | 'eventName'
  > & { chainId?: keyof typeof zidAddress } = {} as any,
) {
  return useContractEvent({
    abi: zidABI,
    address: zidAddress[5],
    eventName: 'Transfer',
    ...config,
  } as UseContractEventConfig<typeof zidABI, 'Transfer'>)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link zidABI}__ and `eventName` set to `"Unpaused"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x28C7dDC12b3F7b81D2a4C73eC06d1d8C1a78B24e)
 */
export function useZidUnpausedEvent(
  config: Omit<
    UseContractEventConfig<typeof zidABI, 'Unpaused'>,
    'abi' | 'address' | 'eventName'
  > & { chainId?: keyof typeof zidAddress } = {} as any,
) {
  return useContractEvent({
    abi: zidABI,
    address: zidAddress[5],
    eventName: 'Unpaused',
    ...config,
  } as UseContractEventConfig<typeof zidABI, 'Unpaused'>)
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
