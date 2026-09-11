import type { Address, Hash, TransactionReceipt } from 'viem';
import {
  TransactionCallbackStage,
  type TransactionCallback,
} from '@lidofinance/lido-ethereum-sdk/core';

import { TransactionRevertedError } from '../../utils/transaction-reverted-error';
import { TxSettledError } from '../../utils/tx-settled-error';
import { TxStaleError } from '../../utils/tx-stale-error';
import { runTxFlow } from './run-tx-flow';
import type { AACall, TxCallbackProps, TxFlowArgs, TxFlowDeps } from './types';

const ADDRESS: Address = '0x0000000000000000000000000000000000000001';
const TX_HASH =
  '0x1111111111111111111111111111111111111111111111111111111111111111';
const TX_HASH_2 =
  '0x2222222222222222222222222222222222222222222222222222222222222222';
const CALL_ID = '0xcall';

const receipt = (status: 'success' | 'reverted' = 'success') =>
  ({ status, transactionHash: TX_HASH }) as unknown as TransactionReceipt;

type Stage = TxCallbackProps | (() => Promise<void> | void);

// Mirrors the SDK's `performTransaction`: stages are awaited in order, a
// throwing stage callback aborts the sequence and rejects the call, and no
// ERROR stage is ever emitted
const legacySdk =
  (...stages: Stage[]) =>
  async (callback: TransactionCallback) => {
    for (const stage of stages) {
      if (typeof stage === 'function') await stage();
      else await callback(stage as Parameters<TransactionCallback>[0]);
    }
  };

// Mirrors `useSendAACalls`: SIGN, RECEIPT (callId), DONE (txHash); any error,
// including one thrown by a stage callback, is reported as an ERROR stage and
// then rethrown
const aaSdk =
  (options: { failWith?: unknown; txHash?: Hash } = {}) =>
  async (
    _calls: unknown,
    callback: (props: TxCallbackProps) => Promise<void>,
  ) => {
    try {
      await callback({ stage: TransactionCallbackStage.SIGN });
      await callback({
        stage: TransactionCallbackStage.RECEIPT,
        callId: CALL_ID,
      });
      if (options.failWith) throw options.failWith;
      await callback({
        stage: TransactionCallbackStage.DONE,
        txHash: options.txHash ?? TX_HASH,
      });
    } catch (error) {
      await callback({ stage: TransactionCallbackStage.ERROR, error });
      throw error;
    }
  };

const createCallbacks = () => ({
  onSign: vi.fn(),
  onReceipt: vi.fn(),
  onConfirmation: vi.fn(),
  onSuccess: vi.fn(),
  onFailure: vi.fn(),
});

const createDeps = (overrides: Partial<TxFlowDeps> = {}): TxFlowDeps => ({
  isAA: false,
  address: ADDRESS,
  validateAddress: vi.fn(async () => true),
  sendAACalls: vi.fn(aaSdk()),
  isCurrent: () => true,
  txHash: { current: undefined },
  ...overrides,
});

const run = (args: Partial<TxFlowArgs>, deps: Partial<TxFlowDeps> = {}) =>
  runTxFlow({ sendTransaction: legacySdk(), ...args }, createDeps(deps));

const reportedError = (onFailure: ReturnType<typeof vi.fn>) =>
  onFailure.mock.calls[0]?.[0]?.error;

