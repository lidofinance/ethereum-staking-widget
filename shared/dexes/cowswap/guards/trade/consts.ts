import { ethAddress } from 'viem';

import { LOCALE } from 'config/groups/locale';
import mainnetConfig from 'networks/mainnet.json';

import type { TradeGuardLevel } from './types';

const c = mainnetConfig.contracts;

// --- Thresholds ---
export type Thresholds = {
  oracleDeviationBlock: number;
  maxAllowedSellAmount: number;
  minSellUnitsToTriggerOracle: number;
};

export const DEFAULT_THRESHOLDS: Thresholds = {
  oracleDeviationBlock: 4,
  maxAllowedSellAmount: 5_000,
  // Minimum sell amount (in token units) to trigger Chainlink oracle verification
  minSellUnitsToTriggerOracle: 0.5,
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

export const TRADE_SIZE_ERROR = (amount: number, symbol: string) =>
  `Single transactions are capped at ${amount.toLocaleString(LOCALE)} ${symbol}. This limit exists to protect you from outsized losses due to slippage, MEV, and execution risk. Split your order into smaller trades to continue.`;

export const TRADE_ORACLE_DEVIATION_ERROR = (
  deviationPercent: number,
  oracleDeviationThreshold: number,
) =>
  `Oracle price differs from trade one by ${deviationPercent.toFixed(1)}%. Maximum is ${oracleDeviationThreshold.toFixed(1)}%`;

export const LEVEL_ORDER: TradeGuardLevel[] = ['safe', 'blocked'];

// ---------------------------------------------------------------------------
// Token decimals (all whitelisted tokens)
// ---------------------------------------------------------------------------

export const TOKEN_DECIMALS: Record<string, number> = {
  [c.lido.toLowerCase()]: 18, // stETH
  [c.wsteth.toLowerCase()]: 18, // wstETH
  [ethAddress]: 18, // ETH placeholder
  [c.weth.toLowerCase()]: 18, // WETH
  [c.usdc.toLowerCase()]: 6, // USDC
  [c.usdt.toLowerCase()]: 6, // USDT
  [c.usds.toLowerCase()]: 18, // USDS
  [c.wbtc.toLowerCase()]: 8, // WBTC
};
