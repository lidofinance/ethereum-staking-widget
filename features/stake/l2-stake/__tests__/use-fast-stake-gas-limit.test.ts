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

type StakeArgs = { token: string; amount: bigint };

// The L2StakeModule surface the hook touches
const createModule = () => ({
  fastStakeEthEstimateGas: vi.fn(async ({ token }: StakeArgs) =>
    token === 'ETH' ? 180_000n : 190_000n,
  ),
  approveWethForFastStakeEstimateGas: vi.fn(async () => 40_000n),
  fastStakeEthPopulateTx: vi.fn(async ({ token, amount }: StakeArgs) => ({
    to: RECEIVER,
    data: token === 'ETH' ? '0x01' : '0x02',
    value: token === 'ETH' ? amount : 0n,
  })),
  approveWethForFastStakePopulateTx: vi.fn(
    async (): Promise<{ to: Address; data?: Hex }> => ({
      to: WETH,
      data: '0x03',
    }),
  ),
});
type Module = ReturnType<typeof createModule>;

type GasLimitData = ReturnType<typeof useFastStakeGasLimit>;
type QueryArgs = {
  queryKey: unknown[];
  enabled?: boolean;
  queryFn: () => Promise<GasLimitData>;
};

type State = {
  isL2Stake: boolean;
  data: unknown;
  query: QueryArgs | undefined;
  l2Stake: Module | undefined;
};

const state = vi.hoisted((): State => ({
  isL2Stake: true,
  data: undefined,
  query: undefined,
  l2Stake: undefined,
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: (args: QueryArgs) => {
    state.query = args;
    return { data: state.data };
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

import { useFastStakeGasLimit } from '../hooks/use-fast-stake-gas-limit';

const render = () => renderHook(() => useFastStakeGasLimit());

const runQuery = () => {
  render();
  if (!state.query) throw new Error('the gas limit query was not set up');
  return state.query.queryFn();
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

const estimated = {
  gasLimitEth: 180_000n,
  gasLimitWeth: 190_000n,
  gasLimitWethApprove: 40_000n,
  txEth: {
    account: ACCOUNT,
    to: RECEIVER,
    data: '0x01',
    value: ESTIMATE_AMOUNT,
  },
  txWeth: { account: ACCOUNT, to: RECEIVER, data: '0x02', value: 0n },
  txWethApprove: { account: ACCOUNT, to: WETH, data: '0x03' },
};

const fallbacks = {
  gasLimitEth: LIDO_L2_FAST_STAKE_ETH_GAS_LIMIT_FALLBACK,
  gasLimitWeth: LIDO_L2_FAST_STAKE_WETH_GAS_LIMIT_FALLBACK,
  gasLimitWethApprove: LIDO_L2_WETH_APPROVE_GAS_LIMIT_FALLBACK,
  txEth: undefined,
  txWeth: undefined,
  txWethApprove: undefined,
};

let warn: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  state.isL2Stake = true;
  state.data = undefined;
  state.query = undefined;
  state.l2Stake = createModule();
  warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
});

afterEach(() => {
  warn.mockRestore();
});

describe('useFastStakeGasLimit', () => {
  it('estimates every limit and populates every representative tx from the estimate account', async () => {
    await expect(runQuery()).resolves.toEqual(estimated);

    expect(l2Module().fastStakeEthEstimateGas).toHaveBeenCalledWith(
      stakeProps('ETH'),
    );
    expect(l2Module().fastStakeEthEstimateGas).toHaveBeenCalledWith(
      stakeProps('WETH'),
    );
    expect(l2Module().approveWethForFastStakeEstimateGas).toHaveBeenCalledWith({
      account: ACCOUNT,
      amount: ESTIMATE_AMOUNT,
    });
    expect(warn).not.toHaveBeenCalled();
  });

  it('falls back for the ETH stake alone when its estimate fails', async () => {
    l2Module().fastStakeEthEstimateGas.mockImplementation(async ({ token }) => {
      if (token === 'ETH') throw new Error('execution reverted');
      return 190_000n;
    });

    await expect(runQuery()).resolves.toEqual({
      ...estimated,
      gasLimitEth: LIDO_L2_FAST_STAKE_ETH_GAS_LIMIT_FALLBACK,
    });
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]?.[0]).toBe('[fast-stake-gas-limit::eth]');
  });

  it('falls back for the WETH stake alone when its estimate fails', async () => {
    l2Module().fastStakeEthEstimateGas.mockImplementation(async ({ token }) => {
      if (token === 'WETH') throw new Error('execution reverted');
      return 180_000n;
    });

    await expect(runQuery()).resolves.toEqual({
      ...estimated,
      gasLimitWeth: LIDO_L2_FAST_STAKE_WETH_GAS_LIMIT_FALLBACK,
    });
  });

  it('falls back for the WETH approve alone when its estimate fails', async () => {
    l2Module().approveWethForFastStakeEstimateGas.mockRejectedValue(
      new Error('execution reverted'),
    );

    await expect(runQuery()).resolves.toEqual({
      ...estimated,
      gasLimitWethApprove: LIDO_L2_WETH_APPROVE_GAS_LIMIT_FALLBACK,
    });
  });

  it('drops the representative tx it cannot populate, keeping the gas limit', async () => {
    l2Module().fastStakeEthPopulateTx.mockImplementation(
      async ({ token, amount }) => {
        if (token === 'WETH') throw new Error('allowance read failed');
        return { to: RECEIVER, data: '0x01', value: amount };
      },
    );

    await expect(runQuery()).resolves.toEqual({
      ...estimated,
      txWeth: undefined,
    });
    expect(warn.mock.calls[0]?.[0]).toBe('[fast-stake-gas-limit::weth-tx]');
  });

  it('drops a representative tx that carries no calldata', async () => {
    l2Module().approveWethForFastStakePopulateTx.mockResolvedValue({
      to: WETH,
    });

    await expect(runQuery()).resolves.toEqual({
      ...estimated,
      txWethApprove: undefined,
    });
    expect(warn).not.toHaveBeenCalled();
  });

  it('serves the fallbacks until the query resolves', () => {
    expect(render()).toEqual(fallbacks);
  });

  it('serves the estimates once they are in', () => {
    state.data = estimated;
    expect(render()).toEqual(estimated);
  });

  it('runs only on an L2 stake chain, keyed by the chain', () => {
    render();
    expect(state.query?.enabled).toBe(true);
    expect(state.query?.queryKey).toEqual([
      LIDO_L2_STAKING_QUERY_SCOPE,
      'fast-stake-gas-limit',
      { chainId: CHAIN_ID },
    ]);

    state.isL2Stake = false;
    render();
    expect(state.query?.enabled).toBe(false);
  });
});
