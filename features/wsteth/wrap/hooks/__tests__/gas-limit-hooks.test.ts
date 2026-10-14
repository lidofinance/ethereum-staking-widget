import type { Address, Hex } from 'viem';

import {
  STETH_L2_APPROVE_GAS_LIMIT,
  WRAP_FROM_ETH_GAS_LIMIT,
  WRAP_GAS_LIMIT,
  WRAP_L2_GAS_LIMIT,
  WSTETH_APPROVE_GAS_LIMIT,
} from 'consts/tx';
import { renderHook } from 'features/stake/shared/__tests__/stake-test-utils';

// Referenced from the hoisted mock factories, so hoisted with them
const { ACCOUNT, ESTIMATE_AMOUNT } = vi.hoisted(() => ({
  ACCOUNT: '0x00000000000000000000000000000000000000aa' as const,
  ESTIMATE_AMOUNT: 10n ** 15n,
}));
const TO: Address = '0x00000000000000000000000000000000000000cc';
const SPENDER: Address = '0x00000000000000000000000000000000000000dd';
const DATA: Hex = '0xabcdef';
const L1_CHAIN_ID = 1;
const L2_CHAIN_ID = 10;
// WRAP_FROM_ETH_GAS_LIMIT * EXTRA_GAS_TRANSACTION_RATIO
const WRAP_FROM_ETH_GAS_LIMIT_PADDED = 105_000n;

type PopulatedTx = { to: Address; data?: Hex };

// The SDK surface the hooks touch, on L1 (wrap, wstETH) and on L2 (l2)
const createSdk = () => ({
  wrap: {
    wrapEthEstimateGas: vi.fn(async () => 90_000n),
    wrapStethEstimateGas: vi.fn(async () => 120_000n),
  },
  wstETH: {
    contractAddress: vi.fn(async () => SPENDER),
    estimateApprove: vi.fn(async () => 60_000n),
  },
  l2: {
    unwrapStethEstimateGas: vi.fn(async () => 80_000n),
    unwrapStethPopulateTx: vi.fn(async (): Promise<PopulatedTx> => ({
      to: TO,
      data: DATA,
    })),
    approveWstethForWrapEstimateGas: vi.fn(async () => 45_000n),
    approveWstethForWrapPopulateTx: vi.fn(async (): Promise<PopulatedTx> => ({
      to: TO,
      data: DATA,
    })),
  },
});
type Sdk = ReturnType<typeof createSdk>;

type QueryArgs = {
  queryKey: unknown[];
  placeholderData?: unknown;
  queryFn: () => Promise<unknown>;
};

type State = {
  isL2: boolean;
  data: unknown;
  // the last fetch failed: React Query then serves no placeholder
  failed: boolean;
  query: QueryArgs | undefined;
  sdk: Sdk | undefined;
};

const state = vi.hoisted((): State => ({
  isL2: false,
  data: undefined,
  failed: false,
  query: undefined,
  sdk: undefined,
}));

// Mirrors React Query: the placeholder stands in while the query is pending,
// nothing does after it failed
vi.mock('@tanstack/react-query', () => ({
  useQuery: (args: QueryArgs) => {
    state.query = args;
    return {
      data: state.data ?? (state.failed ? undefined : args.placeholderData),
    };
  },
}));
vi.mock('config', () => ({
  config: {
    ESTIMATE_ACCOUNT: ACCOUNT,
    EXTRA_GAS_TRANSACTION_RATIO: 1.05,
    PRECISION: 100,
  },
}));
vi.mock('modules/web3', () => ({
  ESTIMATE_AMOUNT,
  useDappStatus: () => ({
    chainId: state.isL2 ? L2_CHAIN_ID : L1_CHAIN_ID,
    isDappActiveOnL2: state.isL2,
  }),
  useLidoSDK: () => ({ wrap: state.sdk?.wrap, wstETH: state.sdk?.wstETH }),
  useLidoSDKL2: () => ({ l2: state.sdk?.l2, isL2Wrap: state.isL2 }),
}));

import { useApproveGasLimit } from '../use-approve-gas-limit';
import { useWrapGasLimit } from '../use-wrap-gas-limit';

const sdk = (): Sdk => {
  if (!state.sdk) throw new Error('sdk not created');
  return state.sdk;
};

const query = () => {
  if (!state.query) throw new Error('the gas limit query was not set up');
  return state.query;
};

const runQuery = <T>(useHook: () => T) => {
  renderHook(useHook);
  return query().queryFn();
};

const estimateProps = { value: ESTIMATE_AMOUNT, account: ACCOUNT };
const representativeTx = { account: ACCOUNT, to: TO, data: DATA };

let warn: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  state.isL2 = false;
  state.data = undefined;
  state.failed = false;
  state.query = undefined;
  state.sdk = createSdk();
  warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
});

afterEach(() => {
  warn.mockRestore();
});

