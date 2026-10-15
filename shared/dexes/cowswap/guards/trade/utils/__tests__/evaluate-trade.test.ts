import { vi, describe, it, expect, afterEach } from 'vitest';

// Mock utils/qa to break the ESM config chain (env-dynamics.mjs)
vi.mock('utils/qa', () => ({
  overrideWithQAMockString: vi.fn((value: string) => value),
  overrideWithQAMockNumber: vi.fn((value: number) => value),
}));

import { overrideWithQAMockString } from 'utils/qa';

import type { OrderData } from '../../../tx';
import type { OracleResult } from '../../../oracles/types';
import { DEFAULT_THRESHOLDS, TRADE_BUILD_ERROR } from '../../consts';
import type { OnTradeParamsPayload } from '../../types';
import { applyOracleResult } from '../apply-oracle-result';
import {
  evaluateTrade,
  evaluateApproval,
  verifyOrderAgainstSnapshot,
} from '../evaluate-trade';
import type { ValidatedTradeSnapshot } from '../verify-order';
import { TEST_PROFILE } from '../../../tx/__tests__/fixtures';

const TOKEN_DECIMALS = TEST_PROFILE.tokenDecimals;

const STETH = '0xae7ab96520de3a18e5e111b5eaab095312d7fe84';
const USDC = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';

const makePayload = (
  overrides: Partial<Record<string, unknown>> = {},
): OnTradeParamsPayload =>
  ({
    sellToken: { address: STETH.replace('ae7ab', 'AE7AB'), symbol: 'stETH' },
    buyToken: { address: USDC, symbol: 'USDC' },
    sellTokenAmount: { units: '1' },
    buyTokenAmount: { units: '2000' },
    minimumReceiveBuyAmount: { units: '1980' },
    ...overrides,
  }) as unknown as OnTradeParamsPayload;

const ORACLE_OK: OracleResult = {
  ok: true,
  sellTokenUsd: 2000,
  buyTokenUsd: 1,
  deviation: 0.5,
};

const setup = (oracle: OracleResult = ORACLE_OK, isTestnet = false) => {
  const verifyWithOracle = vi.fn().mockResolvedValue(oracle);
  const onSnapshotInvalidated = vi.fn();
  return {
    verifyWithOracle,
    onSnapshotInvalidated,
    options: { isTestnet, verifyWithOracle, onSnapshotInvalidated },
  };
};

afterEach(() => {
  vi.mocked(overrideWithQAMockString).mockImplementation(
    (value: string) => value,
  );
});

// ---------------------------------------------------------------------------
// applyOracleResult
// ---------------------------------------------------------------------------
describe('applyOracleResult', () => {
  it('returns safe and verified below deviation threshold', () => {
    expect(applyOracleResult(ORACLE_OK, DEFAULT_THRESHOLDS)).toEqual({
      level: 'safe',
      messages: [],
      verified: true,
    });
  });

  it('blocks with deviation message at threshold', () => {
    const result = applyOracleResult(
      { ...ORACLE_OK, deviation: DEFAULT_THRESHOLDS.oracleDeviationBlock },
      DEFAULT_THRESHOLDS,
    );
    expect(result.level).toBe('blocked');
    expect(result.verified).toBe(true);
    expect(result.messages[0]).toContain('Oracle price differs');
  });

  it.each([
    ['unavailable', 1004],
    ['unsupported', 1005],
  ] as const)('blocks unverified when oracle %s', (reason, code) => {
    expect(
      applyOracleResult({ ok: false, reason }, DEFAULT_THRESHOLDS),
    ).toEqual({
      level: 'blocked',
      messages: [TRADE_BUILD_ERROR(code)],
      verified: false,
    });
  });
});

