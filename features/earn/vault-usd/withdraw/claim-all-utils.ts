import {
  encodeFunctionData,
  decodeEventLog,
  getAbiItem,
  type Address,
  type Hash,
  type Hex,
} from 'viem';
import { ASYNC_REDEEM_QUEUE_ABI } from 'modules/mellow-meta-vaults/abi';

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
  | 'not-started'
  | 'signing'
  | 'pending'
  | 'claimed'
  | 'failed'
  | 'rejected'
  | 'unknown';

export type ClaimResult = UsdVaultWithdrawClaimAmount & {
  status: ClaimStatus;
  txHash?: Hash;
};

// The part of a mined receipt this module reads. Satisfied both by a viem
// TransactionReceipt and by a wallet's EIP-5792 batch receipt.
export type ClaimReceipt = {
  status: 'success' | 'reverted';
  logs: { address: Address; data: Hex; topics: Hex[] }[];
};

const REDEEM_REQUEST_CLAIMED_ABI = [
  getAbiItem({ abi: ASYNC_REDEEM_QUEUE_ABI, name: 'RedeemRequestClaimed' }),
] as const;

// Match the queue, account, receiver AND every requested timestamp. Receipt
// ordering is not a reliable mapping between wallet calls and payout tokens.
export const hasClaimEvents = (
  logs: ClaimReceipt['logs'],
  queue: Address,
  account: Address,
  timestamps: number[],
) => {
  const events = logs.flatMap((log) => {
    if (log.address.toLowerCase() !== queue.toLowerCase()) return [];
    const [signature, ...topics] = log.topics;
    if (!signature) return [];
    try {
      const event = decodeEventLog({
        abi: REDEEM_REQUEST_CLAIMED_ABI,
        data: log.data,
        topics: [signature, ...topics],
      });
      return event.args.account.toLowerCase() === account.toLowerCase() &&
        event.args.receiver.toLowerCase() === account.toLowerCase()
        ? [event]
        : [];
    } catch {
      return [];
    }
  });
  return (
    timestamps.length > 0 &&
    timestamps.every((timestamp) =>
      events.some(({ args }) => args.timestamp === timestamp),
    )
  );
};

// A successful transaction alone does not prove the claim happened: it can be
// a cancellation that replaced ours, or a batch of unrelated calls. Require
// this queue's claim events, for this account and receiver, covering every
// requested timestamp.
export const isClaimedIn = (
  receipt: ClaimReceipt,
  operation: ClaimCallOperation,
  account: Address,
) =>
  receipt.status === 'success' &&
  hasClaimEvents(
    receipt.logs,
    operation.redeemQueue.address,
    account,
    operation.timestamps,
  );

// A reverted transaction leaves no claim events behind, so a failed call in a
// non-atomic batch has to be recognised by its destination and calldata.
export const isRevertedClaimOf = (
  call: { to: Address | null; input: Hex } | undefined,
  operation: ClaimCallOperation,
  account: Address,
) =>
  call?.to?.toLowerCase() === operation.redeemQueue.address.toLowerCase() &&
  call.input === getUsdVaultWithdrawClaimCalls(account, [operation])[0].data;