describe('useWrapGasLimit', () => {
  describe('on L1', () => {
    const fallbacks = {
      gasLimitETH: WRAP_FROM_ETH_GAS_LIMIT_PADDED,
      gasLimitStETH: WRAP_GAS_LIMIT,
      txStETH: undefined,
    };

    it('estimates the ETH and the stETH wrap and carries no representative tx', async () => {
      await expect(runQuery(useWrapGasLimit)).resolves.toEqual({
        gasLimitETH: 90_000n,
        gasLimitStETH: 120_000n,
        txStETH: undefined,
      });
      expect(sdk().wrap.wrapEthEstimateGas).toHaveBeenCalledWith(estimateProps);
      expect(sdk().wrap.wrapStethEstimateGas).toHaveBeenCalledWith(
        estimateProps,
      );
      expect(sdk().l2.unwrapStethEstimateGas).not.toHaveBeenCalled();
      expect(sdk().l2.unwrapStethPopulateTx).not.toHaveBeenCalled();
      expect(warn).not.toHaveBeenCalled();
    });

    it('fails the query, after a warning naming the call, when the ETH estimate fails', async () => {
      sdk().wrap.wrapEthEstimateGas.mockRejectedValue(new Error('reverted'));
      await expect(runQuery(useWrapGasLimit)).rejects.toThrow('reverted');
      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn.mock.calls[0]?.[0]).toBe('[wrap-gas-limit::eth]');
    });

    it('fails the query when the stETH estimate fails', async () => {
      sdk().wrap.wrapStethEstimateGas.mockRejectedValue(new Error('reverted'));
      await expect(runQuery(useWrapGasLimit)).rejects.toThrow('reverted');
      expect(warn.mock.calls[0]?.[0]).toBe('[wrap-gas-limit::steth]');
    });

    it('hands the L1 fallbacks to React Query as placeholder data, serving them while the estimates load', () => {
      expect(renderHook(useWrapGasLimit)).toEqual(fallbacks);
      expect(query().placeholderData).toEqual(fallbacks);
    });

    it('serves the L1 fallbacks after the estimates failed', () => {
      state.failed = true;
      expect(renderHook(useWrapGasLimit)).toEqual(fallbacks);
    });
  });

  describe('on L2', () => {
    beforeEach(() => {
      state.isL2 = true;
    });

    it('skips the ETH wrap and populates the stETH wrap tx for the fee quote', async () => {
      await expect(runQuery(useWrapGasLimit)).resolves.toEqual({
        gasLimitETH: null,
        gasLimitStETH: 80_000n,
        txStETH: representativeTx,
      });
      expect(sdk().l2.unwrapStethEstimateGas).toHaveBeenCalledWith(
        estimateProps,
      );
      expect(sdk().l2.unwrapStethPopulateTx).toHaveBeenCalledWith(
        estimateProps,
      );
      expect(sdk().wrap.wrapEthEstimateGas).not.toHaveBeenCalled();
      expect(sdk().wrap.wrapStethEstimateGas).not.toHaveBeenCalled();
    });

    it('drops the representative tx without calldata', async () => {
      sdk().l2.unwrapStethPopulateTx.mockResolvedValue({ to: TO });
      await expect(runQuery(useWrapGasLimit)).resolves.toMatchObject({
        gasLimitStETH: 80_000n,
        txStETH: undefined,
      });
      expect(warn).not.toHaveBeenCalled();
    });

    it('fails the query when the stETH wrap tx cannot be populated', async () => {
      sdk().l2.unwrapStethPopulateTx.mockRejectedValue(new Error('rpc down'));
      await expect(runQuery(useWrapGasLimit)).rejects.toThrow('rpc down');
      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn.mock.calls[0]?.[0]).toBe('[wrap-gas-limit::steth-tx]');
    });

    it('fails the query when the stETH estimate fails', async () => {
      sdk().l2.unwrapStethEstimateGas.mockRejectedValue(new Error('reverted'));
      await expect(runQuery(useWrapGasLimit)).rejects.toThrow('reverted');
      expect(warn.mock.calls[0]?.[0]).toBe('[wrap-gas-limit::steth]');
    });

    it('hands the L2 fallbacks to React Query as placeholder data, reading the skipped ETH limit as its fallback', () => {
      expect(renderHook(useWrapGasLimit)).toEqual({
        gasLimitETH: WRAP_FROM_ETH_GAS_LIMIT,
        gasLimitStETH: WRAP_L2_GAS_LIMIT,
        txStETH: undefined,
      });
      expect(query().placeholderData).toEqual({
        gasLimitETH: null,
        gasLimitStETH: WRAP_L2_GAS_LIMIT,
        txStETH: undefined,
      });
    });

    it('serves the L2 fallbacks after the estimates failed', () => {
      state.failed = true;
      expect(renderHook(useWrapGasLimit)).toEqual({
        gasLimitETH: WRAP_FROM_ETH_GAS_LIMIT,
        gasLimitStETH: WRAP_L2_GAS_LIMIT,
        txStETH: undefined,
      });
    });

    it('serves the estimates, reading the skipped ETH limit as its fallback', () => {
      state.data = {
        gasLimitETH: null,
        gasLimitStETH: 80_000n,
        txStETH: representativeTx,
      };
      expect(renderHook(useWrapGasLimit)).toEqual({
        gasLimitETH: WRAP_FROM_ETH_GAS_LIMIT,
        gasLimitStETH: 80_000n,
        txStETH: representativeTx,
      });
    });
  });

  it('keys the query on the chain and the wrap side', () => {
    renderHook(useWrapGasLimit);
    expect(query().queryKey).toEqual(['wrap-gas-limit', L1_CHAIN_ID, false]);

    state.isL2 = true;
    renderHook(useWrapGasLimit);
    expect(query().queryKey).toEqual(['wrap-gas-limit', L2_CHAIN_ID, true]);
  });
});

