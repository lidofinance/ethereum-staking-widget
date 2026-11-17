import type { Address } from 'viem';

import { COLLECTOR_CONFIG } from '../consts';
import type {
  AsyncRedeemQueueContract,
  CollectorContract,
  DepositQueueContract,
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
  amount: bigint;
  // what the Collector says the user gets for it
  output: bigint;
};

/**
 * The fresh quote gives less per unit than the displayed one. Compared as
 * rates, so a quote displayed for a slightly different amount (the preview
 * is debounced) is still held to its rate. A displayed zero amount means
 * nothing was displayed and never stops the transaction.
 */
export const isQuoteWorse = (fresh: VaultQuote, shown: VaultQuote) =>
  fresh.output * shown.amount < shown.output * fresh.amount;

type ReadDepositQuoteArgs = {
  collector: CollectorContract;
  depositQueue: DepositQueueContract;
  amount: bigint;
  account: Address;
};

// the shares a deposit of `amount` into the queue mints, read from the chain
export const readDepositQuote = async ({
  collector,
  depositQueue,
  amount,
  account,
}: ReadDepositQuoteArgs): Promise<VaultQuote> => {
  const { shares } = (await collector.read.getDepositParams([
    depositQueue.address,
    amount,
    account,
    COLLECTOR_CONFIG,
  ])) as DepositParams;
  return { amount, output: shares };
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
  return { amount: shares, output: assets };
};
