import { vi, describe, it, expect, afterEach } from 'vitest';

// Mock utils/qa to break the ESM config chain (env-dynamics.mjs)
vi.mock('utils/qa', () => ({
  overrideWithQAMockString: vi.fn((value: string) => value),
  overrideWithQAMockNumber: vi.fn((value: number) => value),
}));

import { overrideWithQAMockString } from 'utils/qa';

import type { OrderData } from '../../../tx';
import type { OracleResult } from '../../../oracles/types';
import {
  DEFAULT_THRESHOLDS,
  TRADE_BUILD_ERROR,
  TRADE_SIZE_ERROR,
  TRADE_VERIFICATION_ERROR,
} from '../../consts';
import type { OnTradeParamsPayload } from '../../types';
import { applyOracleResult } from '../apply-oracle-result';
import {
  approvalSnapshotFromTrade,
  evaluateTrade,
  evaluateApproval,
  verifyApprovalAgainstSnapshot,
  verifyOrderAgainstSnapshot,
  type ValidatedApprovalSnapshot,
} from '../evaluate-trade';
import type { ValidatedTradeSnapshot } from '../verify-order';
import { TEST_PROFILE } from '../../../tx/__tests__/fixtures';

const TOKEN_DECIMALS = TEST_PROFILE.tokenDecimals;

