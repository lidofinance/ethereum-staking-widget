import {
  formatTvl,
  formatTooltipContent,
  buildChartSeries,
  alignToVaultTimestamps,
  getLegendItems,
  type ChartPoint,
} from '../utils';
import {
  CHART_COLOR_FALLBACKS,
  CHART_LINE_WIDTH,
  TREASURY_CHART_SERIES_NAME,
  STAKING_CHART_SERIES_NAME,
} from '../consts';

// ─── formatTvl ──────────────────────────────────────────────────────────────

// formatTvl receives USD values already normalized by the vault data hook.
// No wei conversion happens here — just display formatting.
describe('formatTvl', () => {
  it('formats $0', () => {
    expect(formatTvl(0)).toBe('$0');
  });

  it('formats $1', () => {
    expect(formatTvl(1)).toBe('$1');
  });

  it('formats $1K', () => {
    expect(formatTvl(1_000)).toBe('$1K');
  });

  it('formats $1.5M', () => {
    expect(formatTvl(1_500_000)).toBe('$1.5M');
  });

  it('formats $1B', () => {
    expect(formatTvl(1_000_000_000)).toBe('$1B');
  });

  it('prepends $ sign', () => {
    expect(formatTvl(5)).toMatch(/^\$/);
  });
});

// ─── formatTooltipContent ───────────────────────────────────────────────────

type MockParam = {
  seriesName: string;
  value: [number, string | number];
  marker: string;
};

const makeParams = (items: MockParam[]) =>
  items as unknown as Parameters<typeof formatTooltipContent>[0];

// TVL values in params are pre-converted USD numbers (normalization happens in vault data hook).
describe('formatTooltipContent', () => {
  const T = 1705320000000; // 2024-01-15T12:00:00Z

  it('returns empty string for empty array', () => {
    expect(formatTooltipContent(makeParams([]), true)).toBe('');
  });

  it('returns empty string for non-array input', () => {
    expect(formatTooltipContent({} as never, true)).toBe('');
  });

  it('formats a single TVL series entry (USD number)', () => {
    const params = makeParams([
      { seriesName: 'Vault TVL', value: [T, 1_000], marker: '●' },
    ]);
    const result = formatTooltipContent(params, true);
    expect(result).toContain('$1K');
    expect(result).toContain('Vault TVL');
  });

  it('formats a single APY series entry', () => {
    const params = makeParams([
      { seriesName: 'Vault APY', value: [T, 5.25], marker: '●' },
    ]);
    const result = formatTooltipContent(params, false);
    expect(result).toContain('5.25%');
    expect(result).toContain('Vault APY');
  });

  it('formats multiple APY series (vault + treasury)', () => {
    const params = makeParams([
      { seriesName: 'Vault APY', value: [T, 4.5], marker: '●' },
      { seriesName: 'US Treasury Bonds APY', value: [T, 4.8], marker: '◆' },
    ]);
    const result = formatTooltipContent(params, false);
    expect(result).toContain('4.50%');
    expect(result).toContain('4.80%');
    expect(result).toContain('US Treasury Bonds APY');
  });

  it('APY value is formatted with exactly 2 decimal places', () => {
    const params = makeParams([
      { seriesName: 'Vault APY', value: [T, 3], marker: '●' },
    ]);
    const result = formatTooltipContent(params, false);
    expect(result).toContain('3.00%');
  });

  it('TVL uses shortened format, not percent', () => {
    const params = makeParams([
      { seriesName: 'Vault TVL', value: [T, 500_000_000], marker: '●' },
    ]);
    const result = formatTooltipContent(params, true);
    // a text value never ends with '%'; the CSS has percents, so check text nodes only
    expect(result).not.toMatch(/>[^<]*%</);
    expect(result).toContain('$500M');
  });
});

// ─── buildChartSeries ───────────────────────────────────────────────────────