describe('useApproveGasLimit', () => {
  describe('on L1', () => {
    it('estimates the approve to the wstETH contract and carries no tx', async () => {
      await expect(runQuery(useApproveGasLimit)).resolves.toEqual({
        gasLimit: 60_000n,
      });
      expect(sdk().wstETH.estimateApprove).toHaveBeenCalledWith({
        amount: ESTIMATE_AMOUNT,
        to: SPENDER,
        account: ACCOUNT,
      });
      expect(sdk().l2.approveWstethForWrapEstimateGas).not.toHaveBeenCalled();
    });

    it('fails the query, after a warning, when the estimate fails', async () => {
      sdk().wstETH.estimateApprove.mockRejectedValue(new Error('reverted'));
      await expect(runQuery(useApproveGasLimit)).rejects.toThrow('reverted');
      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn.mock.calls[0]?.[0]).toBe('[approve-wrap-gas-limit]');
    });

    it('hands the L1 fallback to React Query as placeholder data, serving it while the estimate loads', () => {
      expect(renderHook(useApproveGasLimit)).toEqual({
        gasLimit: WSTETH_APPROVE_GAS_LIMIT,
        tx: undefined,
      });
      expect(query().placeholderData).toEqual({
        gasLimit: WSTETH_APPROVE_GAS_LIMIT,
      });
    });

    it('serves the L1 fallback after the estimate failed', () => {
      state.failed = true;
      expect(renderHook(useApproveGasLimit)).toEqual({
        gasLimit: WSTETH_APPROVE_GAS_LIMIT,
        tx: undefined,
      });
    });
  });

  describe('on L2', () => {
    beforeEach(() => {
      state.isL2 = true;
    });

    it('estimates the wstETH approve with its representative tx', async () => {
      await expect(runQuery(useApproveGasLimit)).resolves.toEqual({
        gasLimit: 45_000n,
        tx: representativeTx,
      });
      expect(sdk().l2.approveWstethForWrapEstimateGas).toHaveBeenCalledWith(
        estimateProps,
      );
      expect(sdk().l2.approveWstethForWrapPopulateTx).toHaveBeenCalledWith(
        estimateProps,
      );
      expect(sdk().wstETH.estimateApprove).not.toHaveBeenCalled();
    });

    it('drops the representative tx without calldata', async () => {
      sdk().l2.approveWstethForWrapPopulateTx.mockResolvedValue({ to: TO });
      await expect(runQuery(useApproveGasLimit)).resolves.toEqual({
        gasLimit: 45_000n,
        tx: undefined,
      });
    });

    it('fails the query when either call fails', async () => {
      sdk().l2.approveWstethForWrapPopulateTx.mockRejectedValue(
        new Error('rpc down'),
      );
      await expect(runQuery(useApproveGasLimit)).rejects.toThrow('rpc down');
      expect(warn).toHaveBeenCalledTimes(1);
    });

    it('hands the L2 fallback to React Query as placeholder data', () => {
      expect(renderHook(useApproveGasLimit)).toEqual({
        gasLimit: STETH_L2_APPROVE_GAS_LIMIT,
        tx: undefined,
      });
      expect(query().placeholderData).toEqual({
        gasLimit: STETH_L2_APPROVE_GAS_LIMIT,
      });
    });

    it('serves the L2 fallback after the estimate failed', () => {
      state.failed = true;
      expect(renderHook(useApproveGasLimit)).toEqual({
        gasLimit: STETH_L2_APPROVE_GAS_LIMIT,
        tx: undefined,
      });
    });

    it('serves the estimate once it is in', () => {
      state.data = { gasLimit: 45_000n, tx: representativeTx };
      expect(renderHook(useApproveGasLimit)).toEqual({
        gasLimit: 45_000n,
        tx: representativeTx,
      });
    });
  });

  it('keys the query on the chain and the L2 side', () => {
    renderHook(useApproveGasLimit);
    expect(query().queryKey).toEqual([
      'approve-wrap-gas-limit',
      false,
      L1_CHAIN_ID,
    ]);
  });
});
