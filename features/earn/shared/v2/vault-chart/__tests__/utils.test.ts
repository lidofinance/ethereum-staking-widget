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

describe('alignToVaultTimestamps', () => {
  it('returns [] when raw is empty', () => {
    expect(alignToVaultTimestamps([], [[1000, 4.5]])).toEqual([]);
  });

  it('returns [] when apySeriesData is empty', () => {
    expect(
      alignToVaultTimestamps([{ timestampMs: 1000, rate: 4.5 }], []),
    ).toEqual([]);
  });

  it('aligns exact timestamp matches', () => {
    const raw = [
      { timestampMs: 1000, rate: 4 },
      { timestampMs: 2000, rate: 5 },
      { timestampMs: 3000, rate: 6 },
    ];
    const result = alignToVaultTimestamps(raw, [
      [1000, 0],
      [2000, 0],
      [3000, 0],
    ]);
    expect(result).toEqual([
      [1000, 4],
      [2000, 5],
      [3000, 6],
    ]);
  });

  it('picks the closer of two neighbours', () => {
    const raw = [
      { timestampMs: 1000, rate: 4 },
      { timestampMs: 3000, rate: 6 },
    ];
    // t=1800: distance to 1000 is 800, distance to 3000 is 1200 → should pick rate 4.0
    const result = alignToVaultTimestamps(raw, [[1800, 0]]);
    expect(result).toEqual([[1800, 4]]);
  });

  it('picks the closer of two neighbours (right side closer)', () => {
    const raw = [
      { timestampMs: 1000, rate: 4 },
      { timestampMs: 3000, rate: 6 },
    ];
    // t=2500: distance to 1000 is 1500, distance to 3000 is 500 → should pick rate 6.0
    const result = alignToVaultTimestamps(raw, [[2500, 0]]);
    expect(result).toEqual([[2500, 6]]);
  });

  it('handles t before all raw points (clamps to first)', () => {
    const raw = [
      { timestampMs: 2000, rate: 5 },
      { timestampMs: 4000, rate: 7 },
    ];
    const result = alignToVaultTimestamps(raw, [[500, 0]]);
    expect(result).toEqual([[500, 5]]);
  });

  it('handles t after all raw points (clamps to last)', () => {
    const raw = [
      { timestampMs: 1000, rate: 4 },
      { timestampMs: 2000, rate: 5 },
    ];
    const result = alignToVaultTimestamps(raw, [[9999, 0]]);
    expect(result).toEqual([[9999, 5]]);
  });

  it('handles a single raw point — always returns that rate', () => {
    const raw = [{ timestampMs: 5000, rate: 3.5 }];
    const result = alignToVaultTimestamps(raw, [
      [1000, 0],
      [2000, 0],
      [9000, 0],
    ]);
    expect(result).toEqual([
      [1000, 3.5],
      [2000, 3.5],
      [9000, 3.5],
    ]);
  });

  it('preserves vault timestamps in output', () => {
    const raw = [
      { timestampMs: 1000, rate: 4 },
      { timestampMs: 2000, rate: 5 },
    ];
    // vault timestamps differ from raw — output timestamps must match vault, not raw
    const result = alignToVaultTimestamps(raw, [
      [1100, 0],
      [1900, 0],
    ]);
    expect(result[0][0]).toBe(1100);
    expect(result[1][0]).toBe(1900);
  });

  it('handles many raw points efficiently (smoke test for large input)', () => {
    const raw = Array.from({ length: 365 }, (_, i) => ({
      timestampMs: i * 86_400_000,
      rate: i * 0.01,
    }));
    const apyData = Array.from({ length: 90 }, (_, i) => [
      i * 86_400_000 + 1000,
      0,
    ]);
    const result = alignToVaultTimestamps(raw, apyData);
    expect(result).toHaveLength(90);
    result.forEach(([t, rate], i) => {
      expect(t).toBe(apyData[i][0]);
      expect(typeof rate).toBe('number');
    });
  });
});
