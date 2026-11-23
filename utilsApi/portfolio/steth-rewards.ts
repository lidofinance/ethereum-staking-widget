import { z } from 'zod';
import { formatEther } from 'viem';

import { CHAINS } from 'consts/chains';
import { TOKENS } from 'consts/tokens';
import { getTokenAddress } from 'config/networks/token-address';

import { responseTimeExternalMetricWrapper } from '../fetchApiWrapper';
import type { PortfolioTokenRewards } from './types';

const STETH_REWARDS_TIMEOUT_MS = 10_000;
const STETH_SYMBOL = 'stETH';

// stETH on Ethereum, lowercase: the token whose rewards this source knows
export const STETH_MAINNET_ADDRESS =
  getTokenAddress(CHAINS.Mainnet, TOKENS.steth)?.toLowerCase() ?? '';

// only the totals are read; the page of events is asked as small as allowed
const StethRewardsResponseSchema = z.object({
  totals: z.object({
    // wei
    ethRewards: z.string().regex(/^\d+$/),
    // USD as a decimal string
    currencyRewards: z.string().regex(/^\d+(\.\d+)?$/),
  }),
});

export const parseStethRewardsResponse = (
  responseBody: unknown,
): PortfolioTokenRewards => {
  const { totals } = StethRewardsResponseSchema.parse(responseBody);
  return {
    address: STETH_MAINNET_ADDRESS,
    rewardsUsd: Number(totals.currencyRewards),
    rewardsAmount: Number(formatEther(BigInt(totals.ethRewards))),
    rewardsSymbol: STETH_SYMBOL,
  };
};

export type StethRewardsFetcher = (
  address: string,
) => Promise<PortfolioTokenRewards>;

export type StethRewardsFetcherOptions = {
  backendUrl: string;
  fetcher?: typeof fetch;
};

// lifetime stETH rewards of an address from the rewards backend
export const createStethRewardsFetcher =
  ({
    backendUrl,
    fetcher = fetch,
  }: StethRewardsFetcherOptions): StethRewardsFetcher =>
  async (address) => {
    const queryParams = new URLSearchParams({
      address,
      currency: 'usd',
      // the same options as the Rewards page uses by default
      onlyRewards: 'true',
      archiveRate: 'true',
      skip: '0',
      limit: '1',
    });
    return responseTimeExternalMetricWrapper<PortfolioTokenRewards, string>({
      payload: backendUrl,
      request: async () => {
        const response = await fetcher(`${backendUrl}/?${queryParams}`, {
          headers: { Accept: 'application/json' },
          signal: AbortSignal.timeout(STETH_REWARDS_TIMEOUT_MS),
        });
        if (!response.ok) {
          throw new Error(`stETH rewards request failed: ${response.status}`);
        }
        return parseStethRewardsResponse((await response.json()) as unknown);
      },
    });
  };
