import { encodePacked, hashTypedData, type Address, type Hex } from 'viem';
import { z } from 'zod';

import { standardFetcher } from 'utils/standardFetcher';

import {
  COWSWAP_API_NETWORKS,
  COWSWAP_API_TIMEOUT_MS,
  COWSWAP_ORDER_API,
} from '../../../consts';
import { TRANSACTION_ERROR } from '../consts';

import {
  CowSwapGPv2OrderSchema,
  CowSwapGetOrderResponseSchema,
} from './schemas';
import { type OrderData, type CancelOrderData } from './types';

export const hashCowswapOrder = (
  order: z.infer<typeof CowSwapGPv2OrderSchema>,
  chainId: number,
  cowSettler: Address,
): Hex => {
  const domain = {
    name: 'Gnosis Protocol',
    version: 'v2',
    chainId: chainId,
    verifyingContract: cowSettler,
  } as const;

  const types = {
    Order: [
      { name: 'sellToken', type: 'address' },
      { name: 'buyToken', type: 'address' },
      { name: 'receiver', type: 'address' },
      { name: 'sellAmount', type: 'uint256' },
      { name: 'buyAmount', type: 'uint256' },
      { name: 'validTo', type: 'uint32' },
      { name: 'appData', type: 'bytes32' },
      { name: 'feeAmount', type: 'uint256' },
      { name: 'kind', type: 'string' },
      { name: 'partiallyFillable', type: 'bool' },
      { name: 'sellTokenBalance', type: 'string' },
      { name: 'buyTokenBalance', type: 'string' },
    ],
  } as const;

  return hashTypedData({
    domain,
    types,
    primaryType: 'Order',
    message: order,
  });
};

export const calculateOrderUID = (
  orderHash: Hex,
  signer: Address,
  validTo: number,
): Hex => {
  // We use encodePacked to mimic Solidity's abi.encodePacked logic
  // which is how the UID is constructed in the CowSwap ecosystem.
  return encodePacked(
    ['bytes32', 'address', 'uint32'],
    [orderHash, signer, validTo],
  );
};

export const isCancelOrder = (
  order: OrderData | CancelOrderData,
): order is CancelOrderData => {
  return 'isCancel' in order && order.isCancel;
};

export const fetchOrderByUID = async (orderUID: Hex, chainId: number) => {
  const environment = COWSWAP_API_NETWORKS[chainId];
  if (!environment) throw new Error(TRANSACTION_ERROR(2001));
  const result = await standardFetcher(
    COWSWAP_ORDER_API(orderUID, environment),
    { timeoutMs: COWSWAP_API_TIMEOUT_MS },
  );

  return CowSwapGetOrderResponseSchema.parse(result);
};
