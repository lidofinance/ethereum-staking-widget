import type { Address, Hex } from 'viem';

import {
  LIDO_L2_FAST_STAKE_ETH_GAS_LIMIT_FALLBACK,
  LIDO_L2_FAST_STAKE_WETH_GAS_LIMIT_FALLBACK,
  LIDO_L2_STAKING_QUERY_SCOPE,
  LIDO_L2_WETH_APPROVE_GAS_LIMIT_FALLBACK,
} from 'modules/l2-staking';
import { renderHook } from 'features/stake/shared/__tests__/stake-test-utils';

// Referenced from the hoisted mock factories, so hoisted with them
const { ACCOUNT, LIDO_ADDRESS, ESTIMATE_AMOUNT } = vi.hoisted(() => ({
  ACCOUNT: '0x00000000000000000000000000000000000000aa' as const,
  LIDO_ADDRESS: '0x11d00000000000000000000000000000000011d0' as const,
  ESTIMATE_AMOUNT: 10n ** 15n,
}));
const RECEIVER: Address = '0x00000000000000000000000000000000000000cc';
const WETH: Address = '0x00000000000000000000000000000000000000ee';
const CHAIN_ID = 8453;

const GAS_LIMITS_QUERY = 'fast-stake-gas-limit';
const TXS_QUERY = 'fast-stake-txs';

type StakeArgs = { token: string; amount: bigint };

// The L2StakeModule surface the hook touches
const createModule = () => ({
  fastStakeEthEstimateGas: vi.fn(async ({ token }: StakeArgs) =>
    token === 'ETH' ? 180_000n : 190_000n,
  ),
  approveWethEstimateGas: vi.fn(async () => 40_000n),
  fastStakeEthPopulateTx: vi.fn(async ({ token, amount }: StakeArgs) => ({
    to: RECEIVER,
    data: token === 'ETH' ? '0x01' : '0x02',
    value: token === 'ETH' ? amount : 0n,
  })),
  approveWethPopulateTx: vi.fn(
    async (): Promise<{ to: Address; data?: Hex }> => ({
      to: WETH,
      data: '0x03',
    }),
  ),
});
type Module = ReturnType<typeof createModule>;

type QueryArgs = {
  queryKey: unknown[];
  enabled?: boolean;
  placeholderData?: unknown;
  queryFn: () => Promise<unknown>;
};

type State = {
  isL2Stake: boolean;
  // resolved data by query name
  data: Record<string, unknown>;
  // queries whose fetch failed, by name
  failed: Record<string, boolean>;
  // the useQuery calls of the last render, by query name
  queries: Record<string, QueryArgs>;
  l2Stake: Module | undefined;
};

const state = vi.hoisted((): State => ({
  isL2Stake: true,
  data: {},
  failed: {},
  queries: {},
  l2Stake: undefined,
}));

// Mirrors React Query: the placeholder stands in while a query is pending,
// nothing does after it failed
vi.mock('@tanstack/react-query', () => ({
  useQuery: (args: QueryArgs) => {
    const name = String(args.queryKey[1]);
    state.queries[name] = args;
    const data =
      state.data[name] ??
      (state.failed[name] ? undefined : args.placeholderData);
    return { data };
  },
}));
vi.mock('config', () => ({ config: { ESTIMATE_ACCOUNT: ACCOUNT } }));
vi.mock('config/groups/stake', () => ({ LIDO_ADDRESS }));
vi.mock('modules/web3', () => ({
  ESTIMATE_AMOUNT,
  useLidoSDKL2: () => ({
    l2Stake: state.l2Stake,
    chainId: CHAIN_ID,
    isL2Stake: state.isL2Stake,
  }),
}));

import { useFastStakeGasLimit } from '../use-fast-stake-gas-limit';

const render = () => renderHook(() => useFastStakeGasLimit());

const query = (name: string) => {
  const args = state.queries[name];
  if (!args) throw new Error(`the ${name} query was not set up`);
  return args;
};

const runQuery = (name: string) => {
  render();
  return query(name).queryFn();
};

const l2Module = (): Module => {
  if (!state.l2Stake) throw new Error('module not created');
  return state.l2Stake;
};

const stakeProps = (token: string) => ({
  account: ACCOUNT,
  amount: ESTIMATE_AMOUNT,
  referral: LIDO_ADDRESS,
  minReceiveAmount: 0n,
  token,
});

const estimatedGasLimits = {
  gasLimitEth: 180_000n,
  gasLimitWeth: 190_000n,
  gasLimitWethApprove: 40_000n,
};

const populatedTxs = {
  txEth: {
    account: ACCOUNT,
    to: RECEIVER,
    data: '0x01',
    value: ESTIMATE_AMOUNT,
  },
  txWeth: { account: ACCOUNT, to: RECEIVER, data: '0x02', value: 0n },
  txWethApprove: { account: ACCOUNT, to: WETH, data: '0x03' },
};

const fallbackGasLimits = {
  gasLimitEth: LIDO_L2_FAST_STAKE_ETH_GAS_LIMIT_FALLBACK,
  gasLimitWeth: LIDO_L2_FAST_STAKE_WETH_GAS_LIMIT_FALLBACK,
  gasLimitWethApprove: LIDO_L2_WETH_APPROVE_GAS_LIMIT_FALLBACK,
};

const noTxs = { txEth: undefined, txWeth: undefined, txWethApprove: undefined };

