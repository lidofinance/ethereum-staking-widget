import { PARTNER_FEE_BPS } from '../../consts';

import { OracleResult } from './types';

// Partner fee as a percentage (0.3%) — subtracted from deviation calculations
// because it's a known fixed cost the user has agreed to, not an unexpected loss
export const PARTNER_FEE_PCT = PARTNER_FEE_BPS / 100;

// Oracle failure results
export const FAIL_UNSUPPORTED: OracleResult = {
  ok: false,
  reason: 'unsupported',
};
export const FAIL_UNAVAILABLE: OracleResult = {
  ok: false,
  reason: 'unavailable',
};

// CoW network cost allowed on top of slippage and the partner fee in the min receive check (analyze-params)
export const NETWORK_COST_ALLOWANCE = {
  // gas units × multiplier × our eth_gasPrice; /quote gasAmount p95 ≈ 1.3M, CoW quotes gas a few times above the base fee
  mainnet: {
    maxGasUnits: 1_500_000,
    gasPriceMultiplier: 3,
    maxShareBps: 500,
    maxUsd: 100,
  },
  // L2 network costs stay below 0.3% even on $5 trades
  l2: { maxShareBps: 50, maxUsd: 1 },
} as const;
