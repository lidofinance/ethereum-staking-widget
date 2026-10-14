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

type QueryArgs = { queryKey: unknown[]; queryFn: () => Promise<unknown> };

type State = {
  isL2: boolean;
  data: unknown;
  query: QueryArgs | undefined;
  sdk: Sdk | undefined;
};

const state = vi.hoisted((): State => ({
  isL2: false,
  data: undefined,
  query: undefined,
  sdk: undefined,
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: (args: QueryArgs) => {
    state.query = args;
    return { data: state.data };
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

const runQuery = <T>(useHook: () => T) => {
  renderHook(useHook);
  if (!state.query) throw new Error('the gas limit query was not set up');
  return state.query.queryFn();
};

const estimateProps = { value: ESTIMATE_AMOUNT, account: ACCOUNT };
const representativeTx = { account: ACCOUNT, to: TO, data: DATA };

let warn: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  state.isL2 = false;
  state.data = undefined;
  state.query = undefined;
  state.sdk = createSdk();
  warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
});

afterEach(() => {
  warn.mockRestore();
});

describe('useWrapGasLimit', () => {
  describe('on L1', () => {
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
    });

    it('falls back to the ratio-padded ETH wrap limit when the estimate fails', async () => {
      sdk().wrap.wrapEthEstimateGas.mockRejectedValue(new Error('reverted'));
      await expect(runQuery(useWrapGasLimit)).resolves.toMatchObject({
        // WRAP_FROM_ETH_GAS_LIMIT * EXTRA_GAS_TRANSACTION_RATIO
        gasLimitETH: 105_000n,
        gasLimitStETH: 120_000n,
      });
    });

    it('falls back to the L1 stETH wrap limit when the estimate fails', async () => {
      sdk().wrap.wrapStethEstimateGas.mockRejectedValue(new Error('reverted'));
      await expect(runQuery(useWrapGasLimit)).resolves.toMatchObject({
        gasLimitETH: 90_000n,
        gasLimitStETH: WRAP_GAS_LIMIT,
      });
    });

    it('serves the L1 fallbacks until the query resolves', () => {
      expect(renderHook(useWrapGasLimit)).toEqual({
        gasLimitETH: WRAP_FROM_ETH_GAS_LIMIT,
        gasLimitStETH: WRAP_GAS_LIMIT,
        txStETH: undefined,
      });
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
    });

    it('drops the representative tx it cannot populate, keeping the limit', async () => {
      sdk().l2.unwrapStethPopulateTx.mockRejectedValue(new Error('rpc down'));
      await expect(runQuery(useWrapGasLimit)).resolves.toMatchObject({
        gasLimitStETH: 80_000n,
        txStETH: undefined,
      });
      expect(warn).toHaveBeenCalledTimes(1);
    });

    it('falls back to the L2 stETH wrap limit when the estimate fails', async () => {
      sdk().l2.unwrapStethEstimateGas.mockRejectedValue(new Error('reverted'));
      await expect(runQuery(useWrapGasLimit)).resolves.toMatchObject({
        gasLimitStETH: WRAP_L2_GAS_LIMIT,
        txStETH: representativeTx,
      });
    });

    it('serves the L2 fallbacks until the query resolves', () => {
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
    expect(state.query?.queryKey).toEqual([
      'wrap-gas-limit',
      L1_CHAIN_ID,
      false,
    ]);

    state.isL2 = true;
    renderHook(useWrapGasLimit);
    expect(state.query?.queryKey).toEqual([
      'wrap-gas-limit',
      L2_CHAIN_ID,
      true,
    ]);
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

    it('falls back to the L1 approve limit when the estimate fails', async () => {
      sdk().wstETH.estimateApprove.mockRejectedValue(new Error('reverted'));
      await expect(runQuery(useApproveGasLimit)).resolves.toEqual({
        gasLimit: WSTETH_APPROVE_GAS_LIMIT,
      });
    });

    it('serves the L1 fallback until the query resolves', () => {
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

    it('falls back to the L2 approve limit without a tx when either call fails', async () => {
      sdk().l2.approveWstethForWrapPopulateTx.mockRejectedValue(
        new Error('rpc down'),
      );
      await expect(runQuery(useApproveGasLimit)).resolves.toEqual({
        gasLimit: STETH_L2_APPROVE_GAS_LIMIT,
      });
      expect(warn).toHaveBeenCalledTimes(1);
    });

    it('serves the L2 fallback until the query resolves', () => {
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
    expect(state.query?.queryKey).toEqual([
      'approve-wrap-gas-limit',
      false,
      L1_CHAIN_ID,
    ]);
  });
});
