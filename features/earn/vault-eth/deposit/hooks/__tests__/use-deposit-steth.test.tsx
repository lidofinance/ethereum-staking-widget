import { decodeFunctionData, getAddress, type Address, type Hash } from 'viem';

import type { TxFlowArgs } from 'modules/web3/hooks/tx-flow/types';
import {
  QuoteMismatchError,
  TransactionRevertedError,
  TxSentDataUnavailableError,
  TxSettledError,
} from 'modules/web3';
import { ErrorMessage } from 'utils/getErrorMessage';
import { TOKENS } from 'consts/tokens';
import {
  aaSendCalls,
  expectOrdered,
  legacyPerformTransaction,
  renderHook,
  sentAACalls,
  type PerformTransactionProps,
} from 'features/stake/shared/__tests__/stake-test-utils';
import {
  DEPOSIT_QUEUE_ABI,
  SYNC_DEPOSIT_QUEUE_ABI,
} from 'modules/mellow-meta-vaults/abi';
import { COLLECTOR_CONFIG } from 'modules/mellow-meta-vaults/consts';
import type { CollectorContract } from 'modules/mellow-meta-vaults/types/contracts';
import type { VaultQuote } from 'modules/mellow-meta-vaults/utils/quote';

// Referenced from the hoisted mock factories, so hoisted with them
const { ACCOUNT, REFERRAL, WSTETH, ERC20_ABI } = vi.hoisted(() => ({
  ACCOUNT: '0x00000000000000000000000000000000000000aa' as const,
  REFERRAL: '0x00000000000000000000000000000000000000bb' as const,
  WSTETH: '0x00000000000000000000000000000000000000e3' as const,
  // The slice of Erc20AllowanceAbi the hook uses, see use-deposit.test
  ERC20_ABI: [
    {
      inputs: [
        { name: 'owner', type: 'address' },
        { name: 'spender', type: 'address' },
      ],
      name: 'allowance',
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        { name: 'spender', type: 'address' },
        { name: 'amount', type: 'uint256' },
      ],
      name: 'approve',
      outputs: [{ name: '', type: 'bool' }],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ] as const,
}));
const SYNC_QUEUE: Address = '0x00000000000000000000000000000000000000c1';
const ASYNC_QUEUE: Address = '0x00000000000000000000000000000000000000c2';
const STETH_APPROVE_TO: Address = '0x00000000000000000000000000000000000000d1';
const TX_HASH: Hash =
  '0x1111111111111111111111111111111111111111111111111111111111111111';
const CALL_ID = '0xcall';
const AMOUNT = 10n * 10n ** 18n;
// the wstETH the stETH amount wraps to
const WSTETH_AMOUNT = 8n * 10n ** 18n;
const SHARES = 9n * 10n ** 18n;
// the quote the form displays for WSTETH_AMOUNT
const SHOWN_QUOTE: VaultQuote = { amount: WSTETH_AMOUNT, output: SHARES };

const state = vi.hoisted(() => ({
  isAA: false,
  stethAllowance: 0n,
  wstethAllowance: 0n,
  penaltyD6: 0n,
  freshShares: 0n,
  performTransaction: vi.fn(),
  sendAACalls: vi.fn(),
  walletClient: { writeContract: vi.fn() },
  txModalStages: {
    signApproval: vi.fn(),
    pendingApproval: vi.fn(),
    signWrap: vi.fn(),
    pendingWrap: vi.fn(),
    sign: vi.fn(),
    pending: vi.fn(),
    success: vi.fn(),
    successMultisig: vi.fn(),
    failed: vi.fn(),
  },
  queues: {} as Record<'sync' | 'async', ReturnType<typeof createQueue>>,
}));

// A queue the contract getters hand out
const createQueue = (address: Address, abi: unknown) => ({
  address,
  abi,
  read: {
    syncDepositParams: vi.fn(async () => [state.penaltyD6, 115_200] as const),
  },
  estimateGas: { deposit: vi.fn(async () => 200_000n) },
  write: { deposit: vi.fn(async () => TX_HASH) },
});

