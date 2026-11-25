import type { Address, Hex } from 'viem';

import { CHAINS } from 'config/chains';
import { renderHook } from 'features/stake/shared/__tests__/stake-test-utils';

import type { TxFees } from '../types';

type QueryArgs = {
  queryKey: [string, Record<string, unknown>];
  enabled?: boolean;
  queryFn: () => Promise<unknown>;
};

type QueryResult = {
  data?: unknown;
  isLoading?: boolean;
  error?: unknown;
  isFetching?: boolean;
  refetch?: () => Promise<unknown>;
};

type State = {
  dappChainId: number;
  isAA: boolean;
  publicClient: object | undefined;
  // what React Query hands back, by the first element of the query key
  queries: Record<string, QueryResult>;
  // every useQuery call of the render, in order
  calls: QueryArgs[];
};

const state = vi.hoisted((): State => ({
  dappChainId: 1,
  isAA: false,
  publicClient: {},
  queries: {},
  calls: [],
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: (args: QueryArgs) => {
    state.calls.push(args);
    return {
      data: undefined,
      isLoading: false,
      error: null,
      isFetching: false,
      refetch: vi.fn(async () => undefined),
      ...state.queries[args.queryKey[0]],
    };
  },
}));
vi.mock('wagmi', () => ({ usePublicClient: () => state.publicClient }));
vi.mock('modules/web3/hooks/use-dapp-status', () => ({
  useDappStatus: () => ({ chainId: state.dappChainId }),
}));
vi.mock('modules/web3/hooks/use-aa', () => ({
  useAA: () => ({ isAA: state.isAA }),
}));
vi.mock('../estimate', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../estimate')>()),
  estimateMaxFee: vi.fn(),
  estimateTxFees: vi.fn(),
}));

import { estimateMaxFee, estimateTxFees } from '../estimate';
import { useMaxGasPrice } from '../hooks/use-max-gas-price';
import { useMaxTxCost } from '../hooks/use-max-tx-cost';

const GAS_LIMIT = 200_000n;
// the chain-wide fee-history max price
const PRICE = 30n * 10n ** 9n;
const L1_FEE = 5n * 10n ** 14n;
// the linea_estimateGas quote
const QUOTED_PRICE = 7n * 10n ** 9n;
const QUOTED_GAS = 250_000n;

const tx = {
  account: '0x1111111111111111111111111111111111111111' as Address,
  to: '0x2222222222222222222222222222222222222222' as Address,
  data: '0xabcdef' as Hex,
  value: 1000n,
};

const feeHistory = (maxFeePerGas?: bigint, rest: QueryResult = {}) => {
  state.queries['max-gas-price'] = {
    data:
      maxFeePerGas === undefined
        ? undefined
        : { lastBaseFeePerGas: 0n, maxPriorityFeePerGas: 0n, maxFeePerGas },
    ...rest,
  };
};

const txFees = (data?: TxFees, rest: QueryResult = {}) => {
  state.queries['max-tx-fees'] = { data, ...rest };
};

const query = (key: string) => {
  const call = state.calls.find((args) => args.queryKey[0] === key);
  if (!call) throw new Error(`query ${key} was not set up`);
  return call;
};

const maxTxCost = (args: Parameters<typeof useMaxTxCost>[0]) =>
  renderHook(() => useMaxTxCost(args));

beforeEach(() => {
  state.dappChainId = CHAINS.Mainnet;
  state.isAA = false;
  state.publicClient = {};
  state.queries = {};
  state.calls = [];
  vi.mocked(estimateMaxFee).mockReset();
  vi.mocked(estimateTxFees).mockReset();
});

