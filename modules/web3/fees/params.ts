import { GAS_FEE_MODEL, getGasFeeModel } from './model';

/**
 * Every tunable the fee models apply. No fee values live here: prices are
 * always read live, these only shape them into an upper bound.
 */
export type FeeParams = {
  // An EIP-1559 base fee can double within ~6 blocks, so the max price quotes
  // the pending base fee times this until base fee changes can be predicted
  baseFeeMultiplier: bigint;
  // The sampled tip: bottom-percentile reward over the last blocks, floored
  // at the node's suggested priority fee (see models/fee-history.ts)
  feeHistoryBlockCount: number;
  feeHistoryRewardPercentile: number;
  // Buffer, in percent, on the parts that follow the L1 base fee and can move
  // between quoting and sending: the OP-stack L1 data fee, the Linea tip.
  // That fee is an EIP-1559 base fee too, so it gets the same headroom as
  // the chain's own base fee: measured swings between a quote and the send
  // exceeded 25% on Optimism, where it is most of the cost
  l1CostBufferPercent: bigint;
};

export const DEFAULT_FEE_PARAMS: FeeParams = {
  baseFeeMultiplier: 2n,
  feeHistoryBlockCount: 5,
  feeHistoryRewardPercentile: 25,
  l1CostBufferPercent: 100n,
};

// Per-model overrides of the defaults
export const MODEL_FEE_PARAMS: Partial<
  Record<GAS_FEE_MODEL, Partial<FeeParams>>
> = {};

// Per-chain overrides, applied on top of the model's
export const CHAIN_FEE_PARAMS: Partial<Record<number, Partial<FeeParams>>> = {};

export const getFeeParams = (chainId?: number): FeeParams => ({
  ...DEFAULT_FEE_PARAMS,
  ...MODEL_FEE_PARAMS[getGasFeeModel(chainId)],
  ...(chainId !== undefined ? CHAIN_FEE_PARAMS[chainId] : undefined),
});

export const withBufferPercent = (value: bigint, percent: bigint) =>
  (value * (100n + percent)) / 100n;