// ---------------------------------------------------------------------------
// evaluateTrade
// ---------------------------------------------------------------------------
describe('evaluateTrade', () => {
  it('passes safe trade and returns lowercased snapshot', async () => {
    const { options, verifyWithOracle, onSnapshotInvalidated } = setup();
    const payload = makePayload();

    expect(await evaluateTrade(payload, options)).toEqual({
      ok: true,
      snapshot: {
        sellToken: STETH,
        buyToken: USDC,
        sellAmountUnits: '1',
        buyAmountMinUnits: '1980',
      },
    });
    expect(verifyWithOracle).toHaveBeenCalledWith(payload);
    expect(onSnapshotInvalidated).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['sell amount', { sellTokenAmount: undefined }],
    ['buy amount', { buyTokenAmount: undefined }],
    ['sell token', { sellToken: undefined }],
    ['invalid sell token', { sellToken: { address: '0x123', symbol: 'X' } }],
    ['buy token', { buyToken: undefined }],
    ['invalid buy token', { buyToken: { address: 'nope', symbol: 'X' } }],
    ['min receive', { minimumReceiveBuyAmount: undefined }],
  ])(
    'blocks with 1002 and keeps snapshot when %s missing',
    async (_, overrides) => {
      const { options, verifyWithOracle, onSnapshotInvalidated } = setup();

      expect(await evaluateTrade(makePayload(overrides), options)).toEqual({
        ok: false,
        level: 'blocked',
        messages: [TRADE_BUILD_ERROR(1002)],
        oracleVerified: false,
      });
      expect(onSnapshotInvalidated).not.toHaveBeenCalled();
      expect(verifyWithOracle).not.toHaveBeenCalled();
    },
  );

  it('blocks structural issues without oracle check', async () => {
    const { options, verifyWithOracle, onSnapshotInvalidated } = setup();
    const result = await evaluateTrade(
      makePayload({ sellTokenAmount: { units: '100000' } }),
      options,
    );

    expect(result).toMatchObject({ ok: false, level: 'blocked' });
    expect(!result.ok && result.messages[0]).toContain('capped at');
    expect(verifyWithOracle).not.toHaveBeenCalled();
    expect(onSnapshotInvalidated).toHaveBeenCalledTimes(1);
  });

  it('blocks with 1007 for zero sell amount', async () => {
    const { options } = setup();
    expect(
      await evaluateTrade(
        makePayload({
          sellTokenAmount: { units: '0' },
          buyTokenAmount: { units: '0' },
          minimumReceiveBuyAmount: { units: '0' },
        }),
        options,
      ),
    ).toEqual({
      ok: false,
      level: 'blocked',
      messages: [TRADE_BUILD_ERROR(1007)],
      oracleVerified: false,
    });
  });

  it('skips oracle below min sell threshold', async () => {
    const { options, verifyWithOracle } = setup();
    const units = String(DEFAULT_THRESHOLDS.minSellUnitsToTriggerOracle / 2);
    const result = await evaluateTrade(
      makePayload({
        sellTokenAmount: { units },
        buyTokenAmount: { units: '500' },
        minimumReceiveBuyAmount: { units: '495' },
      }),
      options,
    );

    expect(result.ok).toBe(true);
    expect(verifyWithOracle).not.toHaveBeenCalled();
  });

  it('skips oracle on testnet', async () => {
    const { options, verifyWithOracle } = setup(ORACLE_OK, true);
    expect((await evaluateTrade(makePayload(), options)).ok).toBe(true);
    expect(verifyWithOracle).not.toHaveBeenCalled();
  });

  it('blocks verified trade when oracle deviation is too high', async () => {
    const { options } = setup({ ...ORACLE_OK, deviation: 10 });
    const result = await evaluateTrade(makePayload(), options);

    expect(result).toMatchObject({
      ok: false,
      level: 'blocked',
      oracleVerified: true,
    });
  });

  it('blocks when oracle is unavailable', async () => {
    const { options } = setup({ ok: false, reason: 'unavailable' });
    expect(await evaluateTrade(makePayload(), options)).toEqual({
      ok: false,
      level: 'blocked',
      messages: [TRADE_BUILD_ERROR(1004)],
      oracleVerified: false,
    });
  });

  it('applies QA escalation to safe trade', async () => {
    vi.mocked(overrideWithQAMockString).mockReturnValue('blocked');
    const { options } = setup();
    const result = await evaluateTrade(makePayload(), options);

    expect(result).toMatchObject({
      ok: false,
      level: 'blocked',
      oracleVerified: true,
    });
  });
});

// ---------------------------------------------------------------------------
// evaluateApproval
// ---------------------------------------------------------------------------
describe('evaluateApproval', () => {
  it('blocks with 1003 when no trade params reported', () => {
    expect(evaluateApproval(null)).toEqual({
      ok: false,
      level: 'blocked',
      messages: [TRADE_BUILD_ERROR(1003)],
      oracleVerified: false,
    });
  });

  it('passes safe params', () => {
    expect(evaluateApproval(makePayload())).toBeNull();
  });

  it('blocks structural issues', () => {
    const result = evaluateApproval(
      makePayload({ sellTokenAmount: { units: '100000' } }),
    );
    expect(result).toMatchObject({ ok: false, level: 'blocked' });
  });
});

// ---------------------------------------------------------------------------
// verifyOrderAgainstSnapshot
// ---------------------------------------------------------------------------
describe('verifyOrderAgainstSnapshot', () => {
  const ORDER = {
    sellToken: STETH,
    buyToken: USDC,
    sellAmount: 10n ** 18n,
    buyAmount: 1980n * 10n ** 6n,
  } as unknown as OrderData;

  const SNAPSHOT: ValidatedTradeSnapshot = {
    sellToken: STETH,
    buyToken: USDC,
    sellAmountUnits: '1',
    buyAmountMinUnits: '1980',
  };

  it('returns 1001 without snapshot', () => {
    expect(verifyOrderAgainstSnapshot(ORDER, null, TOKEN_DECIMALS)).toBe(
      TRADE_BUILD_ERROR(1001),
    );
  });

  it.each([
    ['sell', { sellAmountUnits: '' }],
    ['min buy', { buyAmountMinUnits: '' }],
  ])('returns 1001 for empty %s amount in snapshot', (_, overrides) => {
    expect(
      verifyOrderAgainstSnapshot(
        ORDER,
        { ...SNAPSHOT, ...overrides },
        TOKEN_DECIMALS,
      ),
    ).toBe(TRADE_BUILD_ERROR(1001));
  });

  it('fails closed for token without decimals in profile', () => {
    expect(verifyOrderAgainstSnapshot(ORDER, SNAPSHOT, {})).not.toBeNull();
  });

  it('accepts order matching snapshot', () => {
    expect(
      verifyOrderAgainstSnapshot(ORDER, SNAPSHOT, TOKEN_DECIMALS),
    ).toBeNull();
  });

  it('rejects order with lower buy amount than snapshot', () => {
    expect(
      verifyOrderAgainstSnapshot(
        { ...ORDER, buyAmount: 1000n * 10n ** 6n },
        SNAPSHOT,
        TOKEN_DECIMALS,
      ),
    ).not.toBeNull();
  });
});