describe('useMaxTxCost', () => {
  it('prices an Ethereum tx from the chain-wide max price alone', () => {
    feeHistory(PRICE);
    const result = maxTxCost({
      chainId: CHAINS.Mainnet,
      gasLimit: GAS_LIMIT,
      tx,
    });
    expect(result.maxTxCost).toBe(GAS_LIMIT * PRICE);
    expect(result.maxGasPrice).toBe(PRICE);
    expect(result.l1Fee).toBe(0n);
    expect(query('max-tx-fees').enabled).toBe(false);
  });

  it('prices an Arbitrum tx from the chain-wide price: the L1 cost is in the gas', () => {
    feeHistory(PRICE);
    // a cached quote must not leak in where the chain does not use one
    txFees({ l1Fee: L1_FEE });
    const result = maxTxCost({
      chainId: CHAINS.Arbitrum,
      gasLimit: GAS_LIMIT,
      tx,
    });
    expect(result.maxTxCost).toBe(GAS_LIMIT * PRICE);
    expect(result.l1Fee).toBe(0n);
    expect(query('max-tx-fees').enabled).toBe(false);
  });

  it('adds the quoted L1 data fee on top of the gas on OP-stack', () => {
    feeHistory(PRICE);
    txFees({ l1Fee: L1_FEE });
    const result = maxTxCost({ chainId: CHAINS.Base, gasLimit: GAS_LIMIT, tx });
    expect(result.maxTxCost).toBe(GAS_LIMIT * PRICE + L1_FEE);
    expect(result.maxGasPrice).toBe(PRICE);
    expect(result.l1Fee).toBe(L1_FEE);
    expect(query('max-tx-fees').enabled).toBe(true);
  });

  it('prices a Linea tx at its quote, over the larger of the gas limits', () => {
    feeHistory(PRICE);
    const quote: TxFees = {
      maxFeePerGas: QUOTED_PRICE,
      maxPriorityFeePerGas: QUOTED_PRICE - 1n,
      gasLimit: QUOTED_GAS,
      l1Fee: 0n,
    };
    txFees(quote);

    const quotedLarger = maxTxCost({
      chainId: CHAINS.Linea,
      gasLimit: GAS_LIMIT,
      tx,
    });
    expect(quotedLarger.maxTxCost).toBe(QUOTED_GAS * QUOTED_PRICE);
    expect(quotedLarger.maxGasPrice).toBe(QUOTED_PRICE);

    state.calls = [];
    const givenLarger = maxTxCost({
      chainId: CHAINS.Linea,
      gasLimit: 300_000n,
      tx,
    });
    expect(givenLarger.maxTxCost).toBe(300_000n * QUOTED_PRICE);
  });

  it('falls back to the chain-wide cost without a representative tx', () => {
    feeHistory(PRICE);
    txFees({ maxFeePerGas: QUOTED_PRICE, gasLimit: QUOTED_GAS, l1Fee: 0n });
    const result = maxTxCost({ chainId: CHAINS.Linea, gasLimit: GAS_LIMIT });
    expect(result.maxTxCost).toBe(GAS_LIMIT * PRICE);
    expect(result.maxGasPrice).toBe(PRICE);
    expect(query('max-tx-fees').enabled).toBe(false);
  });

  it('withholds the cost while the tx quote is pending', () => {
    feeHistory(PRICE);
    txFees(undefined, { isLoading: true });
    const result = maxTxCost({ chainId: CHAINS.Base, gasLimit: GAS_LIMIT, tx });
    expect(result.maxTxCost).toBeUndefined();
    expect(result.isLoading).toBe(true);
  });

  it('withholds the cost while the chain-wide price is pending', () => {
    feeHistory(undefined, { isLoading: true });
    txFees({ l1Fee: L1_FEE });
    const result = maxTxCost({ chainId: CHAINS.Base, gasLimit: GAS_LIMIT, tx });
    expect(result.maxTxCost).toBeUndefined();
    expect(result.maxGasPrice).toBeUndefined();
    expect(result.isLoading).toBe(true);
  });

  it('withholds the cost without a gas limit', () => {
    feeHistory(PRICE);
    txFees({ l1Fee: L1_FEE });
    expect(maxTxCost({ chainId: CHAINS.Base, tx }).maxTxCost).toBeUndefined();
  });

  it('does not quote without a public client', () => {
    state.publicClient = undefined;
    maxTxCost({ chainId: CHAINS.Base, gasLimit: GAS_LIMIT, tx });
    expect(query('max-tx-fees').enabled).toBe(false);
    expect(query('max-gas-price').enabled).toBe(false);
  });

  it('quotes the tx for the target chain, keyed by every field of the tx', async () => {
    vi.mocked(estimateTxFees).mockResolvedValue({ l1Fee: L1_FEE });
    maxTxCost({ chainId: CHAINS.Base, gasLimit: GAS_LIMIT, tx });

    const call = query('max-tx-fees');
    expect(call.queryKey[1]).toEqual({
      chainId: CHAINS.Base,
      account: tx.account,
      to: tx.to,
      data: tx.data,
      value: tx.value,
    });
    await expect(call.queryFn()).resolves.toEqual({ l1Fee: L1_FEE });
    expect(estimateTxFees).toHaveBeenCalledWith(
      state.publicClient,
      CHAINS.Base,
      tx,
    );
  });

  it('defaults to the dapp chain', () => {
    state.dappChainId = CHAINS.Base;
    feeHistory(PRICE);
    txFees({ l1Fee: L1_FEE });
    const result = maxTxCost({ gasLimit: GAS_LIMIT, tx });
    expect(result.maxTxCost).toBe(GAS_LIMIT * PRICE + L1_FEE);
    expect(query('max-gas-price').queryKey[1]).toMatchObject({
      chainId: CHAINS.Base,
    });
    expect(query('max-tx-fees').queryKey[1]).toMatchObject({
      chainId: CHAINS.Base,
    });
  });

  it('surfaces the error of either query', () => {
    const priceError = new Error('eth_feeHistory failed');
    feeHistory(undefined, { error: priceError });
    expect(
      maxTxCost({ chainId: CHAINS.Mainnet, gasLimit: GAS_LIMIT }).error,
    ).toBe(priceError);

    state.calls = [];
    const quoteError = new Error('quote failed');
    feeHistory(PRICE);
    txFees(undefined, { error: quoteError });
    expect(
      maxTxCost({ chainId: CHAINS.Base, gasLimit: GAS_LIMIT, tx }).error,
    ).toBe(quoteError);
  });

  it('refetches the tx quote only where the chain needs one', async () => {
    const refetchPrice = vi.fn(async () => undefined);
    const refetchQuote = vi.fn(async () => undefined);
    feeHistory(PRICE, { refetch: refetchPrice });
    txFees({ l1Fee: L1_FEE }, { refetch: refetchQuote });

    await maxTxCost({
      chainId: CHAINS.Mainnet,
      gasLimit: GAS_LIMIT,
      tx,
    }).update();
    expect(refetchPrice).toHaveBeenCalledTimes(1);
    expect(refetchQuote).not.toHaveBeenCalled();

    await maxTxCost({ chainId: CHAINS.Base, gasLimit: GAS_LIMIT, tx }).update();
    expect(refetchPrice).toHaveBeenCalledTimes(2);
    expect(refetchQuote).toHaveBeenCalledTimes(1);
  });
});

describe('useMaxGasPrice', () => {
  it('exposes the chain-wide max fee', () => {
    feeHistory(PRICE);
    expect(renderHook(() => useMaxGasPrice(CHAINS.Base)).maxGasPrice).toBe(
      PRICE,
    );
  });

  it('keys the price on the chain and on who prices the tx', () => {
    state.isAA = true;
    renderHook(() => useMaxGasPrice(CHAINS.Base));
    expect(query('max-gas-price').queryKey).toEqual([
      'max-gas-price',
      { chainId: CHAINS.Base, isWalletPriced: true },
    ]);
  });

  it('asks the fee model for the max fee of the pricing side', async () => {
    const fee = {
      lastBaseFeePerGas: 1n,
      maxPriorityFeePerGas: 2n,
      maxFeePerGas: 3n,
    };
    vi.mocked(estimateMaxFee).mockResolvedValue(fee);
    state.isAA = true;
    renderHook(() => useMaxGasPrice(CHAINS.Base));

    await expect(query('max-gas-price').queryFn()).resolves.toBe(fee);
    expect(estimateMaxFee).toHaveBeenCalledWith(
      state.publicClient,
      CHAINS.Base,
      {
        isWalletPriced: true,
      },
    );
  });
});
