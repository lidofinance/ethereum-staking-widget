import { z } from 'zod';

import type { LambdaClient } from './lambda-client';
import type { PortfolioTokenWithPnl } from './positions';
import {
  STETH_MAINNET_ADDRESS,
  type StethRewardsFetcher,
} from './steth-rewards';
import type { PortfolioTokenRewards } from './types';

const PNL_CHAIN = 'ethereum';
const PNL_PATH = `/api/v1/chains/${PNL_CHAIN}/aggregated-pnl-history`;
const PNL_TIMEOUT_MS = 15_000;
// Lambda history starts here; an earlier start returns no data at all
const LIFETIME_START_MS = Date.UTC(2022, 3, 1);
const LIFETIME_POINTS_LIMIT = 366;

const PnlRowSchema = z.object({
  category: z.string(),
  position_id: z.string(),
  // increments since the previous point, not running totals
  pnl_history: z.array(z.object({ reward_usd: z.number() })),
  reward_history: z
    .array(z.object({ symbol: z.string(), amount: z.number() }))
    .optional()
    .default([]),
});

const PnlResponseSchema = z.object({ data: z.array(z.unknown()) });

type PnlRow = z.infer<typeof PnlRowSchema>;

const getPnlRowKey = (category: string, positionId: string) =>
  `${category}:${positionId.toLowerCase()}`;

const sumRewardAmount = (pnlRow: PnlRow) => {
  const symbols = new Set(
    pnlRow.reward_history.map((rewardPoint) => rewardPoint.symbol),
  );
  if (symbols.size !== 1) return { amount: null, symbol: null };
  const amount = pnlRow.reward_history.reduce(
    (sum, rewardPoint) => sum + rewardPoint.amount,
    0,
  );
  return { amount, symbol: [...symbols][0] };
};

export const parsePnlResponse = (
  responseBody: unknown,
  tokens: PortfolioTokenWithPnl[],
): PortfolioTokenRewards[] => {
  const parseResults = PnlResponseSchema.parse(responseBody).data.map(
    (upstreamRow) => PnlRowSchema.safeParse(upstreamRow),
  );
  const invalidCount = parseResults.filter(
    (parseResult) => !parseResult.success,
  ).length;
  if (invalidCount > 0) {
    console.warn(`[portfolio] skipped ${invalidCount} unexpected pnl rows`);
  }
  const pnlRows = parseResults.flatMap((parseResult) =>
    parseResult.success ? [parseResult.data] : [],
  );
  const rowsByKey = new Map(
    pnlRows.map((pnlRow) => [
      getPnlRowKey(pnlRow.category, pnlRow.position_id),
      pnlRow,
    ]),
  );

  return tokens.flatMap((token) => {
    if (!token.pnl || !token.address) return [];
    const pnlRow = rowsByKey.get(
      getPnlRowKey(token.pnl.category, token.pnl.positionId),
    );
    if (!pnlRow) return [];
    const { amount, symbol } = sumRewardAmount(pnlRow);
    return [
      {
        address: token.address,
        rewardsUsd: pnlRow.pnl_history.reduce(
          (sum, pnlPoint) => sum + pnlPoint.reward_usd,
          0,
        ),
        rewardsAmount: amount,
        rewardsSymbol: symbol,
      },
    ];
  });
};

// the stETH source failed and an earlier answer can be shown instead
export class StethRewardsUnavailableError extends Error {
  constructor() {
    super('stETH rewards are unavailable');
  }
}

export type LidoRewardsOptions = {
  // stETH rewards come from here; without it every token goes upstream
  fetchStethRewards?: StethRewardsFetcher;
  // an earlier answer for this address is kept, so a failure can fall on it
  hasSavedRewards?: boolean;
};

// one upstream call covers every token, so it is skipped only with no tokens
const fetchUpstreamRewards = async (
  client: LambdaClient,
  address: string,
  lidoTokens: PortfolioTokenWithPnl[],
  currentTime: number,
): Promise<PortfolioTokenRewards[]> => {
  if (lidoTokens.length === 0) return [];

  const responseBody = await client.post(
    PNL_PATH,
    {
      positions: lidoTokens.map((token) => ({
        address,
        category: token.pnl?.category,
        position_id: token.pnl?.positionId,
      })),
      start_timestamp: LIFETIME_START_MS,
      end_timestamp: currentTime,
      granularity: 'month',
      points_limit: LIFETIME_POINTS_LIMIT,
    },
    PNL_TIMEOUT_MS,
  );
  return parsePnlResponse(responseBody, lidoTokens);
};

export const fetchLidoRewards = async (
  client: LambdaClient,
  address: string,
  tokens: PortfolioTokenWithPnl[],
  currentTime = Date.now(),
  { fetchStethRewards, hasSavedRewards = false }: LidoRewardsOptions = {},
): Promise<PortfolioTokenRewards[]> => {
  const lidoTokens = tokens.filter((token) => token.isLido && token.pnl);
  const stethToken = fetchStethRewards
    ? lidoTokens.find((token) => token.address === STETH_MAINNET_ADDRESS)
    : undefined;
  if (!fetchStethRewards || !stethToken) {
    return fetchUpstreamRewards(client, address, lidoTokens, currentTime);
  }

  let stethRewards: PortfolioTokenRewards;
  try {
    stethRewards = await fetchStethRewards(address);
  } catch {
    // the two sources count differently, so a kept answer is shown first
    if (hasSavedRewards) throw new StethRewardsUnavailableError();
    return fetchUpstreamRewards(client, address, lidoTokens, currentTime);
  }

  const otherLidoTokens = lidoTokens.filter((token) => token !== stethToken);
  const otherRewards = await fetchUpstreamRewards(
    client,
    address,
    otherLidoTokens,
    currentTime,
  );
  return [stethRewards, ...otherRewards];
};
