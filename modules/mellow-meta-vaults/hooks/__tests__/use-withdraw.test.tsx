import { decodeFunctionData, getAddress, type Address, type Hash } from 'viem';

import type { TxFlowArgs } from 'modules/web3/hooks/tx-flow/types';
import { TxSettledError, TxSentDataUnavailableError } from 'modules/web3';
import {
  aaSendCalls,
  legacyPerformTransaction,
  renderHook,
  sentAACalls,
} from 'features/stake/shared/__tests__/stake-test-utils';
import {
  ASYNC_REDEEM_QUEUE_ABI,
  SYNC_REDEEM_QUEUE_ABI,
} from 'modules/mellow-meta-vaults/abi';
import type {
  AsyncRedeemQueueWritableContract,
  CollectorContract,
  SyncRedeemQueueWritableContract,
} from 'modules/mellow-meta-vaults/types/contracts';

// Referenced from the hoisted mock factories, so hoisted with them
const { ACCOUNT } = vi.hoisted(() => ({
  ACCOUNT: '0x00000000000000000000000000000000000000aa' as const,
}));
const SYNC_QUEUE: Address = '0x00000000000000000000000000000000000000c1';
const ASYNC_QUEUE: Address = '0x00000000000000000000000000000000000000c2';
const TX_HASH: Hash =
  '0x1111111111111111111111111111111111111111111111111111111111111111';
const CALL_ID = '0xcall';

const AMOUNT = 60n;

const state = vi.hoisted(() => ({
  isAA: false,
  performTransaction: vi.fn(),
  sendAACalls: vi.fn(),
  txModalStages: {
    sign: vi.fn(),
    pending: vi.fn(),
    success: vi.fn(),
    successMultisig: vi.fn(),
    failed: vi.fn(),
    instantWithdrawalUnavailable: vi.fn(),
  },
}));

vi.mock('modules/web3', async () => {
  const { runTxFlow } = await import('modules/web3/hooks/tx-flow/run-tx-flow');
  const errors = await import('modules/web3/utils');
  const context = await import('modules/web3/hooks/tx-flow/context');
  return {
    ...errors,
    ...context,
    // getErrorMessage checks instances of it; the sender itself is mocked
    SendCallsError: class SendCallsError extends Error {},
    useDappStatus: () => ({ address: ACCOUNT }),
    useLidoSDK: () => ({
      core: { performTransaction: state.performTransaction },
    }),
    useTxFlow: () => (args: TxFlowArgs) =>
      runTxFlow(args, {
        isAA: state.isAA,
        address: ACCOUNT,
        validateAddress: async () => true,
        sendAACalls: state.sendAACalls,
        isCurrent: () => true,
      }),
    applyRoundUpTxParameter: (value: bigint) => value,
  };
});
vi.mock('utils/qa', () => ({
  overrideWithQAMockBigInt: (value: bigint) => value,
}));
vi.mock('utils/track-matomo-event', () => ({ trackMatomoEvent: vi.fn() }));

import { useWithdraw } from '../use-withdraw';

type QueueReads = {
  // one value per call, the last one repeats: a limit can shrink mid-flow
  remainingDailyLimit: bigint[];
  liquidAssets: bigint;
  assets: bigint;
  isWithdrawalPossible: boolean;
};

const createQueues = ({
  remainingDailyLimit,
  liquidAssets,
  assets,
  isWithdrawalPossible,
}: QueueReads) => {
  const limits = [...remainingDailyLimit];
  const nextLimit = () =>
    limits.length > 1 ? (limits.shift() as bigint) : limits[0];
  const syncRedeemQueue = {
    address: SYNC_QUEUE,
    abi: SYNC_REDEEM_QUEUE_ABI,
    read: {
      remainingDailyLimit: vi.fn(async () => [0n, nextLimit()] as const),
      getLiquidAssets: vi.fn(async () => liquidAssets),
    },
    estimateGas: { redeem: vi.fn(async () => 100_000n) },
    write: { redeem: vi.fn(async () => TX_HASH) },
  };
  const asyncRedeemQueue = {
    address: ASYNC_QUEUE,
    abi: ASYNC_REDEEM_QUEUE_ABI,
    estimateGas: { redeem: vi.fn(async () => 100_000n) },
    write: { redeem: vi.fn(async () => TX_HASH) },
  };
  const collector = {
    read: {
      getWithdrawalParams: vi.fn(async () => ({
        assets,
        isWithdrawalPossible,
      })),
    },
  };
  return { syncRedeemQueue, asyncRedeemQueue, collector };
};
type Queues = ReturnType<typeof createQueues>;

