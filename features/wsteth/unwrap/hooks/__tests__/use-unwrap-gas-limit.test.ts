import type { Address, Hex } from 'viem';

import { UNWRAP_GAS_LIMIT, UNWRAP_L2_GAS_LIMIT } from 'consts/tx';
import { renderHook } from 'features/stake/shared/__tests__/stake-test-utils';

// Referenced from the hoisted mock factories, so hoisted with them
const { ACCOUNT, ESTIMATE_AMOUNT } = vi.hoisted(() => ({
  ACCOUNT: '0x00000000000000000000000000000000000000aa' as const,
  ESTIMATE_AMOUNT: 10n ** 15n,
}));
const TO: Address = '0x00000000000000000000000000000000000000cc';
const DATA: Hex = '0xabcdef';
const L1_CHAIN_ID = 1;
const L2_CHAIN_ID = 10;

type PopulatedTx = { to: Address; data?: Hex };

const createSdk = () => ({
  wrap: { unwrapEstimateGas: vi.fn(async () => 110_000n) },
  l2: {
    wrapWstethToStethEstimateGas: vi.fn(async () => 70_000n),
    wrapWstethToStethPopulateTx: vi.fn(async (): Promise<PopulatedTx> => ({
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
vi.mock('config', () => ({ config: { ESTIMATE_ACCOUNT: ACCOUNT } }));
vi.mock('modules/web3', () => ({
  ESTIMATE_AMOUNT,
  useDappStatus: () => ({
    chainId: state.isL2 ? L2_CHAIN_ID : L1_CHAIN_ID,
    isDappActiveOnL2: state.isL2,
  }),
  useLidoSDK: () => ({ wrap: state.sdk?.wrap }),
  useLidoSDKL2: () => ({ l2: state.sdk?.l2, isL2Wrap: state.isL2 }),
}));

import { useUnwrapGasLimit } from '../use-unwrap-gas-limit';

const sdk = (): Sdk => {
  if (!state.sdk) throw new Error('sdk not created');
  return state.sdk;
};

const query = () => {
  if (!state.query) throw new Error('the gas limit query was not set up');
  return state.query;
};

const runQuery = () => {
  renderHook(useUnwrapGasLimit);
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

describe('useUnwrapGasLimit', () => {
  describe('on L1', () => {
    it('estimates the unwrap and carries no representative tx', async () => {
      await expect(runQuery()).resolves.toEqual({ gasLimit: 110_000n });
      expect(sdk().wrap.unwrapEstimateGas).toHaveBeenCalledWith(estimateProps);
      expect(sdk().l2.wrapWstethToStethEstimateGas).not.toHaveBeenCalled();
    });

    it('fails the query, after a warning, when the estimate fails', async () => {
      sdk().wrap.unwrapEstimateGas.mockRejectedValue(new Error('reverted'));
      await expect(runQuery()).rejects.toThrow('reverted');
      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn.mock.calls[0]?.[0]).toBe('[unwrap-gas-limit]');
    });

    it('hands the L1 fallback to React Query as placeholder data, serving it while the estimate loads', () => {
      expect(renderHook(useUnwrapGasLimit)).toEqual({
        gasLimit: UNWRAP_GAS_LIMIT,
        tx: undefined,
      });
      expect(query().placeholderData).toEqual({ gasLimit: UNWRAP_GAS_LIMIT });
    });

    it('serves the L1 fallback after the estimate failed', () => {
      state.failed = true;
      expect(renderHook(useUnwrapGasLimit)).toEqual({
        gasLimit: UNWRAP_GAS_LIMIT,
        tx: undefined,
      });
    });
  });

  describe('on L2', () => {
    beforeEach(() => {
      state.isL2 = true;
    });

    it('estimates the wstETH-to-stETH wrap with its representative tx', async () => {
      await expect(runQuery()).resolves.toEqual({
        gasLimit: 70_000n,
        tx: representativeTx,
      });
      expect(sdk().l2.wrapWstethToStethEstimateGas).toHaveBeenCalledWith(
        estimateProps,
      );
      expect(sdk().l2.wrapWstethToStethPopulateTx).toHaveBeenCalledWith(
        estimateProps,
      );
      expect(sdk().wrap.unwrapEstimateGas).not.toHaveBeenCalled();
    });

    it('drops the representative tx without calldata', async () => {
      sdk().l2.wrapWstethToStethPopulateTx.mockResolvedValue({ to: TO });
      await expect(runQuery()).resolves.toEqual({
        gasLimit: 70_000n,
        tx: undefined,
      });
    });

    it('fails the query when either call fails', async () => {
      sdk().l2.wrapWstethToStethPopulateTx.mockRejectedValue(
        new Error('rpc down'),
      );
      await expect(runQuery()).rejects.toThrow('rpc down');
      expect(warn).toHaveBeenCalledTimes(1);
    });

    it('hands the L2 fallback to React Query as placeholder data', () => {
      expect(renderHook(useUnwrapGasLimit)).toEqual({
        gasLimit: UNWRAP_L2_GAS_LIMIT,
        tx: undefined,
      });
      expect(query().placeholderData).toEqual({
        gasLimit: UNWRAP_L2_GAS_LIMIT,
      });
    });

    it('serves the L2 fallback after the estimate failed', () => {
      state.failed = true;
      expect(renderHook(useUnwrapGasLimit)).toEqual({
        gasLimit: UNWRAP_L2_GAS_LIMIT,
        tx: undefined,
      });
    });

    it('serves the estimate once it is in', () => {
      state.data = { gasLimit: 70_000n, tx: representativeTx };
      expect(renderHook(useUnwrapGasLimit)).toEqual({
        gasLimit: 70_000n,
        tx: representativeTx,
      });
    });
  });

  it('keys the query on the L2 side and the chain', () => {
    renderHook(useUnwrapGasLimit);
    expect(query().queryKey).toEqual(['unwrap-gas-limit', false, L1_CHAIN_ID]);

    state.isL2 = true;
    renderHook(useUnwrapGasLimit);
    expect(query().queryKey).toEqual(['unwrap-gas-limit', true, L2_CHAIN_ID]);
  });
});
