import { renderToStaticMarkup } from 'react-dom/server';
import type { Address, Hash, TransactionReceipt } from 'viem';
import {
  TransactionCallbackStage,
  type TransactionCallback,
} from '@lidofinance/lido-ethereum-sdk/core';

import type { AACall, TxCallbackProps } from 'modules/web3/hooks/tx-flow/types';

// Hooks run during a server render; the returned callback is then driven
// outside of React like the form submit would
export const renderHook = <T,>(useHook: () => T): T => {
  let value: T | undefined;
  const Probe = () => {
    value = useHook();
    return null;
  };
  renderToStaticMarkup(<Probe />);
  return value as T;
};

export type PerformTransactionProps = {
  account: { address: Address };
  callback: TransactionCallback;
  getGasLimit: (options: object) => Promise<bigint>;
  sendTransaction: (options: object) => Promise<Hash>;
};

export type LegacyOutcome = 'success' | 'reverted' | 'rejected' | 'multisig';

// Mirrors the SDK's performTransaction stage sequence. Each call takes the
// next outcome, so a chained flow (unwrap or approve, then stake) can be
// driven through a confirmed first transaction and a failed second one
export const legacyPerformTransaction = (...outcomes: LegacyOutcome[]) =>
  vi.fn(async (props: PerformTransactionProps) => {
    const outcome = outcomes.shift() ?? 'success';
    const { callback, getGasLimit, sendTransaction, account } = props;
    const gas = await getGasLimit({ account });
    await callback({ stage: TransactionCallbackStage.SIGN, payload: gas });
    if (outcome === 'rejected') throw new Error('User rejected the request');
    const hash = await sendTransaction({ account, gas });
    if (outcome === 'multisig') {
      await callback({ stage: TransactionCallbackStage.MULTISIG_DONE });
      return { hash };
    }
    await callback({ stage: TransactionCallbackStage.RECEIPT, payload: hash });
    const receipt = {
      status: outcome === 'reverted' ? 'reverted' : 'success',
      transactionHash: hash,
    } as unknown as TransactionReceipt;
    await callback({
      stage: TransactionCallbackStage.CONFIRMATION,
      payload: receipt,
    });
    await callback({ stage: TransactionCallbackStage.DONE, payload: 0n });
    return { hash };
  });

type AAOutcome = {
  callId: string;
  txHash: Hash;
  // reported as an ERROR stage and rethrown, like useSendAACalls does
  failWith?: unknown;
};

type AACallback = (props: TxCallbackProps) => Promise<void>;

// Mirrors useSendAACalls: SIGN, RECEIPT (callId), DONE (txHash); the batch
// is atomic, so there is no per-call outcome
export const aaSendCalls = ({ callId, txHash, failWith }: AAOutcome) =>
  vi.fn(async (_calls: AACall[], callback: AACallback) => {
    try {
      await callback({ stage: TransactionCallbackStage.SIGN });
      await callback({ stage: TransactionCallbackStage.RECEIPT, callId });
      if (failWith) throw failWith;
      await callback({ stage: TransactionCallbackStage.DONE, txHash });
    } catch (error) {
      await callback({ stage: TransactionCallbackStage.ERROR, error });
      throw error;
    }
  });

export const sentAACalls = (sendCalls: ReturnType<typeof aaSendCalls>) =>
  sendCalls.mock.calls[0]?.[0] ?? [];

// The order in which the mocks were first invoked
export const callOrder = (...mocks: ReturnType<typeof vi.fn>[]) =>
  mocks.map((mock) => mock.mock.invocationCallOrder[0] ?? Infinity);

export const expectOrdered = (...mocks: ReturnType<typeof vi.fn>[]) => {
  const order = callOrder(...mocks);
  expect(order).toEqual([...order].sort((a, b) => a - b));
  expect(order.every(Number.isFinite)).toBe(true);
};
