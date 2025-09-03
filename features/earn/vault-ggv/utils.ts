import { type Address } from 'viem';
import { bnAmountToNumber } from 'utils/bn';
import { GGV_INCENTIVES, GGV_START_DATE } from './consts';
import { standardFetcher } from 'utils/standardFetcher';

type SevenSeasAPIDailyResponse = {
  Response: [
    {
      block_number: number;
      daily_apy: number;
      price_usd: string;
      share_price: number;
      timestamp: string;
      total_assets: string;
      tvl: string;
      unix_seconds: number;
      vault_address: Address;
    },
  ];
};

const WEEK_SECONDS = 7 * 24 * 60 * 60;

export const fetchDailyGGVApy = async (vault: Address) => {
  const weekAgo = Math.floor(new Date().getTime() / 1000 - WEEK_SECONDS);

  const url = `https://api.sevenseas.capital/dailyData/ethereum/${vault}/${weekAgo}/latest`;

  const data = await standardFetcher<SevenSeasAPIDailyResponse>(url);

  const latestResponse = data.Response[0];

  if (!latestResponse) {
    throw new Error('[GGV-APY] No data found');
  }

  return latestResponse.daily_apy;
};

type SevenSeasAPIPerformanceResponse = {
  Response: {
    apy: number;
    fees: number;
    global_apy_breakdown: {
      fee: number;
      maturity_apy: number;
      real_apy: number;
    };
    maturity_apy_breakdown: unknown[];
    real_apy_breakdown: unknown[];
    timestamp: string;
  };
};

export const fetchWeeklyGGVApy = async (vault: Address) => {
  const url = `https://api.sevenseas.capital/performance/ethereum/${vault}?aggregation_period=7`;

  const data = await standardFetcher<SevenSeasAPIPerformanceResponse>(url);

  return data.Response.apy;
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
