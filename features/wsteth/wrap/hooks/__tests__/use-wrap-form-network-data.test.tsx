import type { Address, Hex } from 'viem';

import { renderHook } from 'features/stake/shared/__tests__/stake-test-utils';

// Referenced from the hoisted mock factories, so hoisted with them
const { BALANCE_PADDING } = vi.hoisted(() => ({
  BALANCE_PADDING: 10n ** 16n,
}));
const P = 10n ** 18n;
const ETH_BALANCE = 5n * P;
const STETH_BALANCE = 3n * P;
const WSTETH_BALANCE = 2n * P;
const STAKE_LIMIT = 100n * P;
const MAX_ETH = 4n * P;
const WRAP_COST = 7n * 10n ** 14n;

const representativeTx = {
  account: '0x00000000000000000000000000000000000000aa' as Address,
  to: '0x00000000000000000000000000000000000000cc' as Address,
  data: '0xabcdef' as Hex,
};

const state = vi.hoisted(() => ({
  isSmartAccount: false,
  gasLimits: {},
  useMaxTxCost: vi.fn(),
  useTokenMaxAmount: vi.fn(),
  refetch: {
    eth: vi.fn(async () => undefined),
    steth: vi.fn(async () => undefined),
    wsteth: vi.fn(async () => undefined),
    stakeLimit: vi.fn(async () => undefined),
  },
}));

vi.mock('../use-wrap-gas-limit', () => ({
  useWrapGasLimit: () => state.gasLimits,
}));
vi.mock('modules/web3', () => ({
  BALANCE_PADDING,
  useIsSmartAccount: () => ({
    isSmartAccount: state.isSmartAccount,
    isLoading: false,
  }),
  useEthereumBalance: () => ({ data: ETH_BALANCE, refetch: state.refetch.eth }),
  useStethBalance: () => ({
    data: STETH_BALANCE,
    refetch: state.refetch.steth,
  }),
  useWstethBalance: () => ({
    data: WSTETH_BALANCE,
    refetch: state.refetch.wsteth,
  }),
  useMaxTxCost: (args: unknown) => state.useMaxTxCost(args),
}));
vi.mock('shared/hooks', () => ({
  useStakingLimitInfo: () => ({
    data: { currentStakeLimit: STAKE_LIMIT },
    refetch: state.refetch.stakeLimit,
  }),
}));
vi.mock('shared/hooks/use-token-max-amount', () => ({
  useTokenMaxAmount: (args: unknown) => state.useTokenMaxAmount(args),
}));

import { useWrapFormNetworkData } from '../use-wrap-form-network-data';

const render = () => renderHook(useWrapFormNetworkData);

beforeEach(() => {
  state.isSmartAccount = false;
  state.gasLimits = {
    gasLimitETH: 100_000n,
    gasLimitStETH: 80_000n,
    txStETH: representativeTx,
  };
  state.useMaxTxCost.mockReset().mockReturnValue({ maxTxCost: WRAP_COST });
  state.useTokenMaxAmount.mockReset().mockReturnValue(MAX_ETH);
  Object.values(state.refetch).forEach((refetch) => refetch.mockClear());
});

describe('useWrapFormNetworkData', () => {
  it('prices the stETH wrap with its representative tx, so an L2 quote carries the L1 data fee', () => {
    const data = render();
    expect(state.useMaxTxCost).toHaveBeenCalledWith({
      gasLimit: 80_000n,
      tx: representativeTx,
    });
    expect(data.wrapEthGasCost).toBe(WRAP_COST);
    expect(data).toMatchObject({
      gasLimitETH: 100_000n,
      gasLimitStETH: 80_000n,
      txStETH: representativeTx,
    });
  });

  it('leaves the wrap cost undefined while the quote is pending', () => {
    state.useMaxTxCost.mockReturnValue({ maxTxCost: undefined });
    expect(render().wrapEthGasCost).toBeUndefined();
  });

  it('sizes the ETH Max for an EOA from the ETH wrap limit, padded', () => {
    expect(render().maxAmountETH).toBe(MAX_ETH);
    expect(state.useTokenMaxAmount).toHaveBeenCalledWith({
      balance: ETH_BALANCE,
      limit: STAKE_LIMIT,
      isPadded: true,
      gasLimit: 100_000n,
      padding: BALANCE_PADDING,
      isLoading: false,
    });
  });

  it('does not pad the ETH Max for a smart account', () => {
    state.isSmartAccount = true;
    render();
    expect(state.useTokenMaxAmount).toHaveBeenCalledWith(
      expect.objectContaining({ isPadded: false }),
    );
  });

  it('exposes the balances and the stake limit', () => {
    expect(render()).toMatchObject({
      ethBalance: ETH_BALANCE,
      stethBalance: STETH_BALANCE,
      wstethBalance: WSTETH_BALANCE,
      stakeLimitInfo: { currentStakeLimit: STAKE_LIMIT },
      isSmartAccount: false,
    });
  });

  it('revalidates every balance and the stake limit together', async () => {
    await render().revalidateWrapFormData();
    Object.values(state.refetch).forEach((refetch) =>
      expect(refetch).toHaveBeenCalledTimes(1),
    );
  });
});
