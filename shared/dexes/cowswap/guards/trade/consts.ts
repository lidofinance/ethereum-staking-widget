import { LOCALE } from 'config/groups/locale';

import type { TradeGuardLevel } from './types';

// --- Thresholds ---
export type Thresholds = {
  oracleDeviationBlock: number;
  maxSellUsd: number;
  minSellUsdToTriggerOracle: number;
};

// USD limits, same for every token (ADR 0004)
export const DEFAULT_THRESHOLDS: Thresholds = {
  oracleDeviationBlock: 4,
  maxSellUsd: 5_000_000,
  // Below it the network fee alone can exceed the deviation block
  minSellUsdToTriggerOracle: 1_000,
};

// Trade build/verification errors
export const TRADE_BUILD_ERROR = (code?: number) =>
  `Trade build failed — order information unavailable${
    code ? ` (code ${code})` : ''
  }`;

export const TRADE_VERIFICATION_ERROR = (code?: number) =>
  `Trade verification failed — order information unavailable${
    code ? ` (code ${code})` : ''
  }`;

export const TRADE_SIZE_ERROR = (maxUsd: number) =>
  `Single transactions are capped at $${maxUsd.toLocaleString(LOCALE)}. This limit exists to protect you from outsized losses due to slippage, MEV, and execution risk. Split your order into smaller trades to continue.`;

export const TRADE_ORACLE_DEVIATION_ERROR = (
  deviationPercent: number,
  oracleDeviationThreshold: number,
) =>
  `Oracle price differs from trade one by ${deviationPercent.toFixed(1)}%. Maximum is ${oracleDeviationThreshold.toFixed(1)}%`;

export const WRAP_UNAVAILABLE_TITLE = 'Wrapping is not available';
export const WRAP_UNAVAILABLE_ERROR =
  'Wrapping ETH to WETH and unwrapping WETH to ETH are not supported here. Choose another token pair.';

export const LEVEL_ORDER: TradeGuardLevel[] = ['safe', 'blocked'];
