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
 * The fresh quote gives less per unit than the displayed one. A displayed
 * zero amount means nothing was displayed and never stops the transaction.
 *
 * For the same amount the outputs compare exactly: the Collector computes
 * both the same way, so a smaller output means worse terms. A quote can also
 * be displayed for a slightly different amount (the preview is debounced; a
 * stETH amount is converted to wstETH at a cached rate), and then the rates
 * compare. The Collector's output is the amount times the rate rounded by
 * integer division (and less the floored fee), within one unit of the exact
 * product either way, so each rate is only known to within one unit of
 * output over the amount. The fresh quote is worse only when even its
 * highest possible rate, (output + 1) / amount, is at most the lowest
 * possible displayed one, (output - 1) / amount; compared cross-multiplied
 */
export const isQuoteWorse = (fresh: VaultQuote, shown: VaultQuote) => {
  if (shown.amount === 0n) return false;
  if (fresh.amount === shown.amount) return fresh.output < shown.output;
  return (
    (fresh.output + 1n) * shown.amount <= (shown.output - 1n) * fresh.amount
  );
};

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
