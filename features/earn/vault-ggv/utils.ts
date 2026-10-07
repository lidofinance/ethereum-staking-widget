import { type Address } from 'viem';
import { bnAmountToNumber } from 'utils/bn';
import { GGV_INCENTIVES, GGV_START_DATE, GGV_STATS_ORIGIN } from './consts';
import { z } from 'zod';
import { standardFetcher } from 'utils/standardFetcher';
import { DECIMAL_STRING_SCHEMA } from 'utils/zod';
import { ManifestConfigVaultApyType } from 'config/external-config';

// Only the fields the widget reads are validated, the rest passes through
const SEVEN_SEAS_DAILY_ITEM_SCHEMA = z.looseObject({
  daily_apy: z.number(),
  timestamp: z.string(),
  unix_seconds: z.number(),
  total_assets: DECIMAL_STRING_SCHEMA,
});

const SEVEN_SEAS_DAILY_RESPONSE_SCHEMA = z.object({
  Response: z.array(SEVEN_SEAS_DAILY_ITEM_SCHEMA),
});

const SEVEN_SEAS_PERFORMANCE_RESPONSE_SCHEMA = z.object({
  Response: z.looseObject({
    apy: z.number(),
    timestamp: z.string(),
    real_apy_breakdown: z.array(
      z.looseObject({
        allocation: z.number(),
        apy: z.number(),
        chain: z.string(),
        protocol: z.string(),
      }),
    ),
  }),
});

export type SevenSeasAPIDailyResponseItem = z.infer<
  typeof SEVEN_SEAS_DAILY_ITEM_SCHEMA
>;
export type SevenSeasAPIPerformanceResponse = z.infer<
  typeof SEVEN_SEAS_PERFORMANCE_RESPONSE_SCHEMA
>;

const fetchDailyData = async (url: string) =>
  SEVEN_SEAS_DAILY_RESPONSE_SCHEMA.parse(await standardFetcher<unknown>(url));

const fetchPerformance = async (url: string) =>
  SEVEN_SEAS_PERFORMANCE_RESPONSE_SCHEMA.parse(
    await standardFetcher<unknown>(url),
  );

const WEEK_SECONDS = 7 * 24 * 60 * 60;

export const fetchDailyGGVApy = async (vault: Address) => {
  const weekAgo = Math.floor(new Date().getTime() / 1000 - WEEK_SECONDS);
  const url = `${GGV_STATS_ORIGIN}/dailyData/ethereum/${vault}/${weekAgo}/latest`;

  const data = await fetchDailyData(url);
  const latestApy = data.Response[0];

  if (!latestApy) {
    throw new Error('[GGV-APY] No data found');
  }

  // 7 day sliding window average APY, safe if some data from api is missing
  const averageApy =
    data.Response.reduce((acc, curr) => acc + curr.daily_apy, 0) /
    data.Response.length;

  return { daily: latestApy.daily_apy, average: averageApy };
};

export const fetchWeeklyGGVApy = async (vault: Address) => {
  const url = `${GGV_STATS_ORIGIN}/performance/ethereum/${vault}?aggregation_period=7`;

  const data = await fetchPerformance(url);

  return data.Response.apy * 100;
};

export const fetchGGVPerformance = async (vault: Address) => {
  const url = `${GGV_STATS_ORIGIN}/performance/ethereum/${vault}`;

  const data = await fetchPerformance(url);

  return data;
};

export const fetchDailyGGVChainData = async (vault: Address) => {
  const last3DaysTimestamp = Math.floor(Date.now() / 1000) - 86400 * 3;
  const url = `${GGV_STATS_ORIGIN}/dailyData/all/${vault}/${last3DaysTimestamp}/latest`;

  const data = await fetchDailyData(url);
  const latestData = data.Response;

  return latestData;
};

export const fetchWeeklyGGVApyAverage = async (vault: Address) => {
  const apy = await fetchDailyGGVApy(vault);

  return apy.average;
};

export const calculateGGVIncentivesAPY = (totalAssets: bigint) => {
  let incentivesMonth =
    (Date.now() - GGV_START_DATE.getTime()) / (30 * 24 * 60 * 60 * 1000);
  if (incentivesMonth < 0) incentivesMonth = 0;
  incentivesMonth = Math.floor(incentivesMonth);
  const incentive = GGV_INCENTIVES[incentivesMonth] || BigInt(0);

  if (!incentive) return 0;

  // (total_monthly_stETH / 30 / total_assets) * 365 -> %
  const derived = bnAmountToNumber(
    (incentive * 365n * 100n * 10n ** 18n) / (totalAssets * 30n),
    18,
  );

  return derived;
};

export const getGGVApy = async (
  vault: Address,
  ggvAPYType?: ManifestConfigVaultApyType,
): Promise<number> => {
  switch (ggvAPYType) {
    case 'weekly':
      return await fetchWeeklyGGVApy(vault);
    case 'weekly_moving_average':
      return await fetchWeeklyGGVApyAverage(vault);
    default:
      return (await fetchDailyGGVApy(vault)).daily;
  }
};
