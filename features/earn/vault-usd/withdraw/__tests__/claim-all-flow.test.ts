import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TransactionCallbackStage as Stage } from '@lidofinance/lido-ethereum-sdk/core';
import type { TxFlowArgs } from 'modules/web3/hooks/tx-flow/types';
import {
  claimLog,
  claimReceipt,
  revertedReceipt,
  usdcQueue,
  usdtQueue,
} from './claim-fixtures';
import { TransactionRevertedError } from 'modules/web3/utils/transaction-reverted-error';
import type { TransactionReceipt } from 'viem';
import type { ClaimResult } from '../claim-all-utils';

const mocks = vi.hoisted(() => ({
  result: vi.fn(),
  sign: vi.fn(),
  pending: vi.fn(),
  refresh: vi.fn(),
  perform: vi.fn(),
  receipt: vi.fn(),
  status: vi.fn(),
  transaction: vi.fn(),
  aa: false,
  batchFails: false,
}));
vi.mock('react', () => ({
  useMemo: (fn: () => unknown) => fn(),
  useCallback: (fn: unknown) => fn,
  useRef: (value: unknown) => ({ current: value }),
  useState: (value: unknown) => [value, vi.fn()],
}));
vi.mock('utils', () => ({
  getErrorMessage: (error: Error) => error.message,
  ErrorMessage: { DENIED_SIG: 'rejected' },
}));
vi.mock('utils/track-matomo-event', () => ({ trackMatomoEvent: vi.fn() }));
vi.mock('../../contracts', async () => ({
  getRedeemQueueWritableContract: (
    (abi) =>
    ({ token }: { token: string }) => ({
      abi,
      address:
        token === 'usdc'
          ? '0x0000000000000000000000000000000000000002'
          : '0x0000000000000000000000000000000000000003',
    })
  )((await import('modules/mellow-meta-vaults/abi')).ASYNC_REDEEM_QUEUE_ABI),
}));
vi.mock('../hooks/use-withdraw-requests', () => ({
  useUsdVaultWithdrawRequests: () => ({
    data: {
      claimableRequests: [
        { token: 'usdc', assets: 10n, timestamp: 1n },
        { token: 'usdt', assets: 20n, timestamp: 2n },
      ],
    },
  }),
}));
vi.mock('../hooks/use-withdraw-form-data', () => ({
  useUsdVaultWithdrawFormData: () => ({ refetchData: mocks.refresh }),
}));
vi.mock('../hooks/use-withdraw-claim-all-tx-modal', () => ({
  useUsdVaultWithdrawClaimAllTxModal: () => ({ txModalStages: mocks }),
}));
vi.mock('modules/web3', () => ({
  useDappStatus: () => ({
    address: '0x0000000000000000000000000000000000000001',
  }),
  useMainnetOnlyWagmi: () => ({
    publicClientMainnet: {
      getTransactionReceipt: mocks.receipt,
      getTransaction: mocks.transaction,
    },
  }),
  useLidoSDK: () => ({
    core: {
      performTransaction: mocks.perform,
      walletClient: { getCallsStatus: mocks.status },
    },
  }),
  applyRoundUpTxParameter: (value: bigint) => value,
  useTxFlow: () => async (args: TxFlowArgs) => {
    if (mocks.aa) {
      await args.callsFn?.();
      await args.onSign?.({ stage: Stage.SIGN, isAA: true });
      await args.onReceipt?.({
        stage: Stage.RECEIPT,
        isAA: true,
        txHashOrCallId: '0xbatch',
      });
      // Mirrors useSendAACalls: it waits for the batch and hands the resolved
      // status to the terminal stage, success or failure alike. `undefined`
      // stands for a batch that never resolved, e.g. a polling timeout.
      let callStatus;
      try {
        callStatus = await mocks.status({ id: '0xbatch' });
      } catch {
        callStatus = undefined;
      }
      if (mocks.batchFails) {
        const error = new Error('batch failed');
        await args.onFailure?.({
          stage: Stage.ERROR,
          isAA: true,
          error,
          callStatus,
        });
        throw error;
      }
      await args.onSuccess?.({
        stage: Stage.DONE,
        isAA: true,
        txHash: '0xlast',
        callStatus,
      });
      return;
    }
    await args.sendTransaction(async (stage) => {
      const common = { isAA: false };
      if (stage.stage === Stage.SIGN)
        await args.onSign?.({ ...common, stage: Stage.SIGN });
      if (stage.stage === Stage.RECEIPT)
        await args.onReceipt?.({
          ...common,
          stage: Stage.RECEIPT,
          txHashOrCallId: stage.payload,
        });
      // Mirrors useTxFlow: a reverted receipt aborts the flow right here, so
      // this call never returns and the DONE stage never runs.
      if (
        stage.stage === Stage.CONFIRMATION &&
        stage.payload?.status === 'reverted'
      )
        throw new TransactionRevertedError(stage.payload);
      if (stage.stage === Stage.DONE)
        await args.onSuccess?.({ ...common, stage: Stage.DONE });
    });
  },
}));

