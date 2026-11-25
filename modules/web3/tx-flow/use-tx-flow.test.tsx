import { renderToStaticMarkup } from 'react-dom/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Address, Hash, TransactionReceipt } from 'viem';
import {
  TransactionCallbackStage,
  type TransactionCallback,
} from '@lidofinance/lido-ethereum-sdk/core';

import {
  TxSentDataUnavailableError,
  TxSettledError,
  TxStaleError,
} from '../utils/errors';
import type { AACall, TxCallbackProps } from './types';

const ADDRESS: Address = '0x00000000000000000000000000000000000000aa';
const TX_HASH: Hash =
  '0x1111111111111111111111111111111111111111111111111111111111111111';
const CALL_ID = '0xcall';

const state = vi.hoisted(() => ({
  isAA: false,
  validateAddress: vi.fn(async () => true),
  sendAACalls: vi.fn(),
  isL2: false,
  l1ChainId: 1,
  address: undefined as Address | undefined,
  getBlock: vi.fn(),
}));

vi.mock('providers/address-validation-provider', () => ({
  useAddressValidation: () => ({ validateAddress: state.validateAddress }),
}));
vi.mock('modules/web3', () => ({
  useDappStatus: () => ({ address: state.address }),
}));
vi.mock('../hooks/use-aa', () => ({
  useAA: () => ({ isAA: state.isAA }),
}));
vi.mock('./use-send-aa-calls', () => ({
  useSendAACalls: () => state.sendAACalls,
}));
vi.mock('../web3-provider/lido-sdk', () => ({
  useLidoSDK: () => ({
    core: {
      // read per flow: the chain may change under a mounted hook
      get chainId() {
        return state.l1ChainId;
      },
      publicClient: { getBlock: state.getBlock },
    },
  }),
}));
vi.mock('../web3-provider/lido-sdk-l2', () => ({
  useLidoSDKL2: () => ({
    core: { chainId: 10, publicClient: { getBlock: state.getBlock } },
    isL2: state.isL2,
  }),
}));

import { useTxFlow } from './use-tx-flow';

// The hook refetches through the app's query client after an unread outcome
const queryClient = new QueryClient();
const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');

// Hooks run during a server render; the returned function is then driven
// outside of React like a form submit would
const renderHook = <T,>(useHook: () => T): T => {
  let value: T | undefined;
  const Probe = () => {
    value = useHook();
    return null;
  };
  renderToStaticMarkup(
    <QueryClientProvider client={queryClient}>
      <Probe />
    </QueryClientProvider>,
  );
  return value as T;
};

const receipt = {
  status: 'success',
  transactionHash: TX_HASH,
} as TransactionReceipt;

// Mirrors the SDK's performTransaction stage sequence for one transaction
const legacySdk =
  (...stages: (TxCallbackProps | (() => void))[]) =>
  async (callback: TransactionCallback) => {
    for (const stage of stages) {
      if (typeof stage === 'function') stage();
      else await callback(stage as Parameters<TransactionCallback>[0]);
    }
  };
const settledStages: TxCallbackProps[] = [
  { stage: TransactionCallbackStage.SIGN },
  { stage: TransactionCallbackStage.RECEIPT, payload: TX_HASH },
  { stage: TransactionCallbackStage.CONFIRMATION, payload: receipt },
  { stage: TransactionCallbackStage.DONE },
];

// Mirrors useSendAACalls: SIGN, RECEIPT (callId), DONE (txHash)
const aaSdk = async (
  _calls: AACall[],
  callback: (props: TxCallbackProps) => Promise<void>,
) => {
  await callback({ stage: TransactionCallbackStage.SIGN });
  await callback({ stage: TransactionCallbackStage.RECEIPT, callId: CALL_ID });
  await callback({ stage: TransactionCallbackStage.DONE, txHash: TX_HASH });
};

