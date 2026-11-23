import { ZodError } from 'zod';

import {
  STETH_MAINNET_ADDRESS,
  createStethRewardsFetcher,
  parseStethRewardsResponse,
} from '../steth-rewards';

vi.mock('../../fetchApiWrapper', () => ({
  responseTimeExternalMetricWrapper: ({
    request,
  }: {
    request: () => Promise<unknown>;
  }) => request(),
}));

const WALLET = '0xbbbbb5bcf101c8ffe6de8593cd497805f9a8e4b8';
const BACKEND_URL = 'https://rewards.example';

const backendAnswer = (totals: Record<string, unknown>) => ({
  events: [],
  totals,
  averageApr: '2.7',
  totalItems: 899,
});

const jsonResponse = (body: unknown, status = 200) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  }) as Response;

describe('parseStethRewardsResponse', () => {
  it('reads the totals as stETH rewards of the stETH token', () => {
    expect(
      parseStethRewardsResponse(
        backendAnswer({
          ethRewards: '2765529208018817',
          currencyRewards: '7.6385070371929178723669439487296',
        }),
      ),
    ).toEqual({
      address: STETH_MAINNET_ADDRESS,
      rewardsUsd: 7.638507037192918,
      rewardsAmount: 0.002765529208018817,
      rewardsSymbol: 'stETH',
    });
  });

  it('keeps zero rewards of a wallet that has just staked', () => {
    expect(
      parseStethRewardsResponse(
        backendAnswer({ ethRewards: '0', currencyRewards: '0' }),
      ),
    ).toMatchObject({ rewardsUsd: 0, rewardsAmount: 0 });
  });

  it.each([
    ['no USD total', { ethRewards: '1', currencyRewards: '' }],
    ['a negative amount', { ethRewards: '-1', currencyRewards: '1' }],
    ['a number instead of a string', { ethRewards: 1, currencyRewards: '1' }],
  ])('rejects %s', (_, totals) => {
    expect(() => parseStethRewardsResponse(backendAnswer(totals))).toThrow(
      ZodError,
    );
  });
});

describe('createStethRewardsFetcher', () => {
  it('asks the backend for one address with the smallest page', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      jsonResponse(
        backendAnswer({
          ethRewards: '1000000000000000000',
          currencyRewards: '2000',
        }),
      ),
    );
    const fetchStethRewards = createStethRewardsFetcher({
      backendUrl: BACKEND_URL,
      fetcher,
    });

    expect(await fetchStethRewards(WALLET)).toMatchObject({
      rewardsUsd: 2000,
      rewardsAmount: 1,
    });
    const requestUrl = new URL(String(fetcher.mock.calls[0][0]));
    expect(requestUrl.origin).toBe(BACKEND_URL);
    expect(Object.fromEntries(requestUrl.searchParams)).toEqual({
      address: WALLET,
      currency: 'usd',
      onlyRewards: 'true',
      archiveRate: 'true',
      skip: '0',
      limit: '1',
    });
  });

  it('fails on an error status', async () => {
    const fetchStethRewards = createStethRewardsFetcher({
      backendUrl: BACKEND_URL,
      fetcher: vi.fn().mockResolvedValue(jsonResponse({}, 503)),
    });
    await expect(fetchStethRewards(WALLET)).rejects.toThrow('503');
  });
});
