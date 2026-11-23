import { renderHook } from 'features/stake/shared/__tests__/stake-test-utils';
import type { PortfolioToken } from 'utilsApi/portfolio/types';

type Balances = { steth?: bigint; wsteth?: bigint };

const defaults = () => ({
  balances: {
    data: undefined as Balances | undefined,
    isLoading: false,
    isError: false,
  },
  earn: {
    earneth: undefined as bigint | undefined,
    earnusd: undefined as bigint | undefined,
    earnethUsd: undefined as number | undefined,
    earnusdUsd: undefined as number | undefined,
    isLoading: false,
    isPriceLoading: false,
    isError: false,
  },
  stethUsd: { usdAmount: undefined as number | undefined, isLoading: false },
  wstethUsd: { usdAmount: undefined as number | undefined, isLoading: false },
  positions: {
    data: undefined as { tokens: PortfolioToken[] } | undefined,
    isLoading: false,
    isError: false,
    errorUpdateCount: 0,
  },
  rewards: {
    data: undefined as
      { rewards: unknown[]; stale?: true; updatedAt: number } | undefined,
    isLoading: false,
    isError: false,
  },
});

type State = ReturnType<typeof defaults>;

// per-address overrides, used by the address switch test
type Bag = Record<string, unknown>;
const state = vi.hoisted(
  (): { current: Bag; byAddress: Record<string, Bag> } => ({
    current: {},
    byAddress: {},
  }),
);

const read = (key: string, address?: string) =>
  (address && state.byAddress[address]?.[key]) ?? state.current[key];

vi.mock('../use-mainnet-token-balances', () => ({
  useMainnetTokenBalances: (address?: string) => read('balances', address),
}));
vi.mock('../use-mainnet-earn-positions', () => ({
  useMainnetEarnPositions: (address?: string) => read('earn', address),
}));
vi.mock('../use-portfolio-positions', () => ({
  usePortfolioPositions: (address?: string) => read('positions', address),
}));
vi.mock('../use-portfolio-rewards', () => ({
  usePortfolioRewards: (address?: string) => read('rewards', address),
}));
vi.mock('shared/hooks/use-eth-usd', () => ({
  useEthUsd: () => state.current.stethUsd,
}));
vi.mock('shared/hooks/use-wsteth-usd', () => ({
  useWstethUsd: () => state.current.wstethUsd,
}));
vi.mock('shared/hooks/useLidoApr', () => ({
  useLidoApr: () => ({ apr: '3.5' }),
}));
vi.mock('features/earn/vault-eth/hooks/use-vault-apy', () => ({
  useEthVaultApy: () => ({ apy: 4 }),
}));
vi.mock('features/earn/vault-usd/hooks/use-vault-apy', () => ({
  useUsdVaultApy: () => ({ apy: 5 }),
}));

import { getMainnetAddress } from '../../utils';
import { useLidoPositions } from '../use-lido-positions';

const ONE_TOKEN = 10n ** 18n;
const ADDRESS_A = '0x00000000000000000000000000000000000000a1' as const;
const ADDRESS_B = '0x00000000000000000000000000000000000000b2' as const;
const STETH = getMainnetAddress('steth');

const apiToken = (overrides: Partial<PortfolioToken> = {}): PortfolioToken => ({
  id: 'api-steth-1',
  chainId: 1,
  chainSlug: 'ethereum',
  chainName: 'Ethereum',
  address: STETH,
  isNative: false,
  symbol: 'stETH',
  name: 'Liquid staked Ether 2.0',
  decimals: 18,
  amountRaw: String(ONE_TOKEN),
  amount: 1,
  priceUsd: 2000,
  valueUsd: 2000,
  isLido: true,
  ...overrides,
});

const setState = (patch: { [K in keyof State]?: Partial<State[K]> }) => {
  const next = defaults() as Record<string, unknown>;
  for (const [key, value] of Object.entries(patch)) {
    next[key] = { ...(next[key] as object), ...(value as object) };
  }
  state.current = next;
};

const run = (address: string = ADDRESS_A) =>
  renderHook(() => useLidoPositions(address as typeof ADDRESS_A));

beforeEach(() => {
  state.current = defaults();
  state.byAddress = {};
});

