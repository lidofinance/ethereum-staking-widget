import { vi, describe, it, expect } from 'vitest';

// Mock utils/qa to break the ESM config chain (env-dynamics.mjs)
vi.mock('utils/qa', () => ({
  overrideWithQAMockString: vi.fn((value: string) => value),
  overrideWithQAMockNumber: vi.fn((value: number) => value),
}));

import type { OracleResult } from '../../../oracles/types';
import { DEFAULT_THRESHOLDS } from '../../consts';
import type { OnTradeParamsPayload } from '../../types';
import { evaluateTrade } from '../evaluate-trade';

const STETH = '0xae7ab96520de3a18e5e111b5eaab095312d7fe84';
const USDC = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';

const STETH_USD = 2000;
const USDC_USD = 1;

// The quote is ~half the oracle price, so min receive lands at exactly 50% of it.
// Min receive stays within MAX_SLIPPAGE of the quote, otherwise the structural
// check (1008) would block the trade before the oracle limits are reached.
const makeHalfPricePayload = (sellUnits: number): OnTradeParamsPayload => {
  const oracleBuyUnits = (sellUnits * STETH_USD) / USDC_USD;
  return {
    sellToken: { address: STETH, symbol: 'stETH' },
    buyToken: { address: USDC, symbol: 'USDC' },
    sellTokenAmount: { units: String(sellUnits) },
    buyTokenAmount: { units: String(oracleBuyUnits * 0.505) },
    minimumReceiveBuyAmount: { units: String(oracleBuyUnits * 0.5) },
  } as unknown as OnTradeParamsPayload;
};

const setup = () => {
  const oracle: OracleResult = {
    ok: true,
    sellTokenUsd: STETH_USD,
    buyTokenUsd: USDC_USD,
    deviation: 50,
  };
  const verifyWithOracle = vi.fn().mockResolvedValue(oracle);
  return {
    verifyWithOracle,
    options: {
      isTestnet: false,
      verifyWithOracle,
      readNetworkCostAllowance: vi.fn().mockResolvedValue(0),
    },
  };
};

describe('evaluateTrade — oracle deviation below minSellUsdToTriggerOracle', () => {
  // Pins the current behavior ahead of the fix: this is expected to flip to blocked
  it('returns safe for an $800 sell with min receive 50% off the oracle price', async () => {
    const { options, verifyWithOracle } = setup();
    // 0.4 stETH × $2000 = $800; oracle value 800 USDC, min receive 400 USDC
    const payload = makeHalfPricePayload(0.4);

    expect(DEFAULT_THRESHOLDS.minSellUsdToTriggerOracle).toBe(1000);
    expect(await evaluateTrade(payload, options)).toEqual({
      ok: true,
      snapshot: {
        sellToken: STETH,
        buyToken: USDC,
        sellAmountUnits: '0.4',
        buyAmountMinUnits: '400',
      },
    });
    // The oracle is consulted — only its deviation is ignored
    expect(verifyWithOracle).toHaveBeenCalledWith(payload);
  });

  it('blocks the same 50% deviation once the sell reaches the trigger', async () => {
    const { options } = setup();
    // 0.5 stETH × $2000 = $1000
    const result = await evaluateTrade(makeHalfPricePayload(0.5), options);

    expect(result).toMatchObject({
      ok: false,
      level: 'blocked',
      oracleVerified: true,
    });
  });
});