describe('runTxFlow', () => {
  describe('legacy transactions', () => {
    it('drives the stages and forwards the tx hash', async () => {
      const cb = createCallbacks();
      const txHash = { current: undefined };
      await run(
        {
          ...cb,
          sendTransaction: legacySdk(
            { stage: TransactionCallbackStage.SIGN },
            { stage: TransactionCallbackStage.RECEIPT, payload: TX_HASH },
            {
              stage: TransactionCallbackStage.CONFIRMATION,
              payload: receipt(),
            },
            { stage: TransactionCallbackStage.DONE },
          ),
        },
        { txHash },
      );

      expect(cb.onSign).toHaveBeenCalledWith(
        expect.objectContaining({ isAA: false }),
      );
      expect(cb.onReceipt).toHaveBeenCalledWith(
        expect.objectContaining({ txHashOrCallId: TX_HASH }),
      );
      expect(cb.onConfirmation).toHaveBeenCalledTimes(1);
      expect(cb.onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({ txHash: TX_HASH }),
      );
      expect(cb.onFailure).not.toHaveBeenCalled();
      expect(txHash.current).toBeUndefined();
    });

    it('rejects a failure before settlement without dressing it up', async () => {
      const cb = createCallbacks();
      const rejected = new Error('User rejected the request');
      await expect(
        run({
          ...cb,
          sendTransaction: legacySdk(
            { stage: TransactionCallbackStage.SIGN },
            () => {
              throw rejected;
            },
          ),
        }),
      ).rejects.toBe(rejected);

      // The SDK emits no ERROR stage for legacy transactions and the flow
      // must not invent one before settlement: the caller handles rejection
      expect(cb.onFailure).not.toHaveBeenCalled();
      expect(cb.onSuccess).not.toHaveBeenCalled();
    });

    it('reports a failure after confirmation as settled and resolves', async () => {
      const cb = createCallbacks();
      const readError = new Error('balance read timeout');
      await expect(
        run({
          ...cb,
          sendTransaction: legacySdk(
            { stage: TransactionCallbackStage.RECEIPT, payload: TX_HASH },
            {
              stage: TransactionCallbackStage.CONFIRMATION,
              payload: receipt(),
            },
            () => {
              throw readError;
            },
          ),
        }),
      ).resolves.toBeUndefined();

      expect(cb.onFailure).toHaveBeenCalledTimes(1);
      const error = reportedError(cb.onFailure);
      expect(error).toBeInstanceOf(TxSettledError);
      expect(error.cause).toBe(readError);
      expect(error.txHash).toBe(TX_HASH);
      expect(cb.onSuccess).not.toHaveBeenCalled();
    });

    it('reports a failing onConfirmation as settled', async () => {
      const cb = createCallbacks();
      cb.onConfirmation.mockRejectedValue(new Error('confirmations read'));
      await expect(
        run({
          ...cb,
          sendTransaction: legacySdk(
            { stage: TransactionCallbackStage.RECEIPT, payload: TX_HASH },
            {
              stage: TransactionCallbackStage.CONFIRMATION,
              payload: receipt(),
            },
            { stage: TransactionCallbackStage.DONE },
          ),
        }),
      ).resolves.toBeUndefined();

      expect(cb.onFailure).toHaveBeenCalledTimes(1);
      expect(reportedError(cb.onFailure)).toBeInstanceOf(TxSettledError);
      expect(cb.onSuccess).not.toHaveBeenCalled();
    });

    it('reports a failing onSuccess once as settled and resolves', async () => {
      const cb = createCallbacks();
      cb.onSuccess.mockRejectedValue(new Error('balance refresh'));
      await expect(
        run({
          ...cb,
          sendTransaction: legacySdk(
            { stage: TransactionCallbackStage.RECEIPT, payload: TX_HASH },
            {
              stage: TransactionCallbackStage.CONFIRMATION,
              payload: receipt(),
            },
            { stage: TransactionCallbackStage.DONE },
          ),
        }),
      ).resolves.toBeUndefined();

      expect(cb.onFailure).toHaveBeenCalledTimes(1);
      const error = reportedError(cb.onFailure);
      expect(error).toBeInstanceOf(TxSettledError);
      expect(error.txHash).toBe(TX_HASH);
    });

    it('surfaces a reverted receipt as a failure and skips success', async () => {
      const cb = createCallbacks();
      await expect(
        run({
          ...cb,
          sendTransaction: legacySdk(
            { stage: TransactionCallbackStage.RECEIPT, payload: TX_HASH },
            {
              stage: TransactionCallbackStage.CONFIRMATION,
              payload: receipt('reverted'),
            },
            { stage: TransactionCallbackStage.DONE },
          ),
        }),
      ).rejects.toBeInstanceOf(TransactionRevertedError);

      expect(cb.onConfirmation).not.toHaveBeenCalled();
      expect(cb.onSuccess).not.toHaveBeenCalled();
      // Not settled: the revert is a real failure, never a TxSettledError
      expect(cb.onFailure).not.toHaveBeenCalled();
    });

    it('does not let a settled approval mask a failing chained deposit', async () => {
      const cb = createCallbacks();
      const depositRejected = new Error('User rejected the request');
      await expect(
        run({
          ...cb,
          sendTransaction: legacySdk(
            // approve
            { stage: TransactionCallbackStage.RECEIPT, payload: TX_HASH },
            {
              stage: TransactionCallbackStage.CONFIRMATION,
              payload: receipt(),
            },
            { stage: TransactionCallbackStage.DONE },
            // deposit
            { stage: TransactionCallbackStage.SIGN },
            () => {
              throw depositRejected;
            },
          ),
        }),
      ).rejects.toBe(depositRejected);

      expect(cb.onSuccess).toHaveBeenCalledTimes(1);
      expect(cb.onFailure).not.toHaveBeenCalled();
    });

    it('tracks the hash of each chained transaction separately', async () => {
      const cb = createCallbacks();
      const txHash = { current: undefined };
      await run(
        {
          ...cb,
          sendTransaction: legacySdk(
            { stage: TransactionCallbackStage.RECEIPT, payload: TX_HASH },
            {
              stage: TransactionCallbackStage.CONFIRMATION,
              payload: receipt(),
            },
            { stage: TransactionCallbackStage.DONE },
            { stage: TransactionCallbackStage.RECEIPT, payload: TX_HASH_2 },
            {
              stage: TransactionCallbackStage.CONFIRMATION,
              payload: receipt(),
            },
            { stage: TransactionCallbackStage.DONE },
          ),
        },
        { txHash },
      );

      expect(cb.onSuccess.mock.calls.map(([args]) => args.txHash)).toEqual([
        TX_HASH,
        TX_HASH_2,
      ]);
      expect(txHash.current).toBeUndefined();
    });

    it('falls back to sendTransaction for AA wallets without callsFn', async () => {
      const sendTransaction = vi.fn(legacySdk());
      const sendAACalls = vi.fn(aaSdk());
      await run({ sendTransaction }, { isAA: true, sendAACalls });

      expect(sendTransaction).toHaveBeenCalledTimes(1);
      expect(sendAACalls).not.toHaveBeenCalled();
    });
  });

  describe('AA transactions', () => {
    it('builds the calls, drives the stages and forwards the tx hash', async () => {
      const cb = createCallbacks();
      const calls: AACall[] = [{ to: ADDRESS }];
      const callsFn = vi.fn(async () => calls);
      const sendAACalls = vi.fn(aaSdk());
      const sendTransaction = vi.fn(legacySdk());
      await run(
        { ...cb, callsFn, sendTransaction },
        { isAA: true, sendAACalls },
      );

      expect(sendAACalls).toHaveBeenCalledWith(calls, expect.any(Function));
      expect(sendTransaction).not.toHaveBeenCalled();
      expect(cb.onSign).toHaveBeenCalledWith(
        expect.objectContaining({ isAA: true }),
      );
      expect(cb.onReceipt).toHaveBeenCalledWith(
        expect.objectContaining({ txHashOrCallId: CALL_ID }),
      );
      expect(cb.onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({ txHash: TX_HASH, isAA: true }),
      );
      expect(cb.onFailure).not.toHaveBeenCalled();
    });

    it('reports a failure before settlement once, as is, and rejects', async () => {
      const cb = createCallbacks();
      const failed = new Error('Transaction failed');
      await expect(
        run(
          { ...cb, callsFn: async () => [] },
          { isAA: true, sendAACalls: aaSdk({ failWith: failed }) },
        ),
      ).rejects.toBe(failed);

      expect(cb.onFailure).toHaveBeenCalledTimes(1);
      expect(reportedError(cb.onFailure)).toBe(failed);
      expect(cb.onSuccess).not.toHaveBeenCalled();
    });

    it('reports a failing onSuccess once as settled and resolves', async () => {
      const cb = createCallbacks();
      const refreshError = new Error('balance refresh');
      cb.onSuccess.mockRejectedValue(refreshError);
      await expect(
        run(
          { ...cb, callsFn: async () => [] },
          { isAA: true, sendAACalls: aaSdk() },
        ),
      ).resolves.toBeUndefined();

      // DONE reports the failure itself; the ERROR stage the AA sender emits
      // afterwards for the same error must not report it a second time
      expect(cb.onFailure).toHaveBeenCalledTimes(1);
      const error = reportedError(cb.onFailure);
      expect(error).toBeInstanceOf(TxSettledError);
      expect(error.cause).toBe(refreshError);
    });
  });

  describe('stale operations', () => {
    it('does nothing for an invalid address', async () => {
      const sendTransaction = vi.fn(legacySdk());
      await run(
        { sendTransaction },
        { validateAddress: vi.fn(async () => false) },
      );
      expect(sendTransaction).not.toHaveBeenCalled();
    });

    it('does not send if the flow went stale during address validation', async () => {
      let current = true;
      const sendTransaction = vi.fn(legacySdk());
      await run(
        { sendTransaction },
        {
          isCurrent: () => current,
          validateAddress: async () => {
            current = false;
            return true;
          },
        },
      );
      expect(sendTransaction).not.toHaveBeenCalled();
    });

    it('does not reach the wallet if the flow went stale while building calls', async () => {
      let current = true;
      const sendAACalls = vi.fn(aaSdk());
      await run(
        {
          callsFn: async () => {
            current = false;
            return [];
          },
        },
        { isAA: true, sendAACalls, isCurrent: () => current },
      );
      expect(sendAACalls).not.toHaveBeenCalled();
    });

    it('aborts a legacy transaction that went stale before signing', async () => {
      let current = true;
      const send = vi.fn();
      const cb = createCallbacks();
      await expect(
        run(
          {
            ...cb,
            sendTransaction: legacySdk(
              { stage: TransactionCallbackStage.GAS_LIMIT },
              () => {
                current = false;
              },
              { stage: TransactionCallbackStage.SIGN },
              send,
            ),
          },
          { isCurrent: () => current },
        ),
      ).rejects.toBeInstanceOf(TxStaleError);
      expect(send).not.toHaveBeenCalled();
      expect(cb.onSign).not.toHaveBeenCalled();
      expect(cb.onFailure).not.toHaveBeenCalled();
    });

    it('aborts an AA transaction that went stale before signing', async () => {
      let current = true;
      const send = vi.fn();
      const cb = createCallbacks();
      // mirrors useSendAACalls: SIGN is awaited before sendCalls, errors are
      // reported as ERROR and rethrown
      const sendAACalls = async (
        _calls: unknown,
        callback: (props: TxCallbackProps) => Promise<void>,
      ) => {
        current = false;
        try {
          await callback({ stage: TransactionCallbackStage.SIGN });
          send();
        } catch (error) {
          await callback({ stage: TransactionCallbackStage.ERROR, error });
          throw error;
        }
      };
      await expect(
        run(
          { ...cb, callsFn: async () => [] },
          { isAA: true, sendAACalls, isCurrent: () => current },
        ),
      ).rejects.toBeInstanceOf(TxStaleError);
      expect(send).not.toHaveBeenCalled();
      expect(cb.onFailure).not.toHaveBeenCalled();
    });

    it('ignores stages reported after the flow went stale', async () => {
      let current = true;
      const cb = createCallbacks();
      await run(
        {
          ...cb,
          sendTransaction: legacySdk(
            { stage: TransactionCallbackStage.SIGN },
            () => {
              current = false;
            },
            { stage: TransactionCallbackStage.RECEIPT, payload: TX_HASH },
            {
              stage: TransactionCallbackStage.CONFIRMATION,
              payload: receipt(),
            },
            { stage: TransactionCallbackStage.DONE },
          ),
        },
        { isCurrent: () => current },
      );

      expect(cb.onSign).toHaveBeenCalledTimes(1);
      expect(cb.onReceipt).not.toHaveBeenCalled();
      expect(cb.onConfirmation).not.toHaveBeenCalled();
      expect(cb.onSuccess).not.toHaveBeenCalled();
      expect(cb.onFailure).not.toHaveBeenCalled();
    });
  });
});