const onRetry = vi.fn();

const withdraw = (queues: Queues, { sync = true } = {}) =>
  renderHook(() =>
    useWithdraw({
      asyncRedeemQueue:
        queues.asyncRedeemQueue as unknown as AsyncRedeemQueueWritableContract,
      syncRedeemQueue: sync
        ? (queues.syncRedeemQueue as unknown as SyncRedeemQueueWritableContract)
        : undefined,
      collector: queues.collector as unknown as CollectorContract,
      txModalStages: state.txModalStages,
      onRetry,
    }),
  ).withdraw({ amount: AMOUNT });

// enough on both counts for the instant route
const ample: QueueReads = {
  remainingDailyLimit: [100n],
  liquidAssets: 100n,
  assets: 60n,
  isWithdrawalPossible: true,
};

const consoleErrorSpy = vi
  .spyOn(console, 'error')
  .mockImplementation(() => undefined);

beforeEach(() => {
  vi.clearAllMocks();
  state.isAA = false;
  state.performTransaction.mockImplementation(legacyPerformTransaction());
});
afterAll(() => {
  consoleErrorSpy.mockRestore();
});

describe('useWithdraw', () => {
  describe('routing', () => {
    it('redeems instantly when the sync queue can take the request', async () => {
      const queues = createQueues(ample);

      await expect(withdraw(queues)).resolves.toBe(true);

      expect(queues.syncRedeemQueue.write.redeem).toHaveBeenCalledWith(
        [AMOUNT, ACCOUNT],
        expect.anything(),
      );
      expect(queues.asyncRedeemQueue.write.redeem).not.toHaveBeenCalled();
      expect(state.txModalStages.sign).toHaveBeenCalledWith(AMOUNT);
      expect(state.txModalStages.pending).toHaveBeenCalledWith(
        AMOUNT,
        TX_HASH,
        false,
      );
      expect(state.txModalStages.success).toHaveBeenCalledWith(
        AMOUNT,
        TX_HASH,
        true,
      );
      expect(state.txModalStages.failed).not.toHaveBeenCalled();
    });

    it('requests through the async queue when the daily limit is short', async () => {
      const queues = createQueues({ ...ample, remainingDailyLimit: [59n] });

      await expect(withdraw(queues)).resolves.toBe(true);

      expect(queues.asyncRedeemQueue.write.redeem).toHaveBeenCalledWith(
        [AMOUNT],
        expect.anything(),
      );
      expect(queues.syncRedeemQueue.write.redeem).not.toHaveBeenCalled();
      // the limit read short-circuits the rest of the check
      expect(queues.collector.read.getWithdrawalParams).not.toHaveBeenCalled();
      expect(state.txModalStages.success).toHaveBeenCalledWith(
        AMOUNT,
        TX_HASH,
        false,
      );
    });

    it('requests through the async queue when the Collector says instant is impossible', async () => {
      const queues = createQueues({
        ...ample,
        isWithdrawalPossible: false,
        assets: 0n,
      });

      await expect(withdraw(queues)).resolves.toBe(true);

      expect(queues.asyncRedeemQueue.write.redeem).toHaveBeenCalledTimes(1);
      expect(queues.syncRedeemQueue.write.redeem).not.toHaveBeenCalled();
    });

    it('falls back to the async queue when the availability read fails', async () => {
      const queues = createQueues(ample);
      queues.syncRedeemQueue.read.getLiquidAssets.mockRejectedValue(
        new Error('rpc down'),
      );

      await expect(withdraw(queues)).resolves.toBe(true);

      expect(queues.asyncRedeemQueue.write.redeem).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('falling back to the async redeem queue'),
        expect.any(Error),
      );
    });

    it('never checks the sync queue when there is none', async () => {
      const queues = createQueues(ample);

      await expect(withdraw(queues, { sync: false })).resolves.toBe(true);

      expect(
        queues.syncRedeemQueue.read.remainingDailyLimit,
      ).not.toHaveBeenCalled();
      expect(queues.asyncRedeemQueue.write.redeem).toHaveBeenCalledTimes(1);
    });
  });

  describe('failures on the instant route', () => {
    // ETHV-WD-ROUTE-06: the redemption settled, only the confirmations read
    // failed. The capacity it used must not read as a depleted buffer
    it('reports a settled redemption as completed, without rechecking the buffer', async () => {
      state.performTransaction.mockImplementation(
        legacyPerformTransaction('unconfirmed'),
      );
      // the redemption takes more than half of what was left
      const queues = createQueues({
        ...ample,
        remainingDailyLimit: [100n, 40n],
      });

      await expect(withdraw(queues)).resolves.toBe(true);

      expect(queues.syncRedeemQueue.write.redeem).toHaveBeenCalledTimes(1);
      expect(state.txModalStages.failed).toHaveBeenCalledTimes(1);
      expect(state.txModalStages.failed.mock.calls[0]?.[0]).toBeInstanceOf(
        TxSettledError,
      );
      expect(state.txModalStages.failed.mock.calls[0]?.[1]).toBeUndefined();
      expect(
        state.txModalStages.instantWithdrawalUnavailable,
      ).not.toHaveBeenCalled();
      // only the check before the transaction read the limit
      expect(
        queues.syncRedeemQueue.read.remainingDailyLimit,
      ).toHaveBeenCalledTimes(1);
    });

    it('reports a redemption that could not be read back as sent, without rechecking the buffer', async () => {
      state.performTransaction.mockImplementation(
        legacyPerformTransaction('unlocated'),
      );
      // the redemption would take more than half of what was left: a recheck
      // would misreport the instant route as gone
      const queues = createQueues({
        ...ample,
        remainingDailyLimit: [100n, 40n],
      });

      await expect(withdraw(queues)).resolves.toBe(false);

      expect(queues.syncRedeemQueue.write.redeem).toHaveBeenCalledTimes(1);
      expect(state.txModalStages.failed).toHaveBeenCalledTimes(1);
      expect(state.txModalStages.failed.mock.calls[0]?.[0]).toBeInstanceOf(
        TxSentDataUnavailableError,
      );
      expect(state.txModalStages.failed.mock.calls[0]?.[1]).toBeUndefined();
      expect(
        state.txModalStages.instantWithdrawalUnavailable,
      ).not.toHaveBeenCalled();
      expect(
        queues.syncRedeemQueue.read.remainingDailyLimit,
      ).toHaveBeenCalledTimes(1);
    });

    it('sends the user to the standard route when a reverted redemption finds the buffer gone', async () => {
      state.performTransaction.mockImplementation(
        legacyPerformTransaction('reverted'),
      );
      const queues = createQueues({
        ...ample,
        remainingDailyLimit: [100n, 10n],
      });

      await expect(withdraw(queues)).resolves.toBe(false);

      expect(
        state.txModalStages.instantWithdrawalUnavailable,
      ).toHaveBeenCalledTimes(1);
      expect(state.txModalStages.failed).not.toHaveBeenCalled();
      expect(
        queues.syncRedeemQueue.read.remainingDailyLimit,
      ).toHaveBeenCalledTimes(2);
    });

    it('offers a retry when a reverted redemption still fits the buffer', async () => {
      state.performTransaction.mockImplementation(
        legacyPerformTransaction('reverted'),
      );
      const queues = createQueues(ample);

      await expect(withdraw(queues)).resolves.toBe(false);

      expect(state.txModalStages.failed).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'TRANSACTION_REVERTED' }),
        onRetry,
      );
      expect(
        state.txModalStages.instantWithdrawalUnavailable,
      ).not.toHaveBeenCalled();
    });

    it('does not recheck the buffer after a rejected signature', async () => {
      state.performTransaction.mockImplementation(
        legacyPerformTransaction('rejected'),
      );
      const queues = createQueues({
        ...ample,
        remainingDailyLimit: [100n, 0n],
      });

      await expect(withdraw(queues)).resolves.toBe(false);

      expect(state.txModalStages.failed).toHaveBeenCalledWith(
        expect.any(Error),
        onRetry,
      );
      expect(
        state.txModalStages.instantWithdrawalUnavailable,
      ).not.toHaveBeenCalled();
      expect(
        queues.syncRedeemQueue.read.remainingDailyLimit,
      ).toHaveBeenCalledTimes(1);
    });

    it('reports a multisig proposal without waiting for a receipt', async () => {
      state.performTransaction.mockImplementation(
        legacyPerformTransaction('multisig'),
      );
      const queues = createQueues(ample);

      await expect(withdraw(queues)).resolves.toBe(true);

      expect(state.txModalStages.successMultisig).toHaveBeenCalledTimes(1);
      expect(state.txModalStages.success).not.toHaveBeenCalled();
    });
  });

  describe('EIP-5792 signing', () => {
    beforeEach(() => {
      state.isAA = true;
    });

    it('sends the instant redemption as a single call', async () => {
      const sendCalls = aaSendCalls({ callId: CALL_ID, txHash: TX_HASH });
      state.sendAACalls.mockImplementation(sendCalls);
      const queues = createQueues(ample);

      await expect(withdraw(queues)).resolves.toBe(true);

      expect(state.performTransaction).not.toHaveBeenCalled();
      const calls = sentAACalls(sendCalls);
      expect(calls).toHaveLength(1);
      expect(calls[0]?.to).toBe(SYNC_QUEUE);
      const decoded = decodeFunctionData({
        abi: SYNC_REDEEM_QUEUE_ABI,
        data: calls[0]?.data as Hash,
      });
      expect(decoded.functionName).toBe('redeem');
      expect(decoded.args).toEqual([AMOUNT, getAddress(ACCOUNT)]);
      expect(state.txModalStages.pending).toHaveBeenCalledWith(
        AMOUNT,
        CALL_ID,
        true,
      );
      expect(state.txModalStages.success).toHaveBeenCalledWith(
        AMOUNT,
        TX_HASH,
        true,
      );
    });

    it('sends the async request as a single call when instant is short', async () => {
      const sendCalls = aaSendCalls({ callId: CALL_ID, txHash: TX_HASH });
      state.sendAACalls.mockImplementation(sendCalls);
      const queues = createQueues({ ...ample, liquidAssets: 1n });

      await expect(withdraw(queues)).resolves.toBe(true);

      const calls = sentAACalls(sendCalls);
      expect(calls[0]?.to).toBe(ASYNC_QUEUE);
      const decoded = decodeFunctionData({
        abi: ASYNC_REDEEM_QUEUE_ABI,
        data: calls[0]?.data as Hash,
      });
      expect(decoded.args).toEqual([AMOUNT]);
      expect(state.txModalStages.success).toHaveBeenCalledWith(
        AMOUNT,
        TX_HASH,
        false,
      );
    });

    it('reports a rejected batch and offers a retry', async () => {
      state.sendAACalls.mockImplementation(
        aaSendCalls({
          callId: CALL_ID,
          txHash: TX_HASH,
          failWith: new Error('User rejected the request'),
        }),
      );
      const queues = createQueues(ample);

      await expect(withdraw(queues)).resolves.toBe(false);

      expect(state.txModalStages.failed).toHaveBeenCalledWith(
        expect.any(Error),
        onRetry,
      );
    });
  });
});
