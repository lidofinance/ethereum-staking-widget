import { keccak256, toBytes } from 'viem';
import type { Address } from 'viem';

import { COW_SETTLEMENT } from '../consts';
import type { CowQuoteResponse } from './types';

// EIP-712 domain for CoW Protocol settlement contract
export const getCowDomain = (chainId: number) =>
  ({
    name: 'Gnosis Protocol',
    version: 'v2',
    chainId,
    verifyingContract: COW_SETTLEMENT,
  }) as const;

// EIP-712 typed data structure for CoW Protocol orders
export const COW_ORDER_TYPES = {
  Order: [
    { name: 'sellToken', type: 'address' },
    { name: 'buyToken', type: 'address' },
    { name: 'receiver', type: 'address' },
    { name: 'sellAmount', type: 'uint256' },
    { name: 'buyAmount', type: 'uint256' },
    { name: 'validTo', type: 'uint32' },
    { name: 'appData', type: 'bytes32' },
    { name: 'feeAmount', type: 'uint256' },
    { name: 'kind', type: 'bytes32' },
    { name: 'partiallyFillable', type: 'bool' },
    { name: 'sellTokenBalance', type: 'bytes32' },
    { name: 'buyTokenBalance', type: 'bytes32' },
  ],
} as const;

// CoW Protocol encodes enum values as keccak256 hashes of their string names
export const ORDER_KIND = {
  sell: keccak256(toBytes('sell')),
  buy: keccak256(toBytes('buy')),
} as const;

export const BALANCE_ERC20 = keccak256(toBytes('erc20'));

// Build the EIP-712 message from a quote response
export const buildOrderMessage = (
  quote: CowQuoteResponse['quote'],
  receiver: Address,
) => ({
  sellToken: quote.sellToken as Address,
  buyToken: quote.buyToken as Address,
  receiver,
  sellAmount: BigInt(quote.sellAmount),
  buyAmount: BigInt(quote.buyAmount),
  validTo: quote.validTo,
  appData: quote.appData as `0x${string}`,
  feeAmount: BigInt(quote.feeAmount),
  kind: ORDER_KIND[quote.kind],
  partiallyFillable: false as const,
  sellTokenBalance: BALANCE_ERC20,
  buyTokenBalance: BALANCE_ERC20,
});
