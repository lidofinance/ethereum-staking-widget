import { renderHook } from 'features/stake/shared/__tests__/stake-test-utils';
import { LIDO_L2_STAKING_QUERY_SCOPE } from 'modules/l2-staking';
import type { Address, Hash } from 'viem';

import {
  addPendingSlowStake,
  getPendingSlowStakes,
  resetPendingSlowStakes,
} from '../slow-stake-pending-store';

// the test renderer is a server render, where the store hook would hand
// out the server snapshot: read the store directly instead
vi.mock('../slow-stake-pending-store', async (importOriginal) => {
  const original =
    await importOriginal<typeof import('../slow-stake-pending-store')>();
  return {
    ...original,
    usePendingSlowStakes: original.getPendingSlowStakes,
  };
});

const WETH: Address = '0x4200000000000000000000000000000000000006';
const ID_1: Hash =
  '0x1111111111111111111111111111111111111111111111111111111111111111';
const ID_2: Hash =
  '0x2222222222222222222222222222222222222222222222222222222222222222';
const listedStatus = (messageId: Hash) => ({ messageId, stage: 'staked' });
const OTHER_ADDRESS: Address = '0x00000000000000000000000000000000000000bb';

// read by the hoisted mock factories, so hoisted with them
const { CHAIN_ID, ACCOUNT } = vi.hoisted(
  (): { CHAIN_ID: number; ACCOUNT: `0x${string}` } => ({
    CHAIN_ID: 8453,
    ACCOUNT: '0x00000000000000000000000000000000000000aa',
  }),
);

type QueryArgs = {
  queryKey: unknown[];
  enabled?: boolean;
  queryFn: () => Promise<unknown>;
};

type State = {
  address: string | undefined;
  isDappActive: boolean;
  isL2Stake: boolean;
  isSmartAccount: boolean;
  isSmartAccountLoading: boolean;
  blockNumber: bigint;
  // what the query currently holds
  data: unknown;
  query: QueryArgs | undefined;
  fromApi: ReturnType<typeof vi.fn>;
  fromLogs: ReturnType<typeof vi.fn>;
};

const state = vi.hoisted((): State => ({
  address: ACCOUNT,
  isDappActive: true,
  isL2Stake: true,
  isSmartAccount: false,
  isSmartAccountLoading: false,
  blockNumber: 500_000n,
  data: undefined,
  query: undefined,
  fromApi: vi.fn(),
  fromLogs: vi.fn(),
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: (args: QueryArgs) => {
    state.query = args;
    return {
      data: state.data,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    };
  },
}));
vi.mock('modules/web3', () => ({
  useDappStatus: () => ({
    address: state.address,
    isDappActive: state.isDappActive,
  }),
  useIsSmartAccount: () => ({
    isSmartAccount: state.isSmartAccount,
    isLoading: state.isSmartAccountLoading,
  }),
  useLidoSDKL2: () => ({
    chainId: CHAIN_ID,
    isL2Stake: state.isL2Stake,
    l2Stake: {
      core: { publicClient: { getBlockNumber: async () => state.blockNumber } },
      getLatestSlowStakeStatusesFromCcipApi: state.fromApi,
      getLatestSlowStakeStatuses: state.fromLogs,
    },
  }),
}));

import { useSlowStakeStatuses } from '../use-slow-stake-statuses';

const render = (limit?: number) =>
  renderHook(() => useSlowStakeStatuses(limit === undefined ? {} : { limit }));

const query = () => {
  if (!state.query) throw new Error('the query was not set up');
  return state.query;
};

beforeEach(() => {
  resetPendingSlowStakes();
  state.address = ACCOUNT;
  state.isDappActive = true;
  state.isL2Stake = true;
  state.isSmartAccount = false;
  state.isSmartAccountLoading = false;
  state.data = undefined;
  state.query = undefined;
  state.fromApi
    .mockReset()
    .mockResolvedValue({ statuses: ['api'], hasMore: true });
  state.fromLogs
    .mockReset()
    .mockResolvedValue({ statuses: ['logs'], hasMore: false });
});

