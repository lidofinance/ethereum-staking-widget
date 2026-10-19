import type { Address, Hash, TransactionReceipt } from 'viem';
import {
  TransactionCallbackStage,
  type TransactionCallback,
} from '@lidofinance/lido-ethereum-sdk/core';

import { TransactionRevertedError } from '../../utils/transaction-reverted-error';
import { TxSettledError } from '../../utils/tx-settled-error';
import { TxStaleError } from '../../utils/tx-stale-error';
import { runTxFlow } from './run-tx-flow';
import { isStepDone, isStepSent, isStepSettled } from './context';
import type {
  AACall,
  LegacyTxFlowArgs,
  StepTxFlowArgs,
  TxCallbackProps,
  TxFlowDeps,
  TxStep,
} from './types';

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

const run = (args: Partial<LegacyTxFlowArgs>, deps: Partial<TxFlowDeps> = {}) =>
  runTxFlow({ sendTransaction: legacySdk(), ...args }, createDeps(deps));

const runSteps = <TData = undefined>(
  args: StepTxFlowArgs<TData>,
  deps: Partial<TxFlowDeps> = {},
) => runTxFlow<TData>(args, createDeps(deps));

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
      ).resolves.toMatchObject({ ctx: { isAA: false }, isSuccess: true });

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
      ).resolves.toMatchObject({ ctx: { isAA: false }, isSuccess: true });

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
      ).resolves.toMatchObject({ ctx: { isAA: false }, isSuccess: true });

      expect(cb.onFailure).toHaveBeenCalledTimes(1);
      const error = reportedError(cb.onFailure);
      expect(error).toBeInstanceOf(TxSettledError);
      expect(error.txHash).toBe(TX_HASH);
    });

    it('propagates a failing onSuccess as settled when onFailure is omitted', async () => {
      const { onFailure: _, ...cb } = createCallbacks();
      const refreshError = new Error('balance refresh');
      cb.onSuccess.mockRejectedValue(refreshError);
      const error = await run({
        ...cb,
        sendTransaction: legacySdk(
          { stage: TransactionCallbackStage.RECEIPT, payload: TX_HASH },
          {
            stage: TransactionCallbackStage.CONFIRMATION,
            payload: receipt(),
          },
          { stage: TransactionCallbackStage.DONE },
        ),
      }).catch((e) => e);

      // The caller's own catch must get to show "completed, data unavailable"
      expect(error).toBeInstanceOf(TxSettledError);
      expect(error.cause).toBe(refreshError);
      expect(error.txHash).toBe(TX_HASH);
    });

    it('propagates a failure before settlement as is when onFailure is omitted', async () => {
      const { onFailure: _, ...cb } = createCallbacks();
      const signError = new Error('rejected');
      cb.onSign.mockRejectedValue(signError);
      await expect(
        run({
          ...cb,
          sendTransaction: legacySdk({
            stage: TransactionCallbackStage.SIGN,
          }),
        }),
      ).rejects.toBe(signError);
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

    it('rejects a failure before settlement as is, ignoring the ERROR stage', async () => {
      const cb = createCallbacks();
      const failed = new Error('Transaction failed');
      await expect(
        run(
          { ...cb, callsFn: async () => [] },
          { isAA: true, sendAACalls: aaSdk({ failWith: failed }) },
        ),
      ).rejects.toBe(failed);

      // The caller's catch handles rejection, same as for legacy transactions
      expect(cb.onFailure).not.toHaveBeenCalled();
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
      ).resolves.toMatchObject({ ctx: { isAA: true }, isSuccess: true });

      // The ERROR stage the AA sender emits must not report it a second time
      expect(cb.onFailure).toHaveBeenCalledTimes(1);
      const error = reportedError(cb.onFailure);
      expect(error).toBeInstanceOf(TxSettledError);
      expect(error.cause).toBe(refreshError);
    });

    it('propagates a failing onSuccess as settled when onFailure is omitted', async () => {
      const { onFailure: _, ...cb } = createCallbacks();
      const refreshError = new Error('balance refresh');
      cb.onSuccess.mockRejectedValue(refreshError);
      const error = await run(
        { ...cb, callsFn: async () => [] },
        { isAA: true, sendAACalls: aaSdk() },
      ).catch((e) => e);

      // The ERROR stage the AA sender emits has no handler to report to, so
      // the error must still reach the caller
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

  describe('stepwise flows', () => {
    const steps: TxStep[] = [
      { stepId: 'unwrap', to: ADDRESS },
      { stepId: 'stake', to: ADDRESS, value: 1n },
    ];
    const settledStages = (hash: Hash): Stage[] => [
      { stage: TransactionCallbackStage.SIGN },
      { stage: TransactionCallbackStage.RECEIPT, payload: hash },
      { stage: TransactionCallbackStage.CONFIRMATION, payload: receipt() },
      { stage: TransactionCallbackStage.DONE },
    ];

    it('sends the steps one by one and tells each stage which step reports', async () => {
      const cb = createCallbacks();
      const sendStep = vi.fn(
        async (step: TxStep, callback: TransactionCallback) =>
          legacySdk(
            ...settledStages(step.stepId === 'unwrap' ? TX_HASH : TX_HASH_2),
          )(callback),
      );
      const callsFn = vi.fn(async () => steps);

      const result = await runSteps({ ...cb, callsFn, sendStep });
      const { ctx } = result;

      expect(callsFn).toHaveBeenCalledWith(
        expect.objectContaining({ isAA: false }),
      );
      expect(sendStep.mock.calls.map(([step]) => step.stepId)).toEqual([
        'unwrap',
        'stake',
      ]);
      expect(cb.onSign.mock.calls.map(([args]) => args.ctx.stepId)).toEqual([
        'unwrap',
        'stake',
      ]);
      expect(
        cb.onSuccess.mock.calls.map(([args]) => [args.ctx.stepId, args.txHash]),
      ).toEqual([
        ['unwrap', TX_HASH],
        ['stake', TX_HASH_2],
      ]);
      // the stake's stages see the unwrap done, their own step as it goes
      const stakeSign = cb.onSign.mock.calls[1]?.[0].ctx;
      expect(isStepDone(stakeSign, 'unwrap')).toBe(true);
      expect(isStepSent(stakeSign, 'stake')).toBe(false);
      expect(ctx.status).toEqual({ unwrap: 'done', stake: 'done' });
      expect(ctx.calls).toEqual(steps);
      expect(cb.onFailure).not.toHaveBeenCalled();
      expect(result).toMatchObject({
        isSuccess: true,
        isInterrupted: false,
        isAborted: false,
      });
    });

    it('reports a failure before the second step was sent, with the first one done', async () => {
      const cb = createCallbacks();
      const rejected = new Error('User rejected the request');
      const sendStep = vi.fn(
        async (step: TxStep, callback: TransactionCallback) =>
          step.stepId === 'unwrap'
            ? legacySdk(...settledStages(TX_HASH))(callback)
            : legacySdk({ stage: TransactionCallbackStage.SIGN }, () => {
                throw rejected;
              })(callback),
      );

      const result = await runSteps({
        ...cb,
        callsFn: async () => steps,
        sendStep,
      });
      const { ctx } = result;

      expect(cb.onFailure).toHaveBeenCalledTimes(1);
      const args = cb.onFailure.mock.calls[0]?.[0];
      expect(args.error).toBe(rejected);
      expect(args.ctx.stepId).toBe('stake');
      expect(isStepSettled(args.ctx, 'unwrap')).toBe(true);
      expect(isStepSent(args.ctx, 'stake')).toBe(false);
      expect(ctx.status).toEqual({ unwrap: 'done' });
      expect(result).toMatchObject({
        isSuccess: false,
        isInterrupted: true,
        error: rejected,
      });
    });

    it('reports a settled step whose follow-up read failed as settled', async () => {
      const cb = createCallbacks();
      const sendStep = vi.fn(
        async (_step: TxStep, callback: TransactionCallback) =>
          legacySdk(
            { stage: TransactionCallbackStage.RECEIPT, payload: TX_HASH },
            {
              stage: TransactionCallbackStage.CONFIRMATION,
              payload: receipt(),
            },
            () => {
              throw new Error('confirmations read');
            },
          )(callback),
      );

      const { ctx } = await runSteps({
        ...cb,
        callsFn: async () => [steps[0]],
        sendStep,
      });

      expect(reportedError(cb.onFailure)).toBeInstanceOf(TxSettledError);
      expect(isStepSettled(ctx, 'unwrap')).toBe(true);
      expect(isStepDone(ctx, 'unwrap')).toBe(false);
    });

    it('rejects when there is no onFailure, like a legacy flow', async () => {
      const failed = new Error('boom');
      await expect(
        runSteps({
          callsFn: async () => steps,
          sendStep: async () => {
            throw failed;
          },
        }),
      ).rejects.toBe(failed);
    });

    it('reports a failing callsFn as a failure of the flow', async () => {
      const cb = createCallbacks();
      const bad = new Error('quote changed');
      const { ctx } = await runSteps({
        ...cb,
        callsFn: async () => {
          throw bad;
        },
        sendStep: vi.fn(),
      });
      expect(reportedError(cb.onFailure)).toBe(bad);
      expect(ctx.stepId).toBeUndefined();
    });

    it('signs an AA batch as one tx reporting as its last step', async () => {
      const cb = createCallbacks();
      const sendAACalls = vi.fn(aaSdk());
      const sendStep = vi.fn();
      const callsFn = vi.fn(async () => steps);

      const { ctx } = await runSteps(
        { ...cb, callsFn, sendStep },
        { isAA: true, sendAACalls },
      );

      expect(callsFn).toHaveBeenCalledWith(
        expect.objectContaining({ isAA: true }),
      );
      expect(sendAACalls).toHaveBeenCalledWith(steps, expect.any(Function));
      expect(sendStep).not.toHaveBeenCalled();
      expect(cb.onSign).toHaveBeenCalledWith(
        expect.objectContaining({
          ctx: expect.objectContaining({ stepId: 'stake' }),
        }),
      );
      expect(ctx.status).toEqual({ unwrap: 'done', stake: 'done' });
    });

    it('ends a stale flow silently: nothing is reported', async () => {
      const cb = createCallbacks();
      let current = true;
      const sendStep = vi.fn(
        async (_step: TxStep, callback: TransactionCallback) =>
          legacySdk(
            () => {
              current = false;
            },
            { stage: TransactionCallbackStage.SIGN },
          )(callback),
      );
      await expect(
        runSteps(
          { ...cb, callsFn: async () => steps, sendStep },
          { isCurrent: () => current },
        ),
      ).resolves.toMatchObject({ isAborted: true, isSuccess: false });
      expect(cb.onFailure).not.toHaveBeenCalled();
      expect(cb.onSign).not.toHaveBeenCalled();
    });

    it('runs prepare first and hands its data to every stage', async () => {
      const cb = createCallbacks();
      const prepare = vi.fn(async () => ({ amount: 7n }));
      const callsFn = vi.fn(async (ctx: { data: { amount: bigint } }) => [
        { stepId: 'stake', to: ADDRESS, value: ctx.data.amount },
      ]);
      const sendStep = vi.fn(
        async (_step: TxStep, callback: TransactionCallback) =>
          legacySdk(...settledStages(TX_HASH))(callback),
      );

      const { ctx } = await runSteps({ ...cb, prepare, callsFn, sendStep });

      expect(prepare).toHaveBeenCalledWith(
        expect.objectContaining({ data: undefined, isAA: false }),
      );
      expect(callsFn).toHaveBeenCalledWith(
        expect.objectContaining({ data: { amount: 7n } }),
      );
      expect(sendStep).toHaveBeenCalledWith(
        expect.objectContaining({ value: 7n }),
        expect.any(Function),
        expect.objectContaining({ data: { amount: 7n } }),
      );
      expect(cb.onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          ctx: expect.objectContaining({ data: { amount: 7n } }),
        }),
      );
      expect(ctx.data).toEqual({ amount: 7n });
    });

    it('reports a failing prepare before any step, without data', async () => {
      const cb = createCallbacks();
      const bad = new Error('amount is null');
      const callsFn = vi.fn();
      const { ctx } = await runSteps({
        ...cb,
        prepare: async () => {
          throw bad;
        },
        callsFn,
        sendStep: vi.fn(),
      });
      expect(callsFn).not.toHaveBeenCalled();
      const args = cb.onFailure.mock.calls[0]?.[0];
      expect(args.error).toBe(bad);
      expect(args.ctx.data).toBeUndefined();
      expect(ctx.calls).toEqual([]);
    });
  });
});
