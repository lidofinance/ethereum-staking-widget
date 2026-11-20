import type { Address } from 'viem';

import { COLLECTOR_CONFIG } from '../consts';
import type {
  AsyncRedeemQueueContract,
  CollectorContract,
  DepositQueueContract,
  SyncDepositQueueContract,
  SyncRedeemQueueContract,
} from '../types/contracts';

export type DepositParams = {
  isDepositPossible: boolean;
  isDepositorWhitelisted: boolean;
  isMerkleProofRequired: boolean;
  asset: string; // address as hex string
  shares: bigint;
  sharesUSDC: bigint;
  assets: bigint;
  assetsUSDC: bigint;
  eta: bigint;
};

export type WithdrawParams = {
  assets: bigint; // e.g. wstETH or USDC amount to receive from redeeming the shares
};

/**
 * What a deposit or a withdrawal gives for what it takes: shares for assets
 * on a deposit, assets for shares on a withdrawal. The form displays one, the
 * transaction re-reads it right before sending and is held to it.
 */
export type VaultQuote = {
  // what the user puts in
  amountIn: bigint;
  // what the Collector says the user gets for it
  amountOut: bigint;
};

/**
 * Compares two quotes TX-time and UI-shown
 * Due to changes in blockchain state, the fresh quote may differ from the displayed one.
 * Returns true if the fresh quote is worse than the displayed one.
 */
export const isQuoteWorse = (fresh: VaultQuote, old: VaultQuote): boolean => {
  // old quote is not present or not actual, fail-open but just means users did not see a quote before
  if (old.amountIn === 0n || fresh.amountIn !== old.amountIn) return false;
  // if we shown quote for the same input amount, compare out directly
  if (fresh.amountIn === old.amountIn) return fresh.amountOut < old.amountOut;
  // comparing for different input amounts brings in complexity around precision esp for lower decimal tokens
  // generally it should be
  // return (fresh.amountOut + PRECISION_OFFSET) * old.amountIn <= (old.amountOut - PRECISION_OFFSET) * fresh.amountIn
  return false;
};

const PENALTY_DENOMINATOR = 1_000_000n;

/**
 * The amount the sync deposit queue prices once its `penaltyD6` is taken:
 * the queue mints at `priceD18 * (1e6 - penaltyD6) / 1e6`, which gives the
 * shares the full price gives for this amount.
 */
export const applySyncDepositPenalty = (amount: bigint, penaltyD6: bigint) =>
  (amount * (PENALTY_DENOMINATOR - penaltyD6)) / PENALTY_DENOMINATOR;

// the sync queue is the one with a penalty; its ABI is the only one with the getter
export const isSyncDepositQueue = (
  depositQueue: DepositQueueContract,
): depositQueue is SyncDepositQueueContract =>
  depositQueue.abi.some(
    (item) => item.type === 'function' && item.name === 'syncDepositParams',
  );

type ReadDepositQuoteArgs = {
  collector: CollectorContract;
  depositQueue: DepositQueueContract;
  amount: bigint;
  account: Address;
};

/**
 * The shares a deposit of `amount` into the queue mints, read from the chain.
 * The Collector prices at the oracle report alone, while the sync queue mints
 * at the report price less its current `penaltyD6`: for the sync queue the
 * Collector is asked for the penalised amount, which matches the mint to
 * within the rounding of the price (the queue) or of the amount (here). The
 * form, the pre-send check and every deposit path quote through this one
 * function, so they agree on the penalty.
 */
export const readDepositQuote = async ({
  collector,
  depositQueue,
  amount,
  account,
}: ReadDepositQuoteArgs): Promise<VaultQuote> => {
  const penaltyD6 = isSyncDepositQueue(depositQueue)
    ? (await depositQueue.read.syncDepositParams())[0]
    : 0n;
  const { shares } = (await collector.read.getDepositParams([
    depositQueue.address,
    applySyncDepositPenalty(amount, penaltyD6),
    account,
    COLLECTOR_CONFIG,
  ])) as DepositParams;
  return { amountIn: amount, amountOut: shares };
};

type ReadWithdrawQuoteArgs = {
  collector: CollectorContract;
  redeemQueue: AsyncRedeemQueueContract | SyncRedeemQueueContract;
  shares: bigint;
};

// the assets a redemption of `shares` through the queue pays, read from the chain
export const readWithdrawQuote = async ({
  collector,
  redeemQueue,
  shares,
}: ReadWithdrawQuoteArgs): Promise<VaultQuote> => {
  const { assets } = (await collector.read.getWithdrawalParams([
    shares,
    redeemQueue.address,
    COLLECTOR_CONFIG,
  ])) as WithdrawParams;
  return { amountIn: shares, amountOut: assets };
};
