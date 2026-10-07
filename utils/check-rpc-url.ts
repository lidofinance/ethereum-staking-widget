import {
  createPublicClient,
  http,
  Chain,
  encodeFunctionData,
  decodeFunctionResult,
} from 'viem';
import type { Address } from 'viem';
import {
  CHAINS,
  LIDO_L2_CONTRACT_ADDRESSES,
  LIDO_L2_CONTRACT_NAMES,
} from '@lidofinance/lido-ethereum-sdk/common';
import { getContractAddress } from 'config/networks/contract-address';

import { isUrl } from './is-url';

export enum RPCErrorType {
  URL_IS_NOT_VALID = 'URL_IS_NOT_VALID',
  URL_IS_NOT_WORKING = 'URL_IS_NOT_WORKING',
  NETWORK_DOES_NOT_MATCH = 'NETWORK_DOES_NOT_MATCH',
}

// For 'Get contract name'
const functionName = 'name';
const abi = [
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
];

/** stETH address on the chain: the contract `checkRpcUrl` reads to prove the RPC serves it */
export const getRpcCheckAddress = (chainId: CHAINS) =>
  getContractAddress(chainId, 'lido') ??
  LIDO_L2_CONTRACT_ADDRESSES[chainId]?.[LIDO_L2_CONTRACT_NAMES.steth];

export const checkRpcUrl = async (
  rpcUrl: string,
  chainId: CHAINS,
  stethAddress?: Address | string | null,
) => {
  if (!stethAddress) return RPCErrorType.URL_IS_NOT_VALID; // TODO: L2 case
  if (!isUrl(rpcUrl)) return RPCErrorType.URL_IS_NOT_VALID;

  try {
    const client = createPublicClient({
      // @ts-expect-error: typing, but enough for checing
      chain: {
        id: chainId,
        rpcUrls: [rpcUrl],
      } as Chain,
      transport: http(rpcUrl),
    });

    // Check chain ID
    const networkChainId = await client.getChainId();
    if (networkChainId !== chainId) {
      return RPCErrorType.NETWORK_DOES_NOT_MATCH;
    }

    // Get contract name
    const functionData = encodeFunctionData({
      abi,
      functionName,
    });

    const result = await client.call({
      to: stethAddress as Address,
      data: functionData,
    });

    // Should be 'Liquid staked Ether 2.0'
    decodeFunctionResult({
      abi,
      functionName,
      data: result.data as Address,
    });

    // All fine
    return true;
  } catch (err) {
    console.warn('err:', err);
    return RPCErrorType.URL_IS_NOT_WORKING;
  }
};