// The SDK's wrap module: its senders go through the same staged
// performTransaction as every other legacy step
const sdkSend = () =>
  vi.fn(async ({ callback }: Pick<PerformTransactionProps, 'callback'>) =>
    state.performTransaction({
      account: { address: ACCOUNT },
      callback,
      getGasLimit: async () => 50_000n,
      sendTransaction: async () => TX_HASH,
    }),
  );
const wrap = {
  convertStethToWsteth: vi.fn(async () => WSTETH_AMOUNT),
  getStethForWrapAllowance: vi.fn(async () => state.stethAllowance),
  approveStethForWrapPopulateTx: vi.fn(async () => ({
    to: STETH_APPROVE_TO,
    data: '0xa1',
  })),
  wrapStethPopulateTx: vi.fn(async () => ({
    to: WSTETH,
    data: '0xa2',
  })),
  approveStethForWrap: sdkSend(),
  wrapSteth: sdkSend(),
};

vi.mock('modules/web3', async () => {
  const { runTxFlow } = await import('modules/web3/hooks/tx-flow/run-tx-flow');
  const errors = await import('modules/web3/utils');
  const context = await import('modules/web3/hooks/tx-flow/context');
  const publicClient = {
    readContract: async ({ functionName }: { functionName: string }) => {
      if (functionName === 'allowance') return state.wstethAllowance;
      throw new Error(`unexpected read: ${functionName}`);
    },
    estimateContractGas: async () => 60_000n,
    getTransactionReceipt: async () => ({ logs: [] }),
  };
  return {
    ...errors,
    ...context,
    Erc20AllowanceAbi: ERC20_ABI,
    SendCallsError: class SendCallsError extends Error {},
    useDappStatus: () => ({ address: ACCOUNT }),
    useLidoSDK: () => ({
      core: {
        chainId: 1,
        publicClient,
        walletClient: state.walletClient,
        performTransaction: state.performTransaction,
      },
      wrap,
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
// The module's pure parts, without the hooks barrel and what it pulls in
vi.mock('modules/mellow-meta-vaults', async () => ({
  ...(await import('modules/mellow-meta-vaults/utils/quote')),
  ...(await import('modules/mellow-meta-vaults/utils/deposit-route')),
  getVaultRefetchScope: () => [],
}));
vi.mock('features/earn/vault-eth/contracts', () => ({
  getSyncDepositQueueWritableContract: () => state.queues.sync,
  getLegacyAsyncDepositQueueWritableContract: () => state.queues.async,
}));
vi.mock('features/earn/vault-eth/consts', () => ({
  ETH_VAULT_QUERY_SCOPE: 'eth-vault',
}));
vi.mock('config/networks/token-address', () => ({
  getTokenAddress: () => WSTETH,
}));
vi.mock('utils/get-referral-address', () => ({
  getReferralAddress: async () => REFERRAL,
}));
vi.mock('utils/track-matomo-event', () => ({ trackMatomoEvent: vi.fn() }));

import { useEthVaultDepositSteth } from '../use-deposit-steth';

const collector = {
  read: {
    getDepositParams: vi.fn(async () => ({ shares: state.freshShares })),
  },
};
const onRetry = vi.fn();
const refetchQuote = vi.fn();

type DepositOptions = {
  shownQuote?: VaultQuote;
};

const deposit = ({ shownQuote }: DepositOptions = {}) =>
  renderHook(() =>
    useEthVaultDepositSteth({
      collector: collector as unknown as CollectorContract,
      shownQuote,
      refetchQuote,
      txModalStages: state.txModalStages,
      onRetry,
    }),
  ).deposit({ amount: AMOUNT, referral: REFERRAL });

const wstethApproveWrite = (spender: Address = SYNC_QUEUE) =>
  expect.objectContaining({
    address: WSTETH,
    functionName: 'approve',
    args: [spender, WSTETH_AMOUNT],
  });

const consoleErrorSpy = vi
  .spyOn(console, 'error')
  .mockImplementation(() => undefined);

beforeEach(() => {
  vi.clearAllMocks();
  state.isAA = false;
  state.stethAllowance = 0n;
  state.wstethAllowance = 0n;
  state.penaltyD6 = 0n;
  state.freshShares = SHARES;
  state.queues = {
    sync: createQueue(SYNC_QUEUE, SYNC_DEPOSIT_QUEUE_ABI),
    async: createQueue(ASYNC_QUEUE, DEPOSIT_QUEUE_ABI),
  };
  state.performTransaction.mockImplementation(legacyPerformTransaction());
  state.walletClient.writeContract.mockImplementation(async () => TX_HASH);
});
afterAll(() => {
  consoleErrorSpy.mockRestore();
});

describe('useEthVaultDepositSteth', () => {
  describe('legacy signing', () => {
    it('approves stETH, wraps, approves wstETH and deposits, in order', async () => {
      await expect(deposit({ shownQuote: SHOWN_QUOTE })).resolves.toBe(true);

      // the quote is checked before the first step and again right before
      // the deposit
      expectOrdered(
        collector.read.getDepositParams,
        wrap.approveStethForWrap,
        wrap.wrapSteth,
        state.walletClient.writeContract,
        state.queues.sync.write.deposit,
      );
      expect(collector.read.getDepositParams).toHaveBeenCalledTimes(2);
      const [, lastQuoteOrder] =
        collector.read.getDepositParams.mock.invocationCallOrder;
      expect(lastQuoteOrder).toBeGreaterThan(
        state.walletClient.writeContract.mock.invocationCallOrder[0] ?? 0,
      );
      expect(lastQuoteOrder).toBeLessThan(
        state.queues.sync.write.deposit.mock.invocationCallOrder[0] ?? 0,
      );
      expect(wrap.approveStethForWrap).toHaveBeenCalledWith(
        expect.objectContaining({ value: AMOUNT }),
      );
      expect(state.walletClient.writeContract).toHaveBeenCalledWith(
        wstethApproveWrite(),
      );
      expect(state.queues.sync.write.deposit).toHaveBeenCalledWith(
        [WSTETH_AMOUNT, REFERRAL, []],
        expect.anything(),
      );
      expect(collector.read.getDepositParams).toHaveBeenCalledWith([
        SYNC_QUEUE,
        WSTETH_AMOUNT,
        ACCOUNT,
        COLLECTOR_CONFIG,
      ]);
      expectOrdered(
        state.txModalStages.signApproval,
        state.txModalStages.signWrap,
        state.txModalStages.sign,
        state.txModalStages.success,
      );
      expect(state.txModalStages.success).toHaveBeenCalledWith(
        WSTETH_AMOUNT,
        TOKENS.wsteth,
        TX_HASH,
        undefined,
        false,
      );
      expect(state.txModalStages.failed).not.toHaveBeenCalled();
    });

    it('skips the approvals when the allowances cover the amounts', async () => {
      state.stethAllowance = AMOUNT;
      state.wstethAllowance = WSTETH_AMOUNT;

      await expect(deposit()).resolves.toBe(true);

      expect(wrap.approveStethForWrap).not.toHaveBeenCalled();
      expect(state.walletClient.writeContract).not.toHaveBeenCalled();
      expect(wrap.wrapSteth).toHaveBeenCalledTimes(1);
      expect(state.queues.sync.write.deposit).toHaveBeenCalledTimes(1);
    });

    it('routes the deposit to the async queue while the sync queue charges a penalty', async () => {
      state.penaltyD6 = 1_000n;

      await expect(deposit()).resolves.toBe(true);

      expect(state.walletClient.writeContract).toHaveBeenCalledWith(
        wstethApproveWrite(ASYNC_QUEUE),
      );
      expect(state.queues.async.write.deposit).toHaveBeenCalledTimes(1);
      expect(state.queues.sync.write.deposit).not.toHaveBeenCalled();
      expect(state.txModalStages.success).toHaveBeenCalledWith(
        WSTETH_AMOUNT,
        TOKENS.wsteth,
        TX_HASH,
        undefined,
        true,
      );
    });

    it('reports the funds as wrapped when the wrap settles but its confirmation read fails', async () => {
      state.stethAllowance = AMOUNT;
      state.performTransaction.mockImplementation(
        legacyPerformTransaction('unconfirmed'),
      );

      await expect(deposit()).resolves.toBe(false);

      expect(state.queues.sync.write.deposit).not.toHaveBeenCalled();
      expect(state.txModalStages.failed).toHaveBeenCalledTimes(1);
      // a retry of a stETH deposit would wrap again
      expect(state.txModalStages.failed).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'TxFlowInterruptedError',
          message: ErrorMessage.DEPOSIT_WRAPPED_INTERRUPTED,
        }),
      );
      expect(state.txModalStages.failed).not.toHaveBeenCalledWith(
        expect.any(TxSettledError),
      );
      expect(state.txModalStages.success).not.toHaveBeenCalled();
    });

    it('reports an unfinished deposit when only the stETH approval settles', async () => {
      state.performTransaction.mockImplementation(
        legacyPerformTransaction('unconfirmed'),
      );

      await expect(deposit()).resolves.toBe(false);

      expect(wrap.wrapSteth).not.toHaveBeenCalled();
      expect(state.txModalStages.failed).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'TxFlowInterruptedError',
          message: ErrorMessage.DEPOSIT_INTERRUPTED,
        }),
        onRetry,
      );
      expect(state.txModalStages.success).not.toHaveBeenCalled();
    });

    it('reports the funds as wrapped when the wstETH approval is rejected', async () => {
      state.stethAllowance = AMOUNT;
      state.performTransaction.mockImplementation(
        legacyPerformTransaction('success', 'rejected'),
      );

      await expect(deposit()).resolves.toBe(false);

      expect(state.queues.sync.write.deposit).not.toHaveBeenCalled();
      expect(state.txModalStages.failed).toHaveBeenCalledWith(
        expect.objectContaining({
          message: ErrorMessage.DEPOSIT_WRAPPED_INTERRUPTED,
        }),
      );
    });

    it('stops at a rejected wrap and offers a retry', async () => {
      state.stethAllowance = AMOUNT;
      state.performTransaction.mockImplementation(
        legacyPerformTransaction('rejected'),
      );

      await expect(deposit()).resolves.toBe(false);

      expect(state.txModalStages.failed).toHaveBeenCalledWith(
        expect.any(Error),
        onRetry,
      );
      expect(state.txModalStages.failed).not.toHaveBeenCalledWith(
        expect.objectContaining({ name: 'TxFlowInterruptedError' }),
        expect.anything(),
      );
    });

    it('stops before any step when the quote is already worse than the displayed one', async () => {
      state.freshShares = SHARES - 1n;

      await expect(deposit({ shownQuote: SHOWN_QUOTE })).resolves.toBe(false);

      expect(wrap.approveStethForWrap).not.toHaveBeenCalled();
      expect(wrap.wrapSteth).not.toHaveBeenCalled();
      expect(state.performTransaction).not.toHaveBeenCalled();
      expect(collector.read.getDepositParams).toHaveBeenCalledTimes(1);
      expect(refetchQuote).toHaveBeenCalledTimes(1);
      expect(state.txModalStages.failed).toHaveBeenCalledWith(
        expect.any(QuoteMismatchError),
        onRetry,
      );
    });

    it('stops before the deposit when the quote turns worse after the wrap', async () => {
      state.stethAllowance = AMOUNT;
      state.wstethAllowance = WSTETH_AMOUNT;
      // the check before the first step passes, the one before the deposit not
      collector.read.getDepositParams.mockImplementationOnce(async () => ({
        shares: SHARES,
      }));
      state.freshShares = SHARES - 1n;

      await expect(deposit({ shownQuote: SHOWN_QUOTE })).resolves.toBe(false);

      expect(wrap.wrapSteth).toHaveBeenCalledTimes(1);
      expect(collector.read.getDepositParams).toHaveBeenCalledTimes(2);
      expect(state.queues.sync.write.deposit).not.toHaveBeenCalled();
      expect(refetchQuote).toHaveBeenCalledTimes(1);
      expect(state.txModalStages.failed).toHaveBeenCalledWith(
        expect.objectContaining({
          message: ErrorMessage.DEPOSIT_WRAPPED_INTERRUPTED,
          cause: expect.any(QuoteMismatchError),
        }),
      );
    });

    it('reports the funds as wrapped, with no retry, when the deposit reverts after the wrap', async () => {
      state.stethAllowance = AMOUNT;
      state.wstethAllowance = WSTETH_AMOUNT;
      state.performTransaction.mockImplementation(
        legacyPerformTransaction('success', 'reverted'),
      );

      await expect(deposit({ shownQuote: SHOWN_QUOTE })).resolves.toBe(false);

      expect(state.queues.sync.write.deposit).toHaveBeenCalledTimes(1);
      expect(state.txModalStages.failed).toHaveBeenCalledTimes(1);
      expect(state.txModalStages.failed).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'TxFlowInterruptedError',
          message: ErrorMessage.DEPOSIT_WRAPPED_INTERRUPTED,
          cause: expect.any(TransactionRevertedError),
        }),
      );
      expect(state.txModalStages.success).not.toHaveBeenCalled();
    });

    it('keeps the unread outcome of a sent deposit, which may have landed', async () => {
      state.stethAllowance = AMOUNT;
      state.wstethAllowance = WSTETH_AMOUNT;
      state.performTransaction.mockImplementation(
        legacyPerformTransaction('success', 'unlocated'),
      );

      await expect(deposit({ shownQuote: SHOWN_QUOTE })).resolves.toBe(false);

      expect(state.txModalStages.failed).toHaveBeenCalledTimes(1);
      expect(state.txModalStages.failed).toHaveBeenCalledWith(
        expect.any(TxSentDataUnavailableError),
        onRetry,
      );
    });

    it('keeps the settled outcome of a deposit whose follow-up read fails', async () => {
      state.stethAllowance = AMOUNT;
      state.wstethAllowance = WSTETH_AMOUNT;
      state.performTransaction.mockImplementation(
        legacyPerformTransaction('success', 'unconfirmed'),
      );

      await expect(deposit({ shownQuote: SHOWN_QUOTE })).resolves.toBe(true);

      expect(state.txModalStages.failed).toHaveBeenCalledTimes(1);
      expect(state.txModalStages.failed).toHaveBeenCalledWith(
        expect.any(TxSettledError),
        onRetry,
      );
    });
  });

  describe('EIP-5792 signing', () => {
    beforeEach(() => {
      state.isAA = true;
    });

    it('batches every step and reports as one deposit', async () => {
      const sendCalls = aaSendCalls({ callId: CALL_ID, txHash: TX_HASH });
      state.sendAACalls.mockImplementation(sendCalls);

      await expect(deposit({ shownQuote: SHOWN_QUOTE })).resolves.toBe(true);

      expect(state.performTransaction).not.toHaveBeenCalled();
      const calls = sentAACalls(sendCalls);
      expect(calls.map((call) => call.to)).toEqual([
        STETH_APPROVE_TO,
        WSTETH,
        WSTETH,
        SYNC_QUEUE,
      ]);
      const decoded = decodeFunctionData({
        abi: SYNC_DEPOSIT_QUEUE_ABI,
        data: calls[3]?.data as Hash,
      });
      expect(decoded.args).toEqual([WSTETH_AMOUNT, getAddress(REFERRAL), []]);
      expect(state.txModalStages.signWrap).not.toHaveBeenCalled();
      expect(state.txModalStages.sign).toHaveBeenCalledWith(
        WSTETH_AMOUNT,
        TOKENS.wsteth,
      );
      expect(state.txModalStages.success).toHaveBeenCalledTimes(1);
    });

    it('sends no batch when the fresh quote is worse than the displayed one', async () => {
      state.sendAACalls.mockImplementation(
        aaSendCalls({ callId: CALL_ID, txHash: TX_HASH }),
      );
      state.freshShares = SHARES - 1n;

      await expect(deposit({ shownQuote: SHOWN_QUOTE })).resolves.toBe(false);

      expect(state.sendAACalls).not.toHaveBeenCalled();
      expect(refetchQuote).toHaveBeenCalledTimes(1);
      expect(state.txModalStages.failed).toHaveBeenCalledWith(
        expect.any(QuoteMismatchError),
        onRetry,
      );
    });
  });
});