// A legacy consumer, as every wrap, withdrawal and vault flow is written:
// one sendTransaction driving the SDK, callsFn only for an EIP-5792 batch
const createLegacyArgs = (
  sendTransaction = vi.fn(legacySdk(...settledStages)),
) => ({
  sendTransaction,
  callsFn: vi.fn(async () => [{ to: ADDRESS, value: 1n }]),
  onSign: vi.fn(),
  onReceipt: vi.fn(),
  onConfirmation: vi.fn(),
  onSuccess: vi.fn(),
  onFailure: vi.fn(),
});

beforeEach(() => {
  vi.clearAllMocks();
  state.isAA = false;
  state.isL2 = false;
  state.l1ChainId = 1;
  state.address = ADDRESS;
  state.validateAddress.mockResolvedValue(true);
});

describe('useTxFlow with a legacy flow', () => {
  it('drives the SDK through sendTransaction and never builds calls', async () => {
    const txFlow = renderHook(useTxFlow);
    const args = createLegacyArgs();

    await expect(txFlow(args)).resolves.toMatchObject({
      isSuccess: true,
      isInterrupted: false,
      isAborted: false,
      ctx: { isAA: false, calls: [] },
    });

    expect(state.validateAddress).toHaveBeenCalledWith(ADDRESS);
    expect(args.sendTransaction).toHaveBeenCalledWith(expect.any(Function));
    expect(args.callsFn).not.toHaveBeenCalled();
    expect(state.sendAACalls).not.toHaveBeenCalled();
    // every stage gets the signing mode and a context, as before plus ctx
    expect(args.onSign).toHaveBeenCalledWith(
      expect.objectContaining({ isAA: false, ctx: expect.any(Object) }),
    );
    expect(args.onReceipt).toHaveBeenCalledWith(
      expect.objectContaining({ txHashOrCallId: TX_HASH }),
    );
    expect(args.onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({ txHash: TX_HASH }),
    );
    expect(args.onFailure).not.toHaveBeenCalled();
  });

  it('signs the calls as a batch for an EIP-5792 wallet', async () => {
    state.isAA = true;
    state.sendAACalls.mockImplementation(aaSdk);
    const txFlow = renderHook(useTxFlow);
    const args = createLegacyArgs();

    await expect(txFlow(args)).resolves.toMatchObject({ isSuccess: true });

    expect(args.callsFn).toHaveBeenCalledTimes(1);
    expect(state.sendAACalls).toHaveBeenCalledWith(
      [{ to: ADDRESS, value: 1n }],
      expect.any(Function),
    );
    expect(args.sendTransaction).not.toHaveBeenCalled();
    expect(args.onReceipt).toHaveBeenCalledWith(
      expect.objectContaining({ txHashOrCallId: CALL_ID, isAA: true }),
    );
    expect(args.onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({ txHash: TX_HASH }),
    );
  });

  it('rejects a failure before settlement as is: the consumer reports it', async () => {
    const txFlow = renderHook(useTxFlow);
    const rejected = new Error('User rejected the request');
    const args = createLegacyArgs(
      vi.fn(
        legacySdk({ stage: TransactionCallbackStage.SIGN }, () => {
          throw rejected;
        }),
      ),
    );

    await expect(txFlow(args)).rejects.toBe(rejected);
    expect(args.onFailure).not.toHaveBeenCalled();
    expect(args.onSuccess).not.toHaveBeenCalled();
  });

  it('reports a failure after settlement as settled and resolves as a success', async () => {
    const txFlow = renderHook(useTxFlow);
    const readError = new Error('balance read timeout');
    const args = createLegacyArgs(
      vi.fn(
        legacySdk(
          { stage: TransactionCallbackStage.RECEIPT, payload: TX_HASH },
          { stage: TransactionCallbackStage.CONFIRMATION, payload: receipt },
          () => {
            throw readError;
          },
        ),
      ),
    );

    await expect(txFlow(args)).resolves.toMatchObject({ isSuccess: true });
    const error = args.onFailure.mock.calls[0]?.[0].error;
    expect(error).toBeInstanceOf(TxSettledError);
    expect(error.cause).toBe(readError);
    expect(error.txHash).toBe(TX_HASH);
    expect(invalidateQueries).not.toHaveBeenCalled();
  });

  it('refetches everything after a tx that was sent but never read back', async () => {
    const txFlow = renderHook(useTxFlow);
    const timeout = new Error('Timed out while waiting for transaction');
    const args = createLegacyArgs(
      vi.fn(
        legacySdk(
          { stage: TransactionCallbackStage.RECEIPT, payload: TX_HASH },
          () => {
            throw timeout;
          },
        ),
      ),
    );

    await expect(txFlow(args)).rejects.toBeInstanceOf(
      TxSentDataUnavailableError,
    );
    // the tx may have landed: every balance and request the UI holds is stale
    expect(invalidateQueries).toHaveBeenCalledTimes(1);
    expect(args.onSuccess).not.toHaveBeenCalled();
  });

  it('refetches only the given scope after a tx that was never read back', async () => {
    const txFlow = renderHook(useTxFlow);
    const args = {
      ...createLegacyArgs(
        vi.fn(
          legacySdk(
            { stage: TransactionCallbackStage.RECEIPT, payload: TX_HASH },
            () => {
              throw new Error('Timed out while waiting for transaction');
            },
          ),
        ),
      ),
      refetchScope: [['feature-scope'], ['balance']],
    };

    await expect(txFlow(args)).rejects.toBeInstanceOf(
      TxSentDataUnavailableError,
    );
    expect(invalidateQueries).toHaveBeenCalledTimes(2);
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['feature-scope'],
    });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['balance'] });
  });

  it('does not refetch after a failure before the tx was sent', async () => {
    const txFlow = renderHook(useTxFlow);
    const args = createLegacyArgs(
      vi.fn(
        legacySdk({ stage: TransactionCallbackStage.SIGN }, () => {
          throw new Error('User rejected the request');
        }),
      ),
    );

    await expect(txFlow(args)).rejects.toThrow('User rejected the request');
    expect(invalidateQueries).not.toHaveBeenCalled();
  });

  it('does nothing for an address that fails validation', async () => {
    state.validateAddress.mockResolvedValue(false);
    const txFlow = renderHook(useTxFlow);
    const args = createLegacyArgs();

    await expect(txFlow(args)).resolves.toMatchObject({ isAborted: true });
    expect(args.sendTransaction).not.toHaveBeenCalled();
  });

  it('aborts a flow superseded while its address was being validated', async () => {
    const txFlow = renderHook(useTxFlow);
    const first = createLegacyArgs();
    const second = createLegacyArgs();

    // both start at once: the first is still in validation when the second
    // takes over, so it never reaches the wallet
    const firstRun = txFlow(first);
    await expect(txFlow(second)).resolves.toMatchObject({ isSuccess: true });

    await expect(firstRun).resolves.toMatchObject({ isAborted: true });
    expect(first.sendTransaction).not.toHaveBeenCalled();
    expect(second.onSuccess).toHaveBeenCalledTimes(1);
  });

  it('abandons a flow at signing once a newer one started', async () => {
    const txFlow = renderHook(useTxFlow);
    let releaseFirst = () => {};
    const gate = new Promise<void>((resolve) => {
      releaseFirst = resolve;
    });
    const first = createLegacyArgs(
      vi.fn(async (callback: TransactionCallback) => {
        await gate;
        await legacySdk(...settledStages)(callback);
      }),
    );
    const second = createLegacyArgs();

    const firstRun = txFlow(first);
    // let the first pass validation and reach its sendTransaction
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(first.sendTransaction).toHaveBeenCalledTimes(1);
    await expect(txFlow(second)).resolves.toMatchObject({ isSuccess: true });
    releaseFirst();

    // the SIGN stage of the stale flow throws before the wallet is reached
    await expect(firstRun).rejects.toBeInstanceOf(TxStaleError);
    expect(first.onSign).not.toHaveBeenCalled();
    expect(second.onSuccess).toHaveBeenCalledTimes(1);
  });

  it('refetches after a superseded flow whose tx was sent but never read back', async () => {
    const txFlow = renderHook(useTxFlow);
    let releaseFirst = () => {};
    const gate = new Promise<void>((resolve) => {
      releaseFirst = resolve;
    });
    const first = createLegacyArgs(
      vi.fn(async (callback: TransactionCallback) => {
        await legacySdk(
          { stage: TransactionCallbackStage.SIGN },
          { stage: TransactionCallbackStage.RECEIPT, payload: TX_HASH },
        )(callback);
        await gate;
        throw new Error('Timed out while waiting for transaction');
      }),
    );
    const second = createLegacyArgs();

    const firstRun = txFlow(first);
    // let the first reach the network before the second takes over
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(first.onReceipt).toHaveBeenCalledTimes(1);
    await expect(txFlow(second)).resolves.toMatchObject({ isSuccess: true });
    releaseFirst();

    // it may have landed: no Retry, and the data under the forms is refetched
    await expect(firstRun).rejects.toBeInstanceOf(TxSentDataUnavailableError);
    expect(first.onFailure).not.toHaveBeenCalled();
    expect(invalidateQueries).toHaveBeenCalledTimes(1);
  });
});