import { useUsdVaultWithdrawClaimAll } from '../hooks/use-withdraw-claim-all';

type Callback = {
  callback: (args: {
    stage: Stage;
    payload?: `0x${string}` | TransactionReceipt;
  }) => Promise<void>;
};
const hash = '0x123' as const;
const complete = async ({ callback }: Callback) => {
  await callback({ stage: Stage.SIGN });
  await callback({ stage: Stage.RECEIPT, payload: hash });
  await callback({
    stage: Stage.CONFIRMATION,
    payload: claimReceipt([claimLog(usdcQueue, 1), claimLog(usdtQueue, 2)]),
  });
  await callback({ stage: Stage.DONE });
};
const results = () => mocks.result.mock.calls[0][0] as ClaimResult[];

beforeEach(() => {
  vi.clearAllMocks();
  mocks.aa = false;
  mocks.batchFails = false;
  mocks.status.mockReset();
  mocks.perform.mockReset().mockImplementation(complete);
  mocks.refresh.mockReset().mockResolvedValue(undefined);
  mocks.receipt.mockReset().mockRejectedValue(new Error('Receipt unavailable'));
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('USD claim all orchestration', () => {
  it('tracks both tokens and refreshes without repeating the last refetch', async () => {
    expect(await useUsdVaultWithdrawClaimAll().withdrawClaimAll()).toBe(true);
    expect(
      results().map(({ token, status, txHash }) => ({ token, status, txHash })),
    ).toEqual([
      { token: 'USDC', status: 'claimed', txHash: hash },
      { token: 'USDT', status: 'claimed', txHash: hash },
    ]);
    expect(
      mocks.sign.mock.calls.map(([entries, step]) => [entries[0].token, step]),
    ).toEqual([
      ['USDC', 'Transaction 1 of 2'],
      ['USDT', 'Transaction 2 of 2'],
    ]);
    // One refresh between the two claims, one final refresh in `finally`.
    // The last claim must not trigger two identical refetches in a row.
    expect(mocks.refresh).toHaveBeenCalledTimes(2);
  });
  it('preserves the first claim when the second signature is rejected', async () => {
    mocks.perform
      .mockImplementationOnce(complete)
      .mockImplementationOnce(async ({ callback }: Callback) => {
        await callback({ stage: Stage.SIGN });
        throw new Error('rejected');
      });
    expect(await useUsdVaultWithdrawClaimAll().withdrawClaimAll()).toBe(false);
    expect(results().map(({ status }) => status)).toEqual([
      'claimed',
      'rejected',
    ]);
    expect(results()[0].txHash).toBe(hash);
    expect(results()[1].txHash).toBeUndefined();
  });
  it('does not start the second operation after rejection of the first', async () => {
    mocks.perform.mockImplementationOnce(async ({ callback }: Callback) => {
      await callback({ stage: Stage.SIGN });
      throw new Error('rejected');
    });
    await useUsdVaultWithdrawClaimAll().withdrawClaimAll();
    expect(results().map(({ status }) => status)).toEqual([
      'rejected',
      'not-started',
    ]);
    expect(mocks.perform).toHaveBeenCalledTimes(1);
  });
  it('does not label an unconfirmed submitted transaction as failed', async () => {
    mocks.perform.mockImplementationOnce(async ({ callback }: Callback) => {
      await callback({ stage: Stage.SIGN });
      await callback({ stage: Stage.RECEIPT, payload: hash });
      throw new Error('timeout');
    });
    await useUsdVaultWithdrawClaimAll().withdrawClaimAll();
    expect(results().map(({ status }) => status)).toEqual([
      'unknown',
      'not-started',
    ]);
  });
  // The only path that reads a receipt straight from the chain: the flow gave
  // up, but the transaction was mined anyway.
  it('resolves a submitted transaction from its receipt after a timeout', async () => {
    mocks.perform.mockImplementationOnce(async ({ callback }: Callback) => {
      await callback({ stage: Stage.SIGN });
      await callback({ stage: Stage.RECEIPT, payload: hash });
      throw new Error('timeout');
    });
    mocks.receipt.mockResolvedValue(
      claimReceipt([claimLog(usdcQueue, 1)], '0xmined'),
    );

    await useUsdVaultWithdrawClaimAll().withdrawClaimAll();
    expect(results().map(({ status }) => status)).toEqual([
      'claimed',
      'not-started',
    ]);
    // The mined hash wins over the one we submitted.
    expect(results()[0].txHash).toBe('0xmined');
  });
  it('keeps successful claims when refreshing queries fails', async () => {
    mocks.refresh.mockRejectedValue(new Error('offline'));
    expect(await useUsdVaultWithdrawClaimAll().withdrawClaimAll()).toBe(true);
    expect(results().every(({ status }) => status === 'claimed')).toBe(true);
    expect(mocks.result.mock.calls[0][1].refreshFailed).toBe(true);
  });
});

describe('AA results', () => {
  it('maps two payout tokens to the same atomic transaction using events', async () => {
    mocks.aa = true;
    mocks.status.mockResolvedValue({
      atomic: true,
      receipts: [
        {
          transactionHash: hash,
          status: 'success',
          logs: [claimLog(usdcQueue, 1), claimLog(usdtQueue, 2)],
        },
      ],
    });
    expect(await useUsdVaultWithdrawClaimAll().withdrawClaimAll()).toBe(true);
    expect(results().map(({ status, txHash }) => [status, txHash])).toEqual([
      ['claimed', hash],
      ['claimed', hash],
    ]);
    expect(mocks.perform).not.toHaveBeenCalled();
  });
  it('maps non-atomic receipts independently of their order', async () => {
    mocks.aa = true;
    mocks.status.mockResolvedValue({
      atomic: false,
      receipts: [
        {
          transactionHash: '0x222',
          status: 'success',
          logs: [claimLog(usdtQueue, 2)],
        },
        {
          transactionHash: '0x111',
          status: 'success',
          logs: [claimLog(usdcQueue, 1)],
        },
      ],
    });
    await useUsdVaultWithdrawClaimAll().withdrawClaimAll();
    expect(results().map(({ txHash }) => txHash)).toEqual(['0x111', '0x222']);
  });
  it('preserves known partial success after a failed batch', async () => {
    mocks.aa = true;
    mocks.batchFails = true;
    mocks.status.mockResolvedValue({
      atomic: false,
      receipts: [
        {
          transactionHash: hash,
          status: 'success',
          logs: [claimLog(usdcQueue, 1)],
        },
      ],
    });
    expect(await useUsdVaultWithdrawClaimAll().withdrawClaimAll()).toBe(false);
    expect(results().map(({ status }) => status)).toEqual([
      'claimed',
      'unknown',
    ]);
  });
  it('keeps the resolved batch when a later status lookup fails', async () => {
    mocks.aa = true;
    mocks.status
      .mockResolvedValueOnce({
        atomic: true,
        receipts: [
          {
            transactionHash: hash,
            status: 'success',
            logs: [claimLog(usdcQueue, 1), claimLog(usdtQueue, 2)],
          },
        ],
      })
      .mockRejectedValue(new Error('offline'));

    expect(await useUsdVaultWithdrawClaimAll().withdrawClaimAll()).toBe(true);
    expect(results().map(({ status, txHash }) => [status, txHash])).toEqual([
      ['claimed', hash],
      ['claimed', hash],
    ]);
    // The flow already handed the batch over, so nothing was asked twice.
    expect(mocks.status).toHaveBeenCalledTimes(1);
  });
  it('does not assign the last hash to tokens when the batch never resolves', async () => {
    mocks.aa = true;
    mocks.status.mockRejectedValue(new Error('offline'));
    await useUsdVaultWithdrawClaimAll().withdrawClaimAll();
    expect(results().map(({ status, txHash }) => [status, txHash])).toEqual([
      ['unknown', undefined],
      ['unknown', undefined],
    ]);
  });
});

describe('reverted transactions', () => {
  // useTxFlow throws at CONFIRMATION for a reverted receipt, so the hook has
  // to record the outcome before forwarding the stage. Reordering those two
  // steps loses both the status and the link to the failed transaction.
  it('records the reverted receipt before the flow aborts', async () => {
    mocks.perform.mockImplementationOnce(async ({ callback }: Callback) => {
      await callback({ stage: Stage.SIGN });
      await callback({ stage: Stage.RECEIPT, payload: hash });
      await callback({
        stage: Stage.CONFIRMATION,
        payload: revertedReceipt('0xreverted'),
      });
      await callback({ stage: Stage.DONE });
    });

    expect(await useUsdVaultWithdrawClaimAll().withdrawClaimAll()).toBe(false);
    expect(results().map(({ status }) => status)).toEqual([
      'failed',
      'not-started',
    ]);
    expect(results()[0].txHash).toBe('0xreverted');
    // The CONFIRMATION receipt already settled this, so nothing is re-fetched.
    expect(mocks.receipt).not.toHaveBeenCalled();
  });

  it('does not claim the second token after the first one reverts', async () => {
    mocks.perform.mockImplementation(async ({ callback }: Callback) => {
      await callback({ stage: Stage.SIGN });
      await callback({ stage: Stage.RECEIPT, payload: hash });
      await callback({ stage: Stage.CONFIRMATION, payload: revertedReceipt() });
    });

    await useUsdVaultWithdrawClaimAll().withdrawClaimAll();
    expect(mocks.perform).toHaveBeenCalledTimes(1);
    expect(results().map(({ status }) => status)).toEqual([
      'failed',
      'not-started',
    ]);
  });
});

describe('replacement transactions', () => {
  it('does not count a mined cancellation as a claim', async () => {
    mocks.perform.mockImplementationOnce(async ({ callback }: Callback) => {
      await callback({ stage: Stage.SIGN });
      await callback({ stage: Stage.RECEIPT, payload: hash });
      await callback({
        stage: Stage.CONFIRMATION,
        payload: claimReceipt([], '0xcancel'),
      });
      await callback({ stage: Stage.DONE });
    });
    expect(await useUsdVaultWithdrawClaimAll().withdrawClaimAll()).toBe(false);
    expect(results().map(({ status }) => status)).toEqual([
      'failed',
      'not-started',
    ]);
    expect(results()[0].txHash).toBe('0xcancel');
  });
  it('retains the confirmed replacement hash', async () => {
    mocks.perform.mockImplementationOnce(async ({ callback }: Callback) => {
      await callback({ stage: Stage.SIGN });
      await callback({ stage: Stage.RECEIPT, payload: hash });
      await callback({
        stage: Stage.CONFIRMATION,
        payload: claimReceipt([claimLog()], '0xreplacement'),
      });
      await callback({ stage: Stage.DONE });
    });
    await useUsdVaultWithdrawClaimAll().withdrawClaimAll();
    expect(results()[0].txHash).toBe('0xreplacement');
  });
});

describe('AA reverted transactions', () => {
  it('shows both failed tokens with the atomic reverted hash', async () => {
    mocks.aa = true;
    mocks.batchFails = true;
    mocks.status.mockResolvedValue({
      atomic: true,
      receipts: [{ transactionHash: hash, status: 'reverted', logs: [] }],
    });
    await useUsdVaultWithdrawClaimAll().withdrawClaimAll();
    expect(results().map(({ status, txHash }) => [status, txHash])).toEqual([
      ['failed', hash],
      ['failed', hash],
    ]);
  });
  it('maps a reverted non-atomic call by queue and calldata', async () => {
    const { encodeFunctionData } = await import('viem');
    const { ASYNC_REDEEM_QUEUE_ABI } =
      await import('modules/mellow-meta-vaults/abi');
    const { account } = await import('./claim-fixtures');
    mocks.aa = true;
    mocks.batchFails = true;
    mocks.status.mockResolvedValue({
      atomic: false,
      receipts: [
        {
          transactionHash: '0x111',
          status: 'success',
          logs: [claimLog(usdcQueue, 1)],
        },
        { transactionHash: '0x222', status: 'reverted', logs: [] },
      ],
    });
    mocks.transaction.mockResolvedValue({
      to: usdtQueue,
      input: encodeFunctionData({
        abi: ASYNC_REDEEM_QUEUE_ABI,
        functionName: 'claim',
        args: [account, [2]],
      }),
    });
    await useUsdVaultWithdrawClaimAll().withdrawClaimAll();
    expect(results().map(({ status, txHash }) => [status, txHash])).toEqual([
      ['claimed', '0x111'],
      ['failed', '0x222'],
    ]);
  });
});
