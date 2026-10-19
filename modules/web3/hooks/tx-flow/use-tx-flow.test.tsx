import { renderToStaticMarkup } from 'react-dom/server';
import type { Address, Hash, TransactionReceipt } from 'viem';
import {
  TransactionCallbackStage,
  type TransactionCallback,
} from '@lidofinance/lido-ethereum-sdk/core';

import { TxSettledError } from '../../utils/tx-settled-error';
import { TxStaleError } from '../../utils/tx-stale-error';
import type { AACall, TxCallbackProps } from './types';

const ADDRESS: Address = '0x00000000000000000000000000000000000000aa';
const TX_HASH: Hash =
  '0x1111111111111111111111111111111111111111111111111111111111111111';
const CALL_ID = '0xcall';

const state = vi.hoisted(() => ({
  isAA: false,
  validateAddress: vi.fn(async () => true),
  sendAACalls: vi.fn(),
}));

vi.mock('providers/address-validation-provider', () => ({
  useAddressValidation: () => ({ validateAddress: state.validateAddress }),
}));
vi.mock('modules/web3', () => ({
  useDappStatus: () => ({ address: ADDRESS }),
}));
vi.mock('../use-aa', () => ({
  useAA: () => ({ isAA: state.isAA }),
}));
vi.mock('./use-send-aa-calls', () => ({
  useSendAACalls: () => state.sendAACalls,
}));

import { useTxFlow } from './use-tx-flow';

// Hooks run during a server render; the returned function is then driven
// outside of React like a form submit would
const renderHook = <T,>(useHook: () => T): T => {
  let value: T | undefined;
  const Probe = () => {
    value = useHook();
    return null;
  };
  renderToStaticMarkup(<Probe />);
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
});