describe('useTxFlow waiting for the previous tx block', () => {
  const BLOCK = 100n;
  const minedStages = (blockNumber = BLOCK): TxCallbackProps[] => [
    { stage: TransactionCallbackStage.SIGN },
    { stage: TransactionCallbackStage.RECEIPT, payload: TX_HASH },
    {
      stage: TransactionCallbackStage.CONFIRMATION,
      payload: { ...receipt, blockNumber },
    },
    { stage: TransactionCallbackStage.DONE },
  ];
  const minedArgs = (blockNumber?: bigint) =>
    createLegacyArgs(vi.fn(legacySdk(...minedStages(blockNumber))));
  const latestBlock = (number: bigint) => ({ number });

  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('holds the next flow until the RPC serves the block of the last tx', async () => {
    const txFlow = renderHook(useTxFlow);
    await txFlow(minedArgs());
    expect(state.getBlock).not.toHaveBeenCalled();

    state.getBlock
      .mockResolvedValueOnce(latestBlock(BLOCK - 1n))
      .mockResolvedValueOnce(latestBlock(BLOCK));
    const next = createLegacyArgs();
    const run = txFlow(next);

    await vi.advanceTimersByTimeAsync(0);
    expect(state.getBlock).toHaveBeenCalledWith({ blockTag: 'latest' });
    expect(next.sendTransaction).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1_000);
    await expect(run).resolves.toMatchObject({ isSuccess: true });
    expect(state.getBlock).toHaveBeenCalledTimes(2);
    expect(next.sendTransaction).toHaveBeenCalledTimes(1);
  });

  it('checks no further once the RPC caught up, until another tx lands', async () => {
    const txFlow = renderHook(useTxFlow);
    await txFlow(minedArgs());
    state.getBlock.mockResolvedValue(latestBlock(BLOCK));

    await txFlow(createLegacyArgs());
    await txFlow(createLegacyArgs());

    expect(state.getBlock).toHaveBeenCalledTimes(1);
  });

  it('waits for the latest block of several txs', async () => {
    const txFlow = renderHook(useTxFlow);
    await txFlow(minedArgs(BLOCK));
    // a flow with no wait to do records its own block
    state.getBlock.mockResolvedValue(latestBlock(BLOCK));
    await txFlow(minedArgs(BLOCK + 5n));

    state.getBlock.mockClear();
    state.getBlock
      .mockResolvedValueOnce(latestBlock(BLOCK + 4n))
      .mockResolvedValueOnce(latestBlock(BLOCK + 5n));
    const run = txFlow(createLegacyArgs());
    await vi.advanceTimersByTimeAsync(1_000);

    await expect(run).resolves.toMatchObject({ isSuccess: true });
    expect(state.getBlock).toHaveBeenCalledTimes(2);
  });

  it('goes on when the latest block cannot be read', async () => {
    const txFlow = renderHook(useTxFlow);
    await txFlow(minedArgs());
    state.getBlock.mockRejectedValue(new Error('rpc down'));
    const next = createLegacyArgs();

    await expect(txFlow(next)).resolves.toMatchObject({ isSuccess: true });
    expect(state.getBlock).toHaveBeenCalledTimes(1);
    expect(next.sendTransaction).toHaveBeenCalledTimes(1);
  });

  it('goes on once the wait times out', async () => {
    const txFlow = renderHook(useTxFlow);
    await txFlow(minedArgs());
    state.getBlock.mockResolvedValue(latestBlock(BLOCK - 1n));
    const next = createLegacyArgs();
    const run = txFlow(next);

    await vi.advanceTimersByTimeAsync(29_000);
    expect(next.sendTransaction).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1_000);

    await expect(run).resolves.toMatchObject({ isSuccess: true });
    expect(next.sendTransaction).toHaveBeenCalledTimes(1);
  });

  it('does not wait when no tx of the hook made it into a block', async () => {
    const txFlow = renderHook(useTxFlow);
    // a receipt without a block number gives nothing to wait for
    await txFlow(
      createLegacyArgs(
        vi.fn(
          legacySdk(
            { stage: TransactionCallbackStage.RECEIPT, payload: TX_HASH },
            { stage: TransactionCallbackStage.CONFIRMATION, payload: receipt },
            { stage: TransactionCallbackStage.DONE },
          ),
        ),
      ),
    );
    await txFlow(createLegacyArgs());

    expect(state.getBlock).not.toHaveBeenCalled();
  });

  it('does not wait for a block of another chain', async () => {
    const txFlow = renderHook(useTxFlow);
    await txFlow(minedArgs());

    state.l1ChainId = 560048;
    await txFlow(createLegacyArgs());
    expect(state.getBlock).not.toHaveBeenCalled();

    // the block is kept for its own chain
    state.l1ChainId = 1;
    state.getBlock.mockResolvedValue(latestBlock(BLOCK));
    await txFlow(createLegacyArgs());
    expect(state.getBlock).toHaveBeenCalledTimes(1);
  });

  it('neither records nor waits without an account', async () => {
    state.address = undefined;
    const txFlow = renderHook(useTxFlow);
    await txFlow(minedArgs());
    await txFlow(createLegacyArgs());

    expect(state.getBlock).not.toHaveBeenCalled();
  });

  it('does not wait when the option is off', async () => {
    const txFlow = renderHook(() => useTxFlow({ waitForPrevPendingTx: false }));
    await txFlow(minedArgs());
    await txFlow(createLegacyArgs());

    expect(state.getBlock).not.toHaveBeenCalled();
  });

  it('records the block of an EIP-5792 batch', async () => {
    state.isAA = true;
    state.sendAACalls.mockImplementation(
      async (
        _calls: AACall[],
        callback: (props: TxCallbackProps) => Promise<void>,
      ) => {
        await callback({ stage: TransactionCallbackStage.SIGN });
        await callback({
          stage: TransactionCallbackStage.RECEIPT,
          callId: CALL_ID,
        });
        await callback({
          stage: TransactionCallbackStage.DONE,
          txHash: TX_HASH,
          blockNumber: BLOCK,
        });
      },
    );
    const txFlow = renderHook(useTxFlow);
    await txFlow(createLegacyArgs());
    state.getBlock.mockResolvedValue(latestBlock(BLOCK));

    await txFlow(createLegacyArgs());
    expect(state.getBlock).toHaveBeenCalledTimes(1);
  });
});
