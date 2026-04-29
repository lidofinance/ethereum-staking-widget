import { z } from 'zod';

import { getEthApiPath, ETH_API_ROUTES } from 'consts/api';
import { standardFetcher } from 'utils/standardFetcher';

const LidoAprItemSchema = z.object({
  timeUnix: z.number(),
  apr: z.number(),
});

const LidoStethAprResponseSchema = z.object({
  data: z.array(LidoAprItemSchema),
  pagination: z.object({
    page: z.number(),
    pageSize: z.number(),
    itemCount: z.number(),
    pageCount: z.number(),
  }),
  meta: z
    .object({
      symbol: z.string(),
      address: z.string(),
      chainId: z.number(),
    })
    .optional(),
});

export type LidoAprItem = z.infer<typeof LidoAprItemSchema>;
export type LidoStethAprResponse = z.infer<typeof LidoStethAprResponseSchema>;

/** Chart point: timestamp in ms and rate (APR in percent). Same shape as Treasury for chart reuse. */
export type StakingApyChartPoint = {
  timestampMs: number;
  rate: number;
};

/** Parsed Lido API response for chart (array of points). */
export type StakingApyFetchedData = StakingApyChartPoint[];

const PAGE_SIZE = 100;

/**
 * Fetches stETH APR time series from Lido API.
 * Single request with startTime/endTime (unix timestamps); pageSize=100 is enough for 3 months.
 */
export const fetchStakingApyData = async (
  fromTimestamp: number,
): Promise<StakingApyFetchedData | null> => {
  const endTime = Math.floor(Date.now() / 1000);
  const url = getEthApiPath(ETH_API_ROUTES.STETH_APR, {
    startTime: fromTimestamp.toString(),
    endTime: endTime.toString(),
    page: '1',
    pageSize: PAGE_SIZE.toString(),
  });
  if (!url) return null;

  const raw = await standardFetcher<unknown>(url);
  const parsed = LidoStethAprResponseSchema.parse(raw);

  const result: StakingApyChartPoint[] = parsed.data.map((item) => ({
    timestampMs: item.timeUnix * 1000,
    rate: item.apr,
  }));
  result.sort((a, b) => a.timestampMs - b.timestampMs);
  return result;
};
