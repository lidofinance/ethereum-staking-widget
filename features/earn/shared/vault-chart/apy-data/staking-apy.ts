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
// A guard against a broken pageCount. 20 pages of daily points is more than 5 years.
const MAX_PAGES = 20;

const fetchStakingApyPage = async (
  page: number,
  startTime: number,
  endTime: number,
): Promise<LidoStethAprResponse | null> => {
  const url = getEthApiPath(ETH_API_ROUTES.STETH_APR, {
    startTime: startTime.toString(),
    endTime: endTime.toString(),
    page: page.toString(),
    pageSize: PAGE_SIZE.toString(),
  });
  if (!url) return null;

  const raw = await standardFetcher<unknown>(url);
  return LidoStethAprResponseSchema.parse(raw);
};

/**
 * Fetches the stETH APR time series from the Lido API.
 * The API returns the oldest points first, so a range longer than one page
 * needs all pages. Otherwise the latest points are lost.
 */
export const fetchStakingApyData = async (
  fromTimestamp: number,
): Promise<StakingApyFetchedData | null> => {
  const endTime = Math.floor(Date.now() / 1000);
  const firstPage = await fetchStakingApyPage(1, fromTimestamp, endTime);
  if (!firstPage) return null;

  const pageCount = Math.min(firstPage.pagination.pageCount, MAX_PAGES);
  const otherPages = await Promise.all(
    Array.from({ length: Math.max(pageCount - 1, 0) }, (_, index) =>
      fetchStakingApyPage(index + 2, fromTimestamp, endTime),
    ),
  );

  return toStakingChartPoints([firstPage, ...otherPages]);
};

export const toStakingChartPoints = (
  pages: (LidoStethAprResponse | null)[],
): StakingApyChartPoint[] =>
  pages
    .flatMap((page) => page?.data ?? [])
    .map((item) => ({ timestampMs: item.timeUnix * 1000, rate: item.apr }))
    .sort((a, b) => a.timestampMs - b.timestampMs);
