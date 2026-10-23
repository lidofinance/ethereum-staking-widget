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
const listedStatus = (messageId: Hash, outcome = 'success') => ({
  messageId,
  outcome,
  stage: 'delivered',
});
const EMPTY = { inflight: [], error: [], success: [], hasMore: false };
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
  select?: (data: unknown) => unknown;
};

type State = {
  address: string | undefined;
  isDappActive: boolean;
  isL2Stake: boolean;
  // what the query currently holds
  data: unknown;
  query: QueryArgs | undefined;
  fromApi: ReturnType<typeof vi.fn>;
};

const state = vi.hoisted((): State => ({
  address: ACCOUNT,
  isDappActive: true,
  isL2Stake: true,
  data: undefined,
  query: undefined,
  fromApi: vi.fn(),
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: (args: QueryArgs) => {
    state.query = args;
    const { data } = state;
    return {
      data: data === undefined || !args.select ? data : args.select(data),
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
  useLidoSDKL2: () => ({
    chainId: CHAIN_ID,
    isL2Stake: state.isL2Stake,
    l2Stake: { getLatestSlowStakeStatusesFromCcipApi: state.fromApi },
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
  state.data = undefined;
  state.query = undefined;
  state.fromApi
    .mockReset()
    .mockResolvedValue({ ...EMPTY, success: ['api'], hasMore: true });
});

describe('useSlowStakeStatuses', () => {
  it('asks the CCIP API, three newest by default', async () => {
    render();
    expect(query().queryKey).toEqual([
      LIDO_L2_STAKING_QUERY_SCOPE,
      'slow-stake-statuses',
      { chainId: CHAIN_ID, address: ACCOUNT, limit: 3 },
    ]);
    expect(query().enabled).toBe(true);
    await expect(query().queryFn()).resolves.toEqual({
      ...EMPTY,
      success: ['api'],
      hasMore: true,
    });
    expect(state.fromApi).toHaveBeenCalledWith({ account: ACCOUNT, limit: 3 });
  });

  it('asks for as many as the limit says', () => {
    render(5);
    expect(query().queryKey[2]).toMatchObject({ limit: 5 });
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

  it('hands the stacks and the flag through', () => {
    state.data = {
      inflight: ['a'],
      error: ['b'],
      success: ['c'],
      hasMore: true,
    };
    const result = render();
    expect(result.inflight).toEqual(['a']);
    expect(result.error).toEqual(['b']);
    expect(result.success).toEqual(['c']);
    expect(result.hasMore).toBe(true);
  });

  it('is empty before any data', () => {
    const result = render();
    expect(result.inflight).toEqual([]);
    expect(result.error).toEqual([]);
    expect(result.success).toEqual([]);
    expect(result.hasMore).toBe(false);
  });

  describe('a stake sent from this browser', () => {
    const pendingArgs = { messageId: ID_1, token: WETH, amount: 10n ** 18n };

    it('is shown as sent in front of the in-flight stack before the source lists it', () => {
      render().addSlowStakeMessageId(pendingArgs);
      state.data = { ...EMPTY, inflight: [listedStatus(ID_2, 'inflight')] };
      const result = render();
      expect(result.inflight.map((status) => status.messageId)).toEqual([
        ID_1,
        ID_2,
      ]);
      expect(result.inflight[0]).toMatchObject({
        outcome: 'inflight',
        stage: 'sent',
        sendTimestampMs: expect.any(Number),
        user: ACCOUNT,
        token: WETH,
        amount: 10n ** 18n,
        ccipExplorerUrl: `https://ccip.chain.link/msg/${ID_1}`,
      });
    });

    it('gives way to the source once it lists it, in any stack', () => {
      addPendingSlowStake({
        ...pendingArgs,
        chainId: CHAIN_ID,
        address: ACCOUNT,
      });
      state.data = { ...EMPTY, success: [listedStatus(ID_1)] };
      const result = render();
      expect(result.inflight).toEqual([]);
      expect(result.success).toEqual([listedStatus(ID_1)]);
    });

    it('is reported as settled once the sources list it', () => {
      addPendingSlowStake({
        ...pendingArgs,
        chainId: CHAIN_ID,
        address: ACCOUNT,
      });
      render();
      const selected = query().select?.({
        ...EMPTY,
        error: [listedStatus(ID_1, 'error')],
      }) as { settled: Hash[] };
      expect(selected.settled).toEqual([ID_1]);
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
      expect(render().inflight).toEqual([]);
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
