import type { Address } from 'viem';

import { renderHook } from 'features/stake/shared/__tests__/stake-test-utils';

const VAULT: Address = '0x00000000000000000000000000000000000000d1';
const ORACLE: Address = '0x00000000000000000000000000000000000000d2';
const ASSET: Address = '0x00000000000000000000000000000000000000d3';
const CHAIN_ID = 1;
const MAX_AGE = 3600;
const NOW = Math.floor(Date.now() / 1000);

type QueryArgs = {
  queryKey: unknown[];
  enabled?: boolean;
  queryFn: () => Promise<unknown>;
};

type State = {
  // the useQuery call of the last render
  query: QueryArgs | undefined;
  // what useQuery resolves with
  data: unknown;
  // what the vault's oracle reports for the queue's asset
  report: { priceD18: bigint; timestamp: number; isSuspicious: boolean };
  publicClientMainnet: { readContract: ReturnType<typeof vi.fn> };
};

const state = vi.hoisted((): State => ({
  query: undefined,
  data: undefined,
  report: { priceD18: 10n ** 18n, timestamp: 0, isSuspicious: false },
  publicClientMainnet: { readContract: vi.fn() },
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: (args: QueryArgs) => {
    state.query = args;
    return { data: state.data, isLoading: false };
  },
}));
vi.mock('modules/web3', () => ({
  useDappStatus: () => ({ chainId: CHAIN_ID }),
  useMainnetOnlyWagmi: () => ({
    publicClientMainnet: state.publicClientMainnet,
  }),
}));
vi.mock('../../contracts', () => ({
  getSyncRedeemQueueContractWSTETH: () => ({
    read: {
      vault: async () => VAULT,
      asset: async () => ASSET,
      syncRedeemParams: async () => [0n, MAX_AGE, 0n, 0n, 0n] as const,
    },
  }),
}));

import {
  SYNC_REDEEM_REPORT_QUERY_KEY,
  useEthVaultSyncRedeemReport,
} from '../use-sync-redeem-report';

const render = (args?: { enabled?: boolean }) =>
  renderHook(() => useEthVaultSyncRedeemReport(args));

const query = () => {
  if (!state.query) throw new Error('the query was not set up');
  return state.query;
};

beforeEach(() => {
  state.query = undefined;
  state.data = undefined;
  state.report = {
    priceD18: 10n ** 18n,
    timestamp: NOW - 60,
    isSuspicious: false,
  };
  state.publicClientMainnet = {
    readContract: vi.fn(
      async ({
        functionName,
        address,
      }: {
        functionName: string;
        address: Address;
      }) => {
        if (functionName === 'oracle' && address === VAULT) return ORACLE;
        if (functionName === 'getReport' && address === ORACLE)
          return state.report;
        throw new Error(`unexpected read: ${functionName} at ${address}`);
      },
    ),
  };
});

describe('useEthVaultSyncRedeemReport', () => {
  it('reads the report through the queue, its vault and the vault oracle', async () => {
    render();
    await expect(query().queryFn()).resolves.toEqual({
      report: state.report,
      maxAge: MAX_AGE,
    });
    expect(state.publicClientMainnet?.readContract).toHaveBeenCalledWith(
      expect.objectContaining({ functionName: 'getReport', args: [ASSET] }),
    );
  });

  it('is keyed by chain and off until the vault is available', () => {
    render({ enabled: false });
    expect(query().enabled).toBe(false);
    expect(query().queryKey).toEqual([
      'earn-vault-eth',
      SYNC_REDEEM_REPORT_QUERY_KEY,
      CHAIN_ID,
    ]);
    render();
    expect(query().enabled).toBe(true);
  });

  it('is unknown while nothing has been read', () => {
    expect(render().isUsable).toBeUndefined();
  });

  it('reports a fresh report as usable', () => {
    state.data = { report: state.report, maxAge: MAX_AGE };
    expect(render().isUsable).toBe(true);
  });

  // ETHV-WD-ROUTE-05: the sync queue reverts with StaleReport past maxAge
  it('reports a report older than maxAge as unusable', () => {
    state.data = {
      report: { ...state.report, timestamp: NOW - MAX_AGE - 1 },
      maxAge: MAX_AGE,
    };
    expect(render().isUsable).toBe(false);
  });

  it('reports a suspicious report as unusable', () => {
    state.data = {
      report: { ...state.report, isSuspicious: true },
      maxAge: MAX_AGE,
    };
    expect(render().isUsable).toBe(false);
  });
});
