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
] as const;

/**
 * Lido token contract `checkRpcUrl` reads to prove the RPC serves the chain:
 * stETH where it is deployed, otherwise the bridged wstETH (Base, Linea,
 * Arbitrum carry no stETH)
 */
export const getRpcCheckAddress = (chainId: CHAINS) =>
  getContractAddress(chainId, 'lido') ??
  LIDO_L2_CONTRACT_ADDRESSES[chainId]?.[LIDO_L2_CONTRACT_NAMES.steth] ??
  LIDO_L2_CONTRACT_ADDRESSES[chainId]?.[LIDO_L2_CONTRACT_NAMES.wsteth];

export const checkRpcUrl = async (
  rpcUrl: string,
  chainId: CHAINS,
  tokenAddress?: Address | string | null,
) => {
  if (!tokenAddress) return RPCErrorType.URL_IS_NOT_VALID;
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
      to: tokenAddress as Address,
      data: functionData,
    });

    // 'Liquid staked Ether 2.0' or 'Wrapped liquid staked Ether 2.0'
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
