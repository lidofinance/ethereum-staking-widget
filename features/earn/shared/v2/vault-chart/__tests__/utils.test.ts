import {
  formatTvl,
  formatTooltipContent,
  buildChartSeries,
  alignToVaultTimestamps,
} from '../utils';
import {
  VAULT_CHART_COLOR,
  VAULT_CHART_AREA_COLOR,
  VAULT_CHART_SERIES_TVL_NAME,
  VAULT_CHART_SERIES_APY_NAME,
  TREASURY_CHART_LINE_COLOR,
  TREASURY_CHART_AREA_COLOR,
  TREASURY_CHART_SERIES_NAME,
  STAKING_CHART_LINE_COLOR,
  STAKING_CHART_AREA_COLOR,
  STAKING_CHART_SERIES_NAME,
} from '../consts';

// ─── formatTvl ──────────────────────────────────────────────────────────────

describe('formatTvl', () => {
  it('formats 0 wei as $0', () => {
    expect(formatTvl('0')).toBe('$0');
  });

  it('formats 1 ETH (1e18 wei) as $1', () => {
    expect(formatTvl('1000000000000000000')).toBe('$1');
  });

  it('formats 1 000 ETH (1e21 wei) as $1K', () => {
    expect(formatTvl('1000000000000000000000')).toBe('$1K');
  });

  it('formats 1 500 000 ETH (1.5M * 1e18 wei) as $1.5M', () => {
    expect(formatTvl('1500000000000000000000000')).toBe('$1.5M');
  });

  it('formats 1B ETH as $1B', () => {
    expect(formatTvl('1000000000000000000000000000')).toBe('$1B');
  });

  it('prepends $ sign', () => {
    expect(formatTvl('5000000000000000000')).toMatch(/^\$/);
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

describe('formatTooltipContent', () => {
  const T = 1705320000000; // 2024-01-15T12:00:00Z

  it('returns empty string for empty array', () => {
    expect(formatTooltipContent(makeParams([]), true)).toBe('');
  });

  it('returns empty string for non-array input', () => {
    expect(formatTooltipContent({} as never, true)).toBe('');
  });

  it('formats a single TVL series entry', () => {
    const params = makeParams([
      {
        seriesName: 'Vault TVL',
        value: [T, '1000000000000000000000'],
        marker: '●',
      },
    ]);
    const result = formatTooltipContent(params, true);
    expect(result).toContain('$1K');
    expect(result).toContain('Vault TVL');
    expect(result).toContain('●');
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
      {
        seriesName: 'Vault TVL',
        value: [T, '500000000000000000000000000'],
        marker: '●',
      },
    ]);
    const result = formatTooltipContent(params, true);
    expect(result).not.toContain('%');
    expect(result).toContain('$');
  });
});

// ─── buildChartSeries ───────────────────────────────────────────────────────

describe('buildChartSeries', () => {
  const tvlData: [number, string][] = [
    [1_700_000_000_000, '1000000000000000000000'],
  ];
  const apyData: [number, number][] = [[1_700_000_000_000, 4.5]];
  const treasuryData: [number, number][] = [[1_700_000_000_000, 4.8]];
  const stakingData: [number, number][] = [[1_700_000_000_000, 3.5]];

  describe('TVL chart', () => {
    it('returns exactly one series', () => {
      const series = buildChartSeries({
        activeChart: 'tvl',
        seriesData: tvlData,
        treasurySeriesData: [],
        isUSDVault: true,
        isETHVault: false,
      });
      expect(series).toHaveLength(1);
    });

    it('uses TVL series name and vault color', () => {
      const [s] = buildChartSeries({
        activeChart: 'tvl',
        seriesData: tvlData,
        treasurySeriesData: [],
        isUSDVault: true,
        isETHVault: false,
      });
      expect(s.name).toBe(VAULT_CHART_SERIES_TVL_NAME);
      expect(s.lineStyle.color).toBe(VAULT_CHART_COLOR);
      expect(s.areaStyle?.color).toBe(VAULT_CHART_AREA_COLOR);
    });

    it('ignores treasury/staking data in TVL mode', () => {
      const series = buildChartSeries({
        activeChart: 'tvl',
        seriesData: tvlData,
        treasurySeriesData: treasuryData,
        stakingSeriesData: stakingData,
        isUSDVault: true,
        isETHVault: true,
      });
      expect(series).toHaveLength(1);
    });
  });

  describe('APY chart — USD vault', () => {
    it('adds treasury series when data is present', () => {
      const series = buildChartSeries({
        activeChart: 'apy',
        seriesData: apyData,
        treasurySeriesData: treasuryData,
        isUSDVault: true,
        isETHVault: false,
      });
      expect(series).toHaveLength(2);
      expect(series[0].name).toBe(VAULT_CHART_SERIES_APY_NAME);
      expect(series[1].name).toBe(TREASURY_CHART_SERIES_NAME);
      expect(series[1].lineStyle.color).toBe(TREASURY_CHART_LINE_COLOR);
      expect(series[1].areaStyle?.color).toBe(TREASURY_CHART_AREA_COLOR);
    });

    it('omits treasury series when data is empty', () => {
      const series = buildChartSeries({
        activeChart: 'apy',
        seriesData: apyData,
        treasurySeriesData: [],
        isUSDVault: true,
        isETHVault: false,
      });
      expect(series).toHaveLength(1);
      expect(series[0].name).toBe(VAULT_CHART_SERIES_APY_NAME);
    });
  });

  describe('APY chart — ETH vault', () => {
    it('adds staking series when data is present', () => {
      const series = buildChartSeries({
        activeChart: 'apy',
        seriesData: apyData,
        treasurySeriesData: [],
        stakingSeriesData: stakingData,
        isUSDVault: false,
        isETHVault: true,
      });
      expect(series).toHaveLength(2);
      expect(series[1].name).toBe(STAKING_CHART_SERIES_NAME);
      expect(series[1].lineStyle.color).toBe(STAKING_CHART_LINE_COLOR);
      expect(series[1].areaStyle?.color).toBe(STAKING_CHART_AREA_COLOR);
    });

    it('omits staking series when data is empty', () => {
      const series = buildChartSeries({
        activeChart: 'apy',
        seriesData: apyData,
        treasurySeriesData: [],
        stakingSeriesData: [],
        isUSDVault: false,
        isETHVault: true,
      });
      expect(series).toHaveLength(1);
    });

    it('omits staking series when stakingSeriesData is undefined', () => {
      const series = buildChartSeries({
        activeChart: 'apy',
        seriesData: apyData,
        treasurySeriesData: [],
        stakingSeriesData: undefined,
        isUSDVault: false,
        isETHVault: true,
      });
      expect(series).toHaveLength(1);
    });
  });

  describe('APY chart — z-index ordering', () => {
    it('vault series has z=1, treasury has z=2', () => {
      const series = buildChartSeries({
        activeChart: 'apy',
        seriesData: apyData,
        treasurySeriesData: treasuryData,
        isUSDVault: true,
        isETHVault: false,
      });
      expect(series[0].z).toBe(1);
      expect(series[1].z).toBe(2);
    });

    it('vault series has z=1, staking has z=3', () => {
      const series = buildChartSeries({
        activeChart: 'apy',
        seriesData: apyData,
        treasurySeriesData: [],
        stakingSeriesData: stakingData,
        isUSDVault: false,
        isETHVault: true,
      });
      expect(series[0].z).toBe(1);
      expect(series[1].z).toBe(3);
    });
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
