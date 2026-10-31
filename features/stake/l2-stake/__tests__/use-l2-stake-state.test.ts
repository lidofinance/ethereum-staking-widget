import { renderHook } from 'features/stake/shared/__tests__/stake-test-utils';
import { LIDO_L2_STAKING_QUERY_SCOPE } from 'modules/l2-staking';

const CHAIN_ID = 8453;
const CHAIN_NAME = 'Base';

type ChainState = {
  enabled: boolean;
  mode: 'all' | 'fastLaneOnly' | 'slowLaneOnly';
  liquidityTarget: number;
  disableReason?: string;
};

type OnChainState = {
  isFastLaneAvailable: boolean;
  isSlowLaneAvailable: boolean;
};

type QueryArgs = {
  queryKey: unknown[];
  enabled?: boolean;
  queryFn: () => Promise<unknown>;
};

type State = {
  // what the QA helper pins, null for none
  mockedMode: ChainState['mode'] | null;
  chainState: ChainState;
  featureFlags: { ledgerLiveL2?: boolean };
  isLedgerLive: boolean;
  // what the on-chain query currently holds
  onChain: OnChainState | undefined;
  isOnChainLoading: boolean;
  query: QueryArgs | undefined;
  fetchStakeState: ReturnType<typeof vi.fn>;
};

const state = vi.hoisted((): State => ({
  mockedMode: null,
  chainState: { enabled: true, mode: 'all', liquidityTarget: 25 },
  featureFlags: {},
  isLedgerLive: false,
  onChain: { isFastLaneAvailable: true, isSlowLaneAvailable: true },
  isOnChainLoading: false,
  query: undefined,
  fetchStakeState: vi.fn(),
}));

vi.mock('../hooks/l2-stake-qa', () => ({
  useMockedL2StakeMode: () => state.mockedMode,
}));
vi.mock('@tanstack/react-query', () => ({
  useQuery: (args: QueryArgs) => {
    state.query = args;
    return { data: state.onChain, isLoading: state.isOnChainLoading };
  },
}));
vi.mock('config', () => ({
  CHAINS: {},
  // read by the fee helpers the SDK module imports
  config: {},
  useConfig: () => ({
    externalConfig: {
      l2Stake: { perChain: { [CHAIN_ID]: state.chainState } },
      featureFlags: state.featureFlags,
    },
  }),
}));
vi.mock('modules/web3', () => ({
  useDappStatus: () => ({ chainId: CHAIN_ID }),
  useIsLedgerLive: () => state.isLedgerLive,
  getPrettyChainName: () => CHAIN_NAME,
  useLidoSDKL2: () => ({
    l2Stake: { fetchStakeState: state.fetchStakeState },
    chainId: CHAIN_ID,
    isL2Stake: true,
  }),
}));

import { useL2StakeState } from '../hooks/use-l2-stake-state';

const render = () => renderHook(() => useL2StakeState());

beforeEach(() => {
  state.mockedMode = null;
  state.chainState = { enabled: true, mode: 'all', liquidityTarget: 25 };
  state.featureFlags = {};
  state.isLedgerLive = false;
  state.onChain = { isFastLaneAvailable: true, isSlowLaneAvailable: true };
  state.isOnChainLoading = false;
  state.query = undefined;
  state.fetchStakeState.mockReset();
});

