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

// 'unconfirmed': the receipt is in, but the confirmations read the SDK does
// between CONFIRMATION and DONE rejects, so the call fails after settling
// 'unlocated': the hash is in, but the receipt wait times out, so the call
// fails with the outcome never read
// 'unestimated': the SDK's gas estimate failed, so the wallet is never reached
export type LegacyOutcome =
  | 'success'
  | 'reverted'
  | 'rejected'
  | 'multisig'
  | 'unconfirmed'
  | 'unlocated'
  | 'unestimated';

// Mirrors the SDK's performTransaction stage sequence. Each call takes the
// next outcome, so a chained flow (unwrap or approve, then stake) can be
// driven through a confirmed first transaction and a failed second one
export const legacyPerformTransaction = (...outcomes: LegacyOutcome[]) =>
  vi.fn(async (props: PerformTransactionProps) => {
    const outcome = outcomes.shift() ?? 'success';
    const { callback, getGasLimit, sendTransaction, account } = props;
    if (outcome === 'unestimated') throw new Error('Not enough ether for gas');
    const gas = await getGasLimit({ account });
    await callback({ stage: TransactionCallbackStage.SIGN, payload: gas });
    if (outcome === 'rejected') throw new Error('User rejected the request');
    const hash = await sendTransaction({ account, gas });
    if (outcome === 'multisig') {
      await callback({ stage: TransactionCallbackStage.MULTISIG_DONE });
      return { hash };
    }
    await callback({ stage: TransactionCallbackStage.RECEIPT, payload: hash });
    if (outcome === 'unlocated') {
      throw new Error('Timed out while waiting for transaction');
    }
    const receipt = {
      status: outcome === 'reverted' ? 'reverted' : 'success',
      transactionHash: hash,
    } as unknown as TransactionReceipt;
    await callback({
      stage: TransactionCallbackStage.CONFIRMATION,
      payload: receipt,
    });
    if (outcome === 'unconfirmed') throw new Error('confirmations read failed');
    await callback({ stage: TransactionCallbackStage.DONE, payload: 0n });
    return { hash };
  });

type AAOutcome = {
  callId: string;
  txHash: Hash;
  // thrown before a call id is in (a rejected or refused batch); reported as
  // an ERROR stage and rethrown, like useSendAACalls does
  failWith?: unknown;
  // thrown after the call id is in (the status poll failed or timed out)
  lostAfterReceipt?: unknown;
};

type AACallback = (props: TxCallbackProps) => Promise<void>;

// Mirrors useSendAACalls: SIGN, RECEIPT (callId), DONE (txHash); the sender
// requires atomic execution of a batch, so there is no per-call outcome
export const aaSendCalls = ({
  callId,
  txHash,
  failWith,
  lostAfterReceipt,
}: AAOutcome) =>
  vi.fn(async (_calls: AACall[], callback: AACallback) => {
    try {
      await callback({ stage: TransactionCallbackStage.SIGN });
      if (failWith) throw failWith;
      await callback({ stage: TransactionCallbackStage.RECEIPT, callId });
      if (lostAfterReceipt) throw lostAfterReceipt;
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
