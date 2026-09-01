import { encodeFunctionData, type Address } from 'viem';

import type { AACall } from 'modules/web3';
import type { AsyncRedeemQueueWritableContract } from 'modules/mellow-meta-vaults/types/contracts';
import { TOKENS, TOKEN_SYMBOLS } from 'consts/tokens';
import type { UsdWithdrawTokenSymbol } from '../types';
import type { UsdVaultWithdrawRequest } from './types';
import { groupUsdWithdrawRequestsByToken } from './utils';

type ClaimCallOperation = {
  redeemQueue: Pick<AsyncRedeemQueueWritableContract, 'abi' | 'address'>;
  timestamps: number[];
};

export type UsdVaultWithdrawClaimAmount = {
  amount: bigint;
  token: UsdWithdrawTokenSymbol;
};

export const getUsdVaultWithdrawClaimAmounts = (
  requests: UsdVaultWithdrawRequest[],
): UsdVaultWithdrawClaimAmount[] => {
  const groups = groupUsdWithdrawRequestsByToken(requests);

  return [TOKENS.usdc, TOKENS.usdt]
    .map((token) => ({
      token: TOKEN_SYMBOLS[token],
      amount: groups[token].reduce(
        (total, request) => total + request.assets,
        0n,
      ),
    }))
    .filter(({ amount }) => amount > 0n);
};

export const getUsdVaultWithdrawClaimCalls = (
  receiver: Address,
  operations: ClaimCallOperation[],
): AACall[] =>
  operations.map(({ redeemQueue, timestamps }) => ({
    to: redeemQueue.address,
    data: encodeFunctionData({
      abi: redeemQueue.abi,
      functionName: 'claim',
      args: [receiver, timestamps],
    }),
  }));
