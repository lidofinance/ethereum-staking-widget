import { GAS_FEE_MODEL, getGasFeeModel } from './model';

/**
 * Every tunable the fee models apply. No fee values live here: prices are
 * always read live, these only shape them into an upper bound.
 */
export type FeeParams = {
  // Headroom, in percent, on the pending base fee. An EIP-1559 base fee can
  // double within ~6 blocks on Ethereum, where blocks are 12s apart and the
  // fee market is busy; L2 base fees sit near their floor most of the time
  baseFeeBufferPercent: bigint;
  // The sampled tip: bottom-percentile reward over the last blocks, floored
  // at the node's suggested priority fee (see models/fee-history.ts)
  feeHistoryBlockCount: number;
  feeHistoryRewardPercentile: number;
  // Headroom, in percent, on the parts that follow the L1 base fee and can
  // move between quoting and sending: the OP-stack L1 data fee, the Linea
  // tip. Measured drift within the quote's lifetime stayed under 25%; the
  // L1 fee is ~80% of an Optimism stake, so this knob sets its quote
  l1CostBufferPercent: bigint;
};

export const DEFAULT_FEE_PARAMS: FeeParams = {
  baseFeeBufferPercent: 100n,
  feeHistoryBlockCount: 5,
  feeHistoryRewardPercentile: 25,
  l1CostBufferPercent: 25n,
};

// Per-model overrides of the defaults. Measured against real stakes, these
// put the quote at roughly 1.3-1.5x of what was paid
export const MODEL_FEE_PARAMS: Partial<
  Record<GAS_FEE_MODEL, Partial<FeeParams>>
> = {
  // 2s blocks with a base fee near its floor: half the Ethereum headroom
  [GAS_FEE_MODEL.OpStack]: { baseFeeBufferPercent: 50n },
};

// Per-chain overrides, applied on top of the model's
export const CHAIN_FEE_PARAMS: Partial<Record<number, Partial<FeeParams>>> = {};

export const getFeeParams = (chainId?: number): FeeParams => ({
  ...DEFAULT_FEE_PARAMS,
  ...MODEL_FEE_PARAMS[getGasFeeModel(chainId)],
  ...(chainId !== undefined ? CHAIN_FEE_PARAMS[chainId] : undefined),
});

export const withBufferPercent = (value: bigint, percent: bigint) =>
  (value * (100n + percent)) / 100n;