describe('useLidoPositions dedup', () => {
  it('drops the API Ethereum stETH row once the on-chain balance is read', () => {
    setState({
      balances: { data: { steth: 2n * ONE_TOKEN, wsteth: 0n } },
      stethUsd: { usdAmount: 4000 },
      positions: { data: { tokens: [apiToken()] } },
    });
    const { rows } = run();
    expect(rows).toHaveLength(1);
    expect(rows[0].amount).toBe(2n * ONE_TOKEN);
    expect(rows[0].chains).toHaveLength(1);
  });

  it('does not resurrect the API row when the on-chain balance is 0n', () => {
    setState({
      balances: { data: { steth: 0n, wsteth: 0n } },
      positions: { data: { tokens: [apiToken()] } },
    });
    expect(run().rows).toEqual([]);
  });

  it('lets the API row stand in while the on-chain amount is undefined', () => {
    setState({
      balances: { data: undefined },
      positions: { data: { tokens: [apiToken()] } },
    });
    const { rows } = run();
    expect(rows).toHaveLength(1);
    expect(rows[0].chains[0].amountFloat).toBe(1);
  });

  it('keeps an L2 row with the same-looking address', () => {
    setState({
      balances: { data: { steth: 2n * ONE_TOKEN, wsteth: 0n } },
      stethUsd: { usdAmount: 4000 },
      positions: {
        data: {
          tokens: [
            apiToken({
              id: 'api-steth-l2',
              chainId: 10,
              chainSlug: 'optimism',
              chainName: 'Optimism',
            }),
          ],
        },
      },
    });
    const chains = run().rows.flatMap((row) => row.chains.map((c) => c.slug));
    expect(chains).toContain('ethereum');
    expect(chains).toContain('optimism');
  });
});

describe('useLidoPositions price state', () => {
  const held = { balances: { data: { steth: ONE_TOKEN, wsteth: 0n } } };

  it('is an error when a held stETH has no USD price', () => {
    setState({ ...held, stethUsd: { usdAmount: undefined } });
    const result = run();
    expect(result.isLoading).toBe(false);
    expect(result.isError).toBe(true);
  });

  it('is loading, not an error, while the price loads', () => {
    setState({ ...held, stethUsd: { isLoading: true } });
    const result = run();
    expect(result.isLoading).toBe(true);
    expect(result.isError).toBe(false);
  });

  it('is not an error once priced', () => {
    setState({ ...held, stethUsd: { usdAmount: 2000 } });
    const result = run();
    expect(result.isLoading).toBe(false);
    expect(result.isError).toBe(false);
  });
});

describe('useLidoPositions rewards flags', () => {
  it('mirrors the rewards error', () => {
    setState({ rewards: { isError: true } });
    expect(run().isRewardsError).toBe(true);
    setState({ rewards: { isError: false } });
    expect(run().isRewardsError).toBe(false);
  });

  it('is stale when the rewards answer is stale', () => {
    setState({ rewards: { data: { rewards: [], stale: true, updatedAt: 1 } } });
    expect(run().isRewardsStale).toBe(true);
    setState({ rewards: { data: { rewards: [], updatedAt: 1 } } });
    expect(run().isRewardsStale).toBe(false);
  });

  it('passes the update time through', () => {
    setState({ rewards: { data: { rewards: [], updatedAt: 1234 } } });
    expect(run().rewardsUpdatedAt).toBe(1234);
  });
});

describe('useLidoPositions API pending', () => {
  it('loads while the API has not answered and nothing failed yet', () => {
    setState({ positions: { isLoading: true, errorUpdateCount: 0 } });
    expect(run().isLoading).toBe(true);
  });

  it('does not bring the loading back on a retry after a failure', () => {
    setState({ positions: { isLoading: true, errorUpdateCount: 1 } });
    expect(run().isLoading).toBe(false);
  });
});

describe('useLidoPositions address switch', () => {
  it('shows only the data of the new address', () => {
    state.byAddress = {
      [ADDRESS_A]: {
        balances: { data: { steth: ONE_TOKEN, wsteth: 0n }, isLoading: false },
        positions: { data: undefined, isLoading: false, errorUpdateCount: 0 },
      },
      [ADDRESS_B]: {
        balances: {
          data: { steth: 0n, wsteth: 7n * ONE_TOKEN },
          isLoading: false,
        },
        positions: { data: undefined, isLoading: false, errorUpdateCount: 0 },
      },
    };
    state.current = {
      ...defaults(),
      stethUsd: { usdAmount: 1, isLoading: false },
      wstethUsd: { usdAmount: 2, isLoading: false },
    };

    const first = run(ADDRESS_A).rows;
    expect(first.map((row) => row.iconToken)).toEqual(['steth']);
    expect(first[0].amount).toBe(ONE_TOKEN);

    const second = run(ADDRESS_B).rows;
    expect(second.map((row) => row.iconToken)).toEqual(['wsteth']);
    expect(second[0].amount).toBe(7n * ONE_TOKEN);
  });
});