const STETH = '0xae7ab96520de3a18e5e111b5eaab095312d7fe84';
const USDC = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
const LDO = '0x5a98fcbea516cf06857215779fd812ca3bef1b32';

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
      makePayload({ buyToken: { address: STETH, symbol: 'stETH' } }),
      options,
    );

    expect(result).toEqual({
      ok: false,
      level: 'blocked',
      messages: [TRADE_BUILD_ERROR(1009)],
      oracleVerified: false,
    });
    expect(verifyWithOracle).not.toHaveBeenCalled();
    expect(onSnapshotInvalidated).toHaveBeenCalledTimes(1);
  });

  it('blocks sell above max USD', async () => {
    const { options } = setup();
    // 5200 stETH × $2000 = $10.4M
    const result = await evaluateTrade(
      makePayload({
        sellTokenAmount: { units: '5200' },
        buyTokenAmount: { units: '10400000' },
        minimumReceiveBuyAmount: { units: '10296000' },
      }),
      options,
    );

    expect(result).toEqual({
      ok: false,
      level: 'blocked',
      messages: [TRADE_SIZE_ERROR(DEFAULT_THRESHOLDS.maxSellUsd)],
      oracleVerified: true,
    });
  });

  it('allows sell at max USD', async () => {
    const { options } = setup();
    // 5000 stETH × $2000 = $10M
    const result = await evaluateTrade(
      makePayload({
        sellTokenAmount: { units: '5000' },
        buyTokenAmount: { units: '10000000' },
        minimumReceiveBuyAmount: { units: '9900000' },
      }),
      options,
    );

    expect(result.ok).toBe(true);
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

  it('skips deviation check below USD trigger', async () => {
    const { options, verifyWithOracle } = setup({
      ...ORACLE_OK,
      deviation: 10,
    });
    // 0.4 stETH × $2000 = $800
    const result = await evaluateTrade(
      makePayload({
        sellTokenAmount: { units: '0.4' },
        buyTokenAmount: { units: '720' },
        minimumReceiveBuyAmount: { units: '713' },
      }),
      options,
    );

    expect(DEFAULT_THRESHOLDS.minSellUsdToTriggerOracle).toBe(1000);
    expect(result.ok).toBe(true);
    expect(verifyWithOracle).toHaveBeenCalledTimes(1);
  });

  it('blocks small trade when oracle is unavailable', async () => {
    const { options } = setup({ ok: false, reason: 'unavailable' });
    const result = await evaluateTrade(
      makePayload({
        sellTokenAmount: { units: '0.01' },
        buyTokenAmount: { units: '20' },
        minimumReceiveBuyAmount: { units: '19.8' },
      }),
      options,
    );

    expect(result).toEqual({
      ok: false,
      level: 'blocked',
      messages: [TRADE_BUILD_ERROR(1004)],
      oracleVerified: false,
    });
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
  const setupApproval = (price: number | null = 2000, isTestnet = false) => {
    const readSellTokenUsd = vi.fn().mockResolvedValue(price);
    return {
      readSellTokenUsd,
      options: { isTestnet, readSellTokenUsd, tokenDecimals: TOKEN_DECIMALS },
    };
  };

  it('blocks with 1003 when no trade params reported', async () => {
    const { options } = setupApproval();
    expect(await evaluateApproval(null, options)).toEqual({
      ok: false,
      level: 'blocked',
      messages: [TRADE_BUILD_ERROR(1003)],
      oracleVerified: false,
    });
  });

  it('returns snapshot with exact sell amount', async () => {
    const { options, readSellTokenUsd } = setupApproval();
    const payload = makePayload();

    expect(await evaluateApproval(payload, options)).toEqual({
      ok: true,
      snapshot: { token: STETH, maxRaw: 1_000_000_000_000_000_000n },
    });
    expect(readSellTokenUsd).toHaveBeenCalledWith(payload);
  });

  it('blocks structural issues', async () => {
    const { options, readSellTokenUsd } = setupApproval();
    const result = await evaluateApproval(
      makePayload({ buyToken: { address: STETH, symbol: 'stETH' } }),
      options,
    );

    expect(result).toMatchObject({ ok: false, level: 'blocked' });
    expect(readSellTokenUsd).not.toHaveBeenCalled();
  });

  it('blocks approval above max USD', async () => {
    const { options } = setupApproval();
    expect(
      await evaluateApproval(
        makePayload({
          sellTokenAmount: { units: '5200' },
          buyTokenAmount: { units: '10400000' },
          minimumReceiveBuyAmount: { units: '10296000' },
        }),
        options,
      ),
    ).toEqual({
      ok: false,
      level: 'blocked',
      messages: [TRADE_SIZE_ERROR(DEFAULT_THRESHOLDS.maxSellUsd)],
      oracleVerified: false,
    });
  });

  it('blocks with 1004 when price is unavailable', async () => {
    const { options } = setupApproval(null);
    expect(await evaluateApproval(makePayload(), options)).toEqual({
      ok: false,
      level: 'blocked',
      messages: [TRADE_BUILD_ERROR(1004)],
      oracleVerified: false,
    });
  });

  it('skips price on testnet but still returns snapshot', async () => {
    const { options, readSellTokenUsd } = setupApproval(null, true);
    const result = await evaluateApproval(makePayload(), options);

    expect(result.ok).toBe(true);
    expect(readSellTokenUsd).not.toHaveBeenCalled();
  });

  it('blocks with 1010 for token without known decimals', async () => {
    const { options } = setupApproval();
    expect(
      await evaluateApproval(
        makePayload({ sellToken: { address: LDO, symbol: 'LDO' } }),
        options,
      ),
    ).toEqual({
      ok: false,
      level: 'blocked',
      messages: [TRADE_BUILD_ERROR(1010)],
      oracleVerified: false,
    });
  });
});

// ---------------------------------------------------------------------------
// verifyApprovalAgainstSnapshot
// ---------------------------------------------------------------------------
describe('verifyApprovalAgainstSnapshot', () => {
  const STETH_SNAPSHOT: ValidatedApprovalSnapshot = {
    token: STETH,
    maxRaw: 1_000n,
  };
  const USDC_SNAPSHOT: ValidatedApprovalSnapshot = {
    token: USDC,
    maxRaw: 50n,
  };
  const approve = (token: string, amount: bigint) => ({
    token: token as `0x${string}`,
    amount,
  });

  it('blocks with 1007 without snapshots', () => {
    expect(
      verifyApprovalAgainstSnapshot(approve(STETH, 1n), [null, null]),
    ).toBe(TRADE_VERIFICATION_ERROR(1007));
  });

  it('blocks with 1008 for another token', () => {
    expect(
      verifyApprovalAgainstSnapshot(approve(USDC, 1n), [STETH_SNAPSHOT, null]),
    ).toBe(TRADE_VERIFICATION_ERROR(1008));
  });

  it('blocks with 1009 above every matching snapshot', () => {
    expect(
      verifyApprovalAgainstSnapshot(approve(STETH, 1_001n), [
        STETH_SNAPSHOT,
        USDC_SNAPSHOT,
      ]),
    ).toBe(TRADE_VERIFICATION_ERROR(1009));
  });

  it('allows approve covered by the trade snapshot', () => {
    expect(
      verifyApprovalAgainstSnapshot(approve(USDC, 50n), [
        STETH_SNAPSHOT,
        USDC_SNAPSHOT,
      ]),
    ).toBeNull();
  });

  it('allows approve up to snapshot amount, any address case', () => {
    expect(
      verifyApprovalAgainstSnapshot(
        approve(STETH.replace('ae7ab', 'AE7AB'), 1_000n),
        [STETH_SNAPSHOT],
      ),
    ).toBeNull();
  });
});

describe('approvalSnapshotFromTrade', () => {
  it('converts validated trade sell amount to raw units', () => {
    expect(
      approvalSnapshotFromTrade(
        {
          sellToken: STETH,
          buyToken: USDC,
          sellAmountUnits: '1.5',
          buyAmountMinUnits: '2900',
        },
        TOKEN_DECIMALS,
      ),
    ).toEqual({ token: STETH, maxRaw: 1_500_000_000_000_000_000n });
  });

  it('returns null without trade or decimals', () => {
    expect(approvalSnapshotFromTrade(null, TOKEN_DECIMALS)).toBeNull();
    expect(
      approvalSnapshotFromTrade(
        {
          sellToken: LDO,
          buyToken: USDC,
          sellAmountUnits: '1',
          buyAmountMinUnits: '1',
        },
        TOKEN_DECIMALS,
      ),
    ).toBeNull();
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

  it('verifies an EthFlow order against a native ETH snapshot', () => {
    const ETH = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
    const ethOrder = {
      ...ORDER,
      sellToken: ETH.toLowerCase(),
    } as unknown as OrderData;
    const ethSnapshot = { ...SNAPSHOT, sellToken: ETH as `0x${string}` };

    expect(
      verifyOrderAgainstSnapshot(ethOrder, ethSnapshot, TOKEN_DECIMALS),
    ).toBeNull();
    expect(
      verifyOrderAgainstSnapshot(
        { ...ethOrder, sellAmount: 2n * 10n ** 18n },
        ethSnapshot,
        TOKEN_DECIMALS,
      ),
    ).toBe(TRADE_VERIFICATION_ERROR(1005));
  });

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