let warn: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  state.isL2Stake = true;
  state.data = {};
  state.failed = {};
  state.queries = {};
  state.l2Stake = createModule();
  warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
});

afterEach(() => {
  warn.mockRestore();
});

describe('useFastStakeGasLimit', () => {
  it('estimates every limit from the estimate account', async () => {
    await expect(runQuery(GAS_LIMITS_QUERY)).resolves.toEqual(
      estimatedGasLimits,
    );
    expect(l2Module().fastStakeEthEstimateGas).toHaveBeenCalledWith(
      stakeProps('ETH'),
    );
    expect(l2Module().fastStakeEthEstimateGas).toHaveBeenCalledWith(
      stakeProps('WETH'),
    );
    expect(l2Module().approveWethEstimateGas).toHaveBeenCalledWith({
      account: ACCOUNT,
      amount: ESTIMATE_AMOUNT,
    });
    expect(warn).not.toHaveBeenCalled();
  });

  it('populates every representative tx from the estimate account', async () => {
    await expect(runQuery(TXS_QUERY)).resolves.toEqual(populatedTxs);
    expect(l2Module().fastStakeEthPopulateTx).toHaveBeenCalledWith(
      stakeProps('ETH'),
    );
    expect(l2Module().fastStakeEthPopulateTx).toHaveBeenCalledWith(
      stakeProps('WETH'),
    );
    expect(l2Module().approveWethPopulateTx).toHaveBeenCalledWith({
      account: ACCOUNT,
      amount: ESTIMATE_AMOUNT,
    });
    expect(warn).not.toHaveBeenCalled();
  });

  it('fails the estimates, after a warning naming the call, when one estimate fails', async () => {
    l2Module().fastStakeEthEstimateGas.mockImplementation(async ({ token }) => {
      if (token === 'ETH') throw new Error('execution reverted');
      return 190_000n;
    });

    await expect(runQuery(GAS_LIMITS_QUERY)).rejects.toThrow(
      'execution reverted',
    );
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]?.[0]).toBe('[fast-stake-gas-limit::eth]');
    // the representative txs are quoted apart and still come through
    await expect(query(TXS_QUERY).queryFn()).resolves.toEqual(populatedTxs);
  });

  it('fails the estimates when the approve estimate fails', async () => {
    l2Module().approveWethEstimateGas.mockRejectedValue(
      new Error('execution reverted'),
    );

    await expect(runQuery(GAS_LIMITS_QUERY)).rejects.toThrow(
      'execution reverted',
    );
    expect(warn.mock.calls[0]?.[0]).toBe(
      '[fast-stake-gas-limit::weth-approve]',
    );
  });

  it('fails the txs, after a warning naming the call, when one cannot be populated', async () => {
    l2Module().fastStakeEthPopulateTx.mockImplementation(
      async ({ token, amount }) => {
        if (token === 'WETH') throw new Error('allowance read failed');
        return { to: RECEIVER, data: '0x01', value: amount };
      },
    );

    await expect(runQuery(TXS_QUERY)).rejects.toThrow('allowance read failed');
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]?.[0]).toBe('[fast-stake-gas-limit::weth-tx]');
    // the estimates are quoted apart and still come through
    await expect(query(GAS_LIMITS_QUERY).queryFn()).resolves.toEqual(
      estimatedGasLimits,
    );
  });

  it('drops a representative tx that carries no calldata', async () => {
    l2Module().approveWethPopulateTx.mockResolvedValue({
      to: WETH,
    });

    await expect(runQuery(TXS_QUERY)).resolves.toEqual({
      ...populatedTxs,
      txWethApprove: undefined,
    });
    expect(warn).not.toHaveBeenCalled();
  });

  it('hands the fallbacks to React Query as placeholder data, serving them while the estimates load', () => {
    expect(render()).toEqual({ ...fallbackGasLimits, ...noTxs });
    expect(query(GAS_LIMITS_QUERY).placeholderData).toEqual(fallbackGasLimits);
    // a representative tx has no stand-in: the cost waits for it
    expect(query(TXS_QUERY).placeholderData).toBeUndefined();
  });

  it('serves the fallbacks after the estimates failed, with the txs that did come through', () => {
    state.failed[GAS_LIMITS_QUERY] = true;
    state.data[TXS_QUERY] = populatedTxs;
    expect(render()).toEqual({ ...fallbackGasLimits, ...populatedTxs });
  });

  it('serves the estimates once they are in', () => {
    state.data[GAS_LIMITS_QUERY] = estimatedGasLimits;
    state.data[TXS_QUERY] = populatedTxs;
    expect(render()).toEqual({ ...estimatedGasLimits, ...populatedTxs });
  });

  it('runs both queries only on an L2 stake chain, keyed by the chain', () => {
    render();
    expect(query(GAS_LIMITS_QUERY).enabled).toBe(true);
    expect(query(GAS_LIMITS_QUERY).queryKey).toEqual([
      LIDO_L2_STAKING_QUERY_SCOPE,
      GAS_LIMITS_QUERY,
      { chainId: CHAIN_ID },
    ]);
    expect(query(TXS_QUERY).enabled).toBe(true);
    expect(query(TXS_QUERY).queryKey).toEqual([
      LIDO_L2_STAKING_QUERY_SCOPE,
      TXS_QUERY,
      { chainId: CHAIN_ID },
    ]);

    state.isL2Stake = false;
    render();
    expect(query(GAS_LIMITS_QUERY).enabled).toBe(false);
    expect(query(TXS_QUERY).enabled).toBe(false);
  });
});