describe('useSlowStakeStatuses', () => {
  it('asks the CCIP API for an ordinary wallet, three newest by default', async () => {
    render();
    expect(query().queryKey).toEqual([
      LIDO_L2_STAKING_QUERY_SCOPE,
      'slow-stake-statuses',
      { chainId: CHAIN_ID, address: ACCOUNT, limit: 3, source: 'ccip-api' },
    ]);
    expect(query().enabled).toBe(true);
    await expect(query().queryFn()).resolves.toEqual({
      statuses: ['api'],
      hasMore: true,
    });
    expect(state.fromApi).toHaveBeenCalledWith({ account: ACCOUNT, limit: 3 });
    expect(state.fromLogs).not.toHaveBeenCalled();
  });

  it('scans the lane lookback for a smart account', async () => {
    state.isSmartAccount = true;
    render(5);
    expect(query().queryKey[2]).toMatchObject({ limit: 5, source: 'logs' });
    await query().queryFn();
    expect(state.fromLogs).toHaveBeenCalledWith({
      account: ACCOUNT,
      fromBlock: 500_000n - 43_200n,
      toBlock: 500_000n,
      limit: 5,
    });
    expect(state.fromApi).not.toHaveBeenCalled();
  });

  it('does not scan below the genesis block', async () => {
    state.isSmartAccount = true;
    state.blockNumber = 100n;
    render();
    await query().queryFn();
    expect(state.fromLogs).toHaveBeenCalledWith(
      expect.objectContaining({ fromBlock: 0n, toBlock: 100n }),
    );
  });

  it('waits for the account kind before asking anything', () => {
    state.isSmartAccountLoading = true;
    const result = render();
    expect(query().enabled).toBe(false);
    expect(result.isLoading).toBe(true);
  });

  it.each([
    ['no wallet', () => (state.address = undefined)],
    ['an inactive dapp', () => (state.isDappActive = false)],
    ['a chain without L2 staking', () => (state.isL2Stake = false)],
  ])('stays idle with %s', (_, arrange) => {
    arrange();
    render();
    expect(query().enabled).toBe(false);
  });

  it('hands the statuses and the flag through', () => {
    state.data = { statuses: ['a', 'b'], hasMore: true };
    const result = render();
    expect(result.statuses).toEqual(['a', 'b']);
    expect(result.hasMore).toBe(true);
    expect(result.source).toBe('ccip-api');
  });

  it('is empty before any data', () => {
    const result = render();
    expect(result.statuses).toEqual([]);
    expect(result.hasMore).toBe(false);
  });

  describe('a stake sent from this browser', () => {
    const pendingArgs = { messageId: ID_1, token: WETH, amount: 10n ** 18n };

    it('is shown as sent in front of the list before the sources list it', () => {
      render().addSlowStakeMessageId(pendingArgs);
      state.data = { statuses: [listedStatus(ID_2)], hasMore: false };
      const result = render();
      expect(result.statuses.map((status) => status.messageId)).toEqual([
        ID_1,
        ID_2,
      ]);
      expect(result.statuses[0]).toMatchObject({
        stage: 'sent',
        user: ACCOUNT,
        token: WETH,
        amount: 10n ** 18n,
        ccipExplorerUrl: `https://ccip.chain.link/msg/${ID_1}`,
      });
    });

    it('gives way to the sources once they list it', () => {
      addPendingSlowStake({
        ...pendingArgs,
        chainId: CHAIN_ID,
        address: ACCOUNT,
      });
      state.data = { statuses: [listedStatus(ID_1)], hasMore: false };
      const result = render();
      expect(result.statuses).toEqual([listedStatus(ID_1)]);
    });

    it('counts towards the cutoff', () => {
      addPendingSlowStake({
        ...pendingArgs,
        chainId: CHAIN_ID,
        address: ACCOUNT,
      });
      state.data = { statuses: [listedStatus(ID_2)], hasMore: false };
      const result = render(1);
      expect(result.statuses.map((status) => status.messageId)).toEqual([ID_1]);
      expect(result.hasMore).toBe(true);
    });

    it('belongs to its chain and account only', () => {
      addPendingSlowStake({
        ...pendingArgs,
        chainId: 10,
        address: ACCOUNT,
      });
      addPendingSlowStake({
        ...pendingArgs,
        messageId: ID_2,
        chainId: CHAIN_ID,
        address: OTHER_ADDRESS,
      });
      expect(render().statuses).toEqual([]);
    });

    it('is not recorded without a wallet', () => {
      state.address = undefined;
      render().addSlowStakeMessageId(pendingArgs);
      expect(
        getPendingSlowStakes({ chainId: CHAIN_ID, address: ACCOUNT }),
      ).toEqual([]);
    });
  });
});