describe('useL2StakeState', () => {
  it('offers both lanes when the config and the chain allow them', () => {
    const result = render();
    expect(result.isEnabled).toBe(true);
    expect(result.reason).toBeNull();
    expect(result.fastLane).toEqual({ isAvailable: true, reason: null });
    expect(result.slowLane).toEqual({ isAvailable: true, reason: null });
    expect(result.isOnChainStateLoading).toBe(false);
  });

  it('reads the on-chain state for the current chain', async () => {
    render();
    expect(state.query?.queryKey).toEqual([
      LIDO_L2_STAKING_QUERY_SCOPE,
      'stake-state',
      { chainId: CHAIN_ID },
    ]);
    expect(state.query?.enabled).toBe(true);
    await state.query?.queryFn();
    expect(state.fetchStakeState).toHaveBeenCalled();
  });

  it('closes both lanes on the remote kill switch, with its reason', () => {
    state.chainState = {
      ...state.chainState,
      enabled: false,
      disableReason: 'Maintenance',
    };
    const result = render();
    expect(result.isEnabled).toBe(false);
    expect(result.fastLane).toEqual({
      isAvailable: false,
      reason: 'Maintenance',
    });
    expect(result.slowLane).toEqual({
      isAvailable: false,
      reason: 'Maintenance',
    });
  });

  it('closes both lanes for Ledger Live without the flag', () => {
    state.isLedgerLive = true;
    const result = render();
    expect(result.fastLane.isAvailable).toBe(false);
    expect(result.slowLane.isAvailable).toBe(false);
    expect(result.reason).toContain('Ledger Live');

    state.featureFlags = { ledgerLiveL2: true };
    expect(render().isEnabled).toBe(true);
  });

  it('closes the slow lane in fastLaneOnly mode', () => {
    state.chainState = { ...state.chainState, mode: 'fastLaneOnly' };
    const result = render();
    expect(result.isEnabled).toBe(true);
    expect(result.slowLane.isAvailable).toBe(false);
    expect(result.slowLane.reason).toContain(CHAIN_NAME);
  });

  it('closes the fast lane but keeps the form open in slowLaneOnly mode', () => {
    state.chainState = { ...state.chainState, mode: 'slowLaneOnly' };
    const result = render();
    expect(result.isEnabled).toBe(true);
    expect(result.reason).toBeNull();
    expect(result.fastLane.isAvailable).toBe(false);
    expect(result.fastLane.reason).toContain(CHAIN_NAME);
    expect(result.slowLane.isAvailable).toBe(true);
  });

  it('lets a QA override outrank the remote config mode', () => {
    state.chainState = { ...state.chainState, mode: 'fastLaneOnly' };
    state.mockedMode = 'slowLaneOnly';
    const result = render();
    expect(result.fastLane.isAvailable).toBe(false);
    expect(result.slowLane.isAvailable).toBe(true);
  });

  it('closes a lane paused on chain and keeps the other open', () => {
    state.onChain = { isFastLaneAvailable: false, isSlowLaneAvailable: true };
    let result = render();
    expect(result.isEnabled).toBe(true);
    expect(result.fastLane.isAvailable).toBe(false);
    expect(result.fastLane.reason).toBe(
      `Staking on ${CHAIN_NAME} is temporarily paused`,
    );
    expect(result.slowLane.isAvailable).toBe(true);

    state.onChain = { isFastLaneAvailable: true, isSlowLaneAvailable: false };
    result = render();
    expect(result.isEnabled).toBe(true);
    expect(result.slowLane.isAvailable).toBe(false);
    expect(result.slowLane.reason).toContain('paused');
  });

  it('closes the form only when both lanes are closed', () => {
    state.onChain = { isFastLaneAvailable: false, isSlowLaneAvailable: false };
    const result = render();
    expect(result.isEnabled).toBe(false);
    expect(result.reason).toBe(result.fastLane.reason);
  });

  it('keeps both lanes open while the on-chain state is unknown', () => {
    state.onChain = undefined;
    state.isOnChainLoading = true;
    const result = render();
    expect(result.isEnabled).toBe(true);
    expect(result.slowLane.isAvailable).toBe(true);
    expect(result.isOnChainStateLoading).toBe(true);
  });

  it('lets the kill switch win over the mode and the chain', () => {
    state.chainState = {
      ...state.chainState,
      enabled: false,
      mode: 'fastLaneOnly',
    };
    state.onChain = { isFastLaneAvailable: false, isSlowLaneAvailable: false };
    const result = render();
    expect(result.reason).toBe(
      `Staking is currently not available for ${CHAIN_NAME}`,
    );
    expect(result.slowLane.reason).toBe(result.reason);
  });

  it('parses the liquidity target into wei', () => {
    expect(render().liquidityTargetEth).toBe(25n * 10n ** 18n);
  });
});
