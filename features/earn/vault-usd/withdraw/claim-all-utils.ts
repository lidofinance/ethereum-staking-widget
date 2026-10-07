import { encodeFunctionData, type Address, type Hash } from 'viem';

import type { AACall } from 'modules/web3';
import type { AsyncRedeemQueueWritableContract } from 'modules/mellow-meta-vaults/types/contracts';
import type { UsdWithdrawTokenSymbol } from '../types';

export type ClaimCallOperation = {
  redeemQueue: Pick<AsyncRedeemQueueWritableContract, 'abi' | 'address'>;
  timestamps: number[];
};

export type UsdVaultWithdrawClaimAmount = {
  amount: bigint;
  token: UsdWithdrawTokenSymbol;
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

export type ClaimStatus =
  'not-started' | 'claimed' | 'submitted' | 'failed' | 'rejected';

export type TokenClaim = UsdVaultWithdrawClaimAmount & {
  status: ClaimStatus;
  txHash?: Hash;
};