describe('buildChartSeries', () => {
  const T = 1_700_000_000_000;
  const tvlData: ChartPoint[] = [[T, 1_000, 3_000_000]];
  const apyData: ChartPoint[] = [[T, 4.5]];
  const treasuryData: ChartPoint[] = [[T, 4.8]];
  const stakingData: ChartPoint[] = [[T, 3.5]];
  const base = {
    vaultLabel: 'EarnETH',
    colors: CHART_COLOR_FALLBACKS,
  };

  describe('TVL chart', () => {
    it('returns one vault series with a gradient area', () => {
      const series = buildChartSeries({
        ...base,
        activeChart: 'tvl',
        seriesData: tvlData,
        treasurySeriesData: treasuryData,
        stakingSeriesData: stakingData,
        isUSDVault: true,
        isETHVault: true,
      });
      expect(series).toHaveLength(1);
      expect(series[0].name).toBe('EarnETH TVL');
      expect(series[0].lineStyle?.color).toBe(CHART_COLOR_FALLBACKS.vault);
      expect(series[0].lineStyle?.width).toBe(CHART_LINE_WIDTH);
      expect(series[0].areaStyle).toBeDefined();
    });
  });

  describe('APY chart — USD vault', () => {
    it('adds the treasury series without an area', () => {
      const series = buildChartSeries({
        ...base,
        vaultLabel: 'EarnUSD',
        activeChart: 'apy',
        seriesData: apyData,
        treasurySeriesData: treasuryData,
        isUSDVault: true,
        isETHVault: false,
      });
      expect(series.map((item) => item.name)).toEqual([
        'EarnUSD APY',
        TREASURY_CHART_SERIES_NAME,
      ]);
      expect(series[1].lineStyle?.color).toBe(CHART_COLOR_FALLBACKS.treasury);
      expect(series.every((item) => item.areaStyle === undefined)).toBe(true);
    });

    it('omits the treasury series when it has no data', () => {
      const series = buildChartSeries({
        ...base,
        activeChart: 'apy',
        seriesData: apyData,
        treasurySeriesData: [],
        isUSDVault: true,
        isETHVault: false,
      });
      expect(series).toHaveLength(1);
    });
  });

  describe('APY chart — ETH vault', () => {
    it('adds the staking series in the warning colour', () => {
      const series = buildChartSeries({
        ...base,
        activeChart: 'apy',
        seriesData: apyData,
        treasurySeriesData: [],
        stakingSeriesData: stakingData,
        isUSDVault: false,
        isETHVault: true,
      });
      expect(series).toHaveLength(2);
      expect(series[1].name).toBe(STAKING_CHART_SERIES_NAME);
      expect(series[1].lineStyle?.color).toBe(CHART_COLOR_FALLBACKS.staking);
      // the comparison line is drawn above the vault line
      expect(series[1].z).toBeGreaterThan(series[0].z ?? 0);
    });

    it.each([[[]], [undefined]])(
      'omits the staking series for %j data',
      (stakingSeriesData) => {
        const series = buildChartSeries({
          ...base,
          activeChart: 'apy',
          seriesData: apyData,
          treasurySeriesData: [],
          stakingSeriesData,
          isUSDVault: false,
          isETHVault: true,
        });
        expect(series).toHaveLength(1);
      },
    );
  });
});

// ─── getLegendItems ─────────────────────────────────────────────────────────

describe('getLegendItems', () => {
  it('shows the vault and staking APY for EarnETH', () => {
    const items = getLegendItems({
      activeChart: 'apy',
      vaultLabel: 'EarnETH',
      isETHVault: true,
      latest: { apy: 5.12, stakingApy: 3.1 },
    });
    expect(items.map(({ label, values }) => [label, values])).toEqual([
      ['EarnETH APY', ['5.12%']],
      [STAKING_CHART_SERIES_NAME, ['3.10%']],
    ]);
  });

  it('shows the treasury APY for EarnUSD and null while it is unknown', () => {
    const [, treasury] = getLegendItems({
      activeChart: 'apy',
      vaultLabel: 'EarnUSD',
      isETHVault: false,
      latest: { apy: 5.9 },
    });
    expect(treasury.label).toBe(TREASURY_CHART_SERIES_NAME);
    expect(treasury.values).toBeNull();
  });

  it('shows the TVL in ETH and USD for EarnETH', () => {
    const [tvl] = getLegendItems({
      activeChart: 'tvl',
      vaultLabel: 'EarnETH',
      isETHVault: true,
      latest: { tvl: 95_500, tvlUsd: 166_700_000 },
    });
    expect(tvl.label).toBe('EarnETH TVL');
    expect(tvl.values).toHaveLength(2);
    expect(tvl.values?.[1]).toBe('$166.7M');
  });
});

// ─── alignToVaultTimestamps ──────────────────────────────────────────────────
// All timestamps are UTC-midnight values for known calendar dates.
// Jan 15 2024 (Mon) = 1705276800000, each subsequent day adds 86_400_000 ms.
const DAY = 86_400_000;
const MON_JAN_15 = new Date('2024-01-15').getTime(); // Monday
const TUE_JAN_16 = MON_JAN_15 + DAY;
const WED_JAN_17 = MON_JAN_15 + 2 * DAY;
const FRI_JAN_19 = MON_JAN_15 + 4 * DAY;
const SAT_JAN_20 = MON_JAN_15 + 5 * DAY; // no Treasury data on weekends
const SUN_JAN_21 = MON_JAN_15 + 6 * DAY;
const MON_JAN_22 = MON_JAN_15 + 7 * DAY;

// Treasury has data Mon–Fri (trading days only).
const weekRaw = [
  { timestampMs: MON_JAN_15, rate: 4.1 },
  { timestampMs: TUE_JAN_16, rate: 4.2 },
  { timestampMs: WED_JAN_17, rate: 4.3 },
  { timestampMs: FRI_JAN_19, rate: 4.5 },
  { timestampMs: MON_JAN_22, rate: 4.6 },
];

describe('alignToVaultTimestamps', () => {
  it('returns [] when raw is empty', () => {
    expect(alignToVaultTimestamps([], [[MON_JAN_15, 0]])).toEqual([]);
  });

  it('returns [] when apySeriesData is empty', () => {
    expect(
      alignToVaultTimestamps([{ timestampMs: MON_JAN_15, rate: 4.1 }], []),
    ).toEqual([]);
  });

  it('matches by UTC calendar date when vault timestamp is at midnight', () => {
    const result = alignToVaultTimestamps(weekRaw, [
      [MON_JAN_15, 0],
      [TUE_JAN_16, 0],
      [WED_JAN_17, 0],
    ]);
    expect(result).toEqual([
      [MON_JAN_15, 4.1],
      [TUE_JAN_16, 4.2],
      [WED_JAN_17, 4.3],
    ]);
  });

  // Regression for the reported bug: vault timestamps are mid-day (not midnight).
  // Previously, a vault point at 18:00 UTC would be closer in ms to the *next* day's
  // Treasury midnight than to the current day's midnight → off-by-one-day error.
  it('matches same calendar day even when vault timestamp is mid-day (18:00 UTC)', () => {
    const vaultMidDay = MON_JAN_15 + 18 * 3_600_000; // Mon Jan 15 18:00 UTC
    const result = alignToVaultTimestamps(weekRaw, [[vaultMidDay, 0]]);
    // Must return Jan 15 rate (4.1), not Jan 16 rate (4.2).
    expect(result).toEqual([[vaultMidDay, 4.1]]);
  });

  it('matches same calendar day even when vault timestamp is end-of-day (23:59:59 UTC)', () => {
    const vaultEndOfDay = MON_JAN_15 + DAY - 1000; // Mon Jan 15 23:59:59 UTC
    const result = alignToVaultTimestamps(weekRaw, [[vaultEndOfDay, 0]]);
    expect(result).toEqual([[vaultEndOfDay, 4.1]]);
  });

  it('falls back to nearest prior trading day for Saturday', () => {
    // Saturday Jan 20 — Treasury has no data. Should use Friday Jan 19 (4.5).
    const result = alignToVaultTimestamps(weekRaw, [[SAT_JAN_20, 0]]);
    expect(result).toEqual([[SAT_JAN_20, 4.5]]);
  });

  it('falls back to nearest prior trading day for Sunday', () => {
    // Sunday Jan 21 — Treasury has no data. Should use Friday Jan 19 (4.5).
    const result = alignToVaultTimestamps(weekRaw, [[SUN_JAN_21, 0]]);
    expect(result).toEqual([[SUN_JAN_21, 4.5]]);
  });

  it('handles vault timestamp before all raw points (returns earliest rate)', () => {
    const beforeAll = MON_JAN_15 - DAY; // Sunday Jan 14
    const result = alignToVaultTimestamps(weekRaw, [[beforeAll, 0]]);
    // No prior trading day: binary search clamps to index 0.
    expect(result[0][1]).toBe(4.1);
  });

  it('handles vault timestamp after all raw points (returns latest rate)', () => {
    const afterAll = MON_JAN_22 + DAY; // Tuesday Jan 23 (after last raw entry)
    const result = alignToVaultTimestamps(weekRaw, [[afterAll, 0]]);
    expect(result).toEqual([[afterAll, 4.6]]);
  });

  it('handles a single raw point — always returns that rate', () => {
    const raw = [{ timestampMs: MON_JAN_15, rate: 3.5 }];
    const result = alignToVaultTimestamps(raw, [
      [MON_JAN_15, 0],
      [TUE_JAN_16, 0],
      [MON_JAN_22, 0],
    ]);
    result.forEach(([, rate]) => expect(rate).toBe(3.5));
  });

  it('preserves vault timestamps in output (never substitutes raw timestamps)', () => {
    const vaultMon = MON_JAN_15 + 12 * 3_600_000; // 12:00 UTC
    const vaultTue = TUE_JAN_16 + 20 * 3_600_000; // 20:00 UTC
    const result = alignToVaultTimestamps(weekRaw, [
      [vaultMon, 0],
      [vaultTue, 0],
    ]);
    expect(result[0][0]).toBe(vaultMon);
    expect(result[1][0]).toBe(vaultTue);
  });

  it('handles many raw points efficiently (smoke test for 365-day input)', () => {
    const raw = Array.from({ length: 365 }, (_, i) => ({
      timestampMs: MON_JAN_15 + i * DAY,
      rate: i * 0.01,
    }));
    // Vault timestamps are mid-day to stress-test date matching.
    const apyData = Array.from({ length: 90 }, (_, i) => [
      MON_JAN_15 + i * DAY + 3_600_000 * 14, // 14:00 UTC each day
      0,
    ]);
    const result = alignToVaultTimestamps(raw, apyData);
    expect(result).toHaveLength(90);
    result.forEach(([t, rate], i) => {
      expect(t).toBe(apyData[i][0]);
      expect(rate).toBeCloseTo(i * 0.01, 10);
    });
  });
});
