import { decodeFunctionData, getAddress, type Address, type Hash } from 'viem';

import type { TxFlowArgs } from 'modules/web3/tx-flow/types';
import {
  QuoteMismatchError,
  TxSettledError,
  TxSentDataUnavailableError,
} from 'modules/web3';
import { ErrorMessage } from 'utils/getErrorMessage';
import { TOKENS } from 'consts/tokens';
import {
  aaSendCalls,
  expectOrdered,
  legacyPerformTransaction,
  renderHook,
  sentAACalls,
} from 'features/stake/shared/__tests__/stake-test-utils';
import {
  DEPOSIT_QUEUE_ABI,
  SYNC_DEPOSIT_QUEUE_ABI,
} from 'modules/mellow-meta-vaults/abi';
import { COLLECTOR_CONFIG } from 'modules/mellow-meta-vaults/consts';
import type {
  AsyncDepositQueueGetter,
  SyncDepositQueueGetter,
} from 'modules/mellow-meta-vaults/types/deposit-queue-getter';
import type { CollectorContract } from 'modules/mellow-meta-vaults/types/contracts';
import type { VaultQuote } from 'modules/mellow-meta-vaults/utils/quote';

// Referenced from the hoisted mock factories, so hoisted with them
const { ACCOUNT, REFERRAL, TOKEN_ADDRESSES, ERC20_ABI } = vi.hoisted(() => {
  const TOKEN_ADDRESSES: Record<string, Address> = {
    eth: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    weth: '0x00000000000000000000000000000000000000e1',
    usdt: '0x00000000000000000000000000000000000000e2',
  };
  return {
    ACCOUNT: '0x00000000000000000000000000000000000000aa' as const,
    REFERRAL: '0x00000000000000000000000000000000000000bb' as const,
    TOKEN_ADDRESSES,
    // The slice of Erc20AllowanceAbi the hook uses. Defined here rather than
    // imported: the real module reaches the `config` barrel, which leads back
    // into the mocked `modules/web3` and deadlocks the mock factory
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
  };
});
const SYNC_QUEUE: Address = '0x00000000000000000000000000000000000000c1';
const ASYNC_QUEUE: Address = '0x00000000000000000000000000000000000000c2';
const TX_HASH: Hash =
  '0x1111111111111111111111111111111111111111111111111111111111111111';
const CALL_ID = '0xcall';
const AMOUNT = 2n * 10n ** 18n;
const SHARES = 19n * 10n ** 17n;
// the quote the form displays for AMOUNT
const SHOWN_QUOTE: VaultQuote = { amountIn: AMOUNT, amountOut: SHARES };
// the quote the form shows while the sync queue charges `penaltyD6`
const penalisedQuote = (penaltyD6: bigint): VaultQuote => ({
  amountIn: AMOUNT,
  amountOut:
    (((AMOUNT * (1_000_000n - penaltyD6)) / 1_000_000n) * SHARES) / AMOUNT,
});

const state = vi.hoisted(() => ({
  isAA: false,
  // the ERC-20 allowance the deposit token grants the queue
  allowance: 0n,
  performTransaction: vi.fn(),
  sendAACalls: vi.fn(),
  walletClient: { writeContract: vi.fn() },
  txModalStages: {
    signApproval: vi.fn(),
    pendingApproval: vi.fn(),
    sign: vi.fn(),
    pending: vi.fn(),
    success: vi.fn(),
    successMultisig: vi.fn(),
    failed: vi.fn(),
  },
}));

vi.mock('modules/web3', async (importOriginal) => {
  const actual = await importOriginal<typeof import('modules/web3')>();
  const { runTxFlow } = await import('modules/web3/tx-flow/run-tx-flow');
  const errors = await import('modules/web3/utils');
  const context = await import('modules/web3/tx-flow/context');
  const publicClient = {
    readContract: async ({ functionName }: { functionName: string }) => {
      if (functionName === 'allowance') return state.allowance;
      throw new Error(`unexpected read: ${functionName}`);
    },
    estimateContractGas: async () => 60_000n,
    getTransactionReceipt: async () => ({ logs: [] }),
  };
  return {
    ...actual,
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
vi.mock('config/networks/token-address', () => ({
  getTokenAddress: (_chain: number, token: string) => TOKEN_ADDRESSES[token],
}));
vi.mock('utils/get-referral-address', () => ({
  getReferralAddress: async () => REFERRAL,
}));
vi.mock('utils/track-matomo-event', () => ({ trackMatomoEvent: vi.fn() }));

import { useDeposit } from '../use-deposit';

type QueuesSetup = {
  // the sync queue's penaltyD6
  penaltyD6?: bigint;
  // the shares the Collector quotes right before the deposit
  freshShares?: bigint;
};

const createQueues = ({
  penaltyD6 = 0n,
  freshShares = SHARES,
}: QueuesSetup = {}) => ({
  syncQueue: {
    address: SYNC_QUEUE,
    abi: SYNC_DEPOSIT_QUEUE_ABI,
    read: {
      syncDepositParams: vi.fn(async () => [penaltyD6, 115_200] as const),
    },
    estimateGas: { deposit: vi.fn(async () => 200_000n) },
    write: { deposit: vi.fn(async () => TX_HASH) },
  },
  asyncQueue: {
    address: ASYNC_QUEUE,
    abi: DEPOSIT_QUEUE_ABI,
    estimateGas: { deposit: vi.fn(async () => 200_000n) },
    write: { deposit: vi.fn(async () => TX_HASH) },
  },
  // shares in proportion to the amount it is asked about: a penalised
  // amount quotes fewer
  collector: {
    read: {
      getDepositParams: vi.fn(
        async ([, amount]: readonly [unknown, bigint]) => ({
          shares: (amount * freshShares) / AMOUNT,
        }),
      ),
    },
  },
});
type Queues = ReturnType<typeof createQueues>;

type DepositOptions = {
  // the token has no sync queue
  isAsyncOnly?: boolean;
  shownQuote?: VaultQuote;
};

const onRetry = vi.fn();
const refetchQuote = vi.fn();

const deposit = (
  queues: Queues,
  token: string,
  { isAsyncOnly = false, shownQuote }: DepositOptions = {},
) =>
  renderHook(() =>
    useDeposit({
      syncDepositQueueGetter: (() =>
        isAsyncOnly
          ? undefined
          : queues.syncQueue) as unknown as SyncDepositQueueGetter<string>,
      asyncDepositQueueGetter: (() =>
        queues.asyncQueue) as unknown as AsyncDepositQueueGetter<string>,
      collector: queues.collector as unknown as CollectorContract,
      shownQuote,
      refetchQuote,
      txModalStages: state.txModalStages,
      onRetry,
    }),
  ).deposit({ amount: AMOUNT, token: token as never, referral: REFERRAL });

// the contract keeps the address as the token map spells it
const approveWrite = (
  value: bigint,
  tokenAddress: Address,
  spender: Address = SYNC_QUEUE,
) =>
  expect.objectContaining({
    address: tokenAddress,
    functionName: 'approve',
    args: [spender, value],
  });

const consoleErrorSpy = vi
  .spyOn(console, 'error')
  .mockImplementation(() => undefined);

beforeEach(() => {
  vi.clearAllMocks();
  state.isAA = false;
  state.allowance = 0n;
  state.performTransaction.mockImplementation(legacyPerformTransaction());
  state.walletClient.writeContract.mockImplementation(async () => TX_HASH);
});
afterAll(() => {
  consoleErrorSpy.mockRestore();
});

describe('useDeposit', () => {
  describe('legacy signing', () => {
    it('deposits ETH with the value and no approval', async () => {
      const queues = createQueues();

      await expect(deposit(queues, TOKENS.eth)).resolves.toBe(true);

      expect(state.walletClient.writeContract).not.toHaveBeenCalled();
      expect(queues.syncQueue.write.deposit).toHaveBeenCalledWith(
        [AMOUNT, REFERRAL, []],
        expect.objectContaining({ value: AMOUNT }),
      );
      expect(state.txModalStages.signApproval).not.toHaveBeenCalled();
      expect(state.txModalStages.sign).toHaveBeenCalledWith(AMOUNT, TOKENS.eth);
      expect(state.txModalStages.pending).toHaveBeenCalledWith(
        AMOUNT,
        TOKENS.eth,
        TX_HASH,
        false,
      );
      expect(state.txModalStages.success).toHaveBeenCalledWith(
        AMOUNT,
        TOKENS.eth,
        TX_HASH,
        undefined,
        false,
      );
      expect(state.txModalStages.failed).not.toHaveBeenCalled();
    });

    it('approves and then deposits a token short of allowance', async () => {
      const queues = createQueues();

      await expect(
        deposit(queues, TOKENS.weth, { shownQuote: SHOWN_QUOTE }),
      ).resolves.toBe(true);

      expect(state.walletClient.writeContract).toHaveBeenCalledTimes(1);
      expect(state.walletClient.writeContract).toHaveBeenCalledWith(
        approveWrite(AMOUNT, TOKEN_ADDRESSES.weth),
      );
      expect(queues.syncQueue.write.deposit).toHaveBeenCalledWith(
        [AMOUNT, REFERRAL, []],
        expect.objectContaining({ value: 0n }),
      );
      expectOrdered(
        state.txModalStages.signApproval,
        state.txModalStages.pendingApproval,
        state.txModalStages.sign,
        state.txModalStages.pending,
        state.txModalStages.success,
      );
      expect(state.txModalStages.success).toHaveBeenCalledTimes(1);
    });

    it('skips the approval when the allowance covers the amount', async () => {
      state.allowance = AMOUNT;
      const queues = createQueues();

      await expect(deposit(queues, TOKENS.weth)).resolves.toBe(true);

      expect(state.walletClient.writeContract).not.toHaveBeenCalled();
      expect(queues.syncQueue.write.deposit).toHaveBeenCalledTimes(1);
      expect(state.txModalStages.signApproval).not.toHaveBeenCalled();
    });

    it('resets a non-zero USDT allowance before approving', async () => {
      state.allowance = 1n;
      const queues = createQueues();

      await expect(deposit(queues, TOKENS.usdt)).resolves.toBe(true);

      expect(state.walletClient.writeContract).toHaveBeenCalledTimes(2);
      expect(state.walletClient.writeContract).toHaveBeenNthCalledWith(
        1,
        approveWrite(0n, TOKEN_ADDRESSES.usdt),
      );
      expect(state.walletClient.writeContract).toHaveBeenNthCalledWith(
        2,
        approveWrite(AMOUNT, TOKEN_ADDRESSES.usdt),
      );
      expect(queues.syncQueue.write.deposit).toHaveBeenCalledTimes(1);
    });

    it('reports an unfinished deposit when the approval settles but its confirmation read fails', async () => {
      state.performTransaction.mockImplementation(
        legacyPerformTransaction('unconfirmed'),
      );
      const queues = createQueues();

      await expect(deposit(queues, TOKENS.weth)).resolves.toBe(false);

      expect(state.walletClient.writeContract).toHaveBeenCalledTimes(1);
      expect(queues.syncQueue.write.deposit).not.toHaveBeenCalled();
      expect(state.txModalStages.failed).toHaveBeenCalledTimes(1);
      expect(state.txModalStages.failed).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'TxFlowInterruptedError',
          message: ErrorMessage.DEPOSIT_INTERRUPTED,
        }),
        onRetry,
      );
      expect(state.txModalStages.failed).not.toHaveBeenCalledWith(
        expect.any(TxSettledError),
        expect.anything(),
      );
      expect(state.txModalStages.success).not.toHaveBeenCalled();
    });

    it('preserves insufficient-gas guidance when the deposit estimate fails after approval', async () => {
      state.performTransaction.mockImplementation(
        legacyPerformTransaction('success', 'unestimated'),
      );
      const queues = createQueues();

      await expect(deposit(queues, TOKENS.weth)).resolves.toBe(false);

      expect(queues.syncQueue.write.deposit).not.toHaveBeenCalled();
      expect(state.txModalStages.failed).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Not enough ether for gas',
        }),
        onRetry,
      );
      expect(state.txModalStages.success).not.toHaveBeenCalled();
    });

    it('reports an unfinished deposit when only the USDT reset settles', async () => {
      state.allowance = 1n;
      state.performTransaction.mockImplementation(
        legacyPerformTransaction('unconfirmed'),
      );
      const queues = createQueues();

      await expect(deposit(queues, TOKENS.usdt)).resolves.toBe(false);

      // the reset went out, the approval and the deposit never did
      expect(state.walletClient.writeContract).toHaveBeenCalledTimes(1);
      expect(state.walletClient.writeContract).toHaveBeenCalledWith(
        approveWrite(0n, TOKEN_ADDRESSES.usdt),
      );
      expect(queues.syncQueue.write.deposit).not.toHaveBeenCalled();
      expect(state.txModalStages.failed).toHaveBeenCalledTimes(1);
      expect(state.txModalStages.failed).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'TxFlowInterruptedError',
          message: ErrorMessage.DEPOSIT_RESET_INTERRUPTED,
        }),
        onRetry,
      );
      expect(state.txModalStages.success).not.toHaveBeenCalled();
    });

    it('does not approve again when retried after a confirmed approval', async () => {
      state.performTransaction.mockImplementation(
        legacyPerformTransaction('unconfirmed'),
      );
      const queues = createQueues();
      await expect(deposit(queues, TOKENS.weth)).resolves.toBe(false);

      // the allowance is on chain now; the retry reads it and goes to the deposit
      state.allowance = AMOUNT;
      state.performTransaction.mockImplementation(legacyPerformTransaction());
      await expect(deposit(queues, TOKENS.weth)).resolves.toBe(true);

      expect(state.walletClient.writeContract).toHaveBeenCalledTimes(1);
      expect(queues.syncQueue.write.deposit).toHaveBeenCalledTimes(1);
      expect(state.txModalStages.success).toHaveBeenCalledTimes(1);
    });

    it('reports a deposit whose confirmation read failed as completed', async () => {
      const queues = createQueues();
      state.performTransaction.mockImplementation(
        legacyPerformTransaction('unconfirmed'),
      );

      await expect(deposit(queues, TOKENS.eth)).resolves.toBe(true);

      expect(queues.syncQueue.write.deposit).toHaveBeenCalledTimes(1);
      expect(state.txModalStages.failed).toHaveBeenCalledWith(
        expect.any(TxSettledError),
        onRetry,
      );
      expect(state.txModalStages.success).not.toHaveBeenCalled();
    });

    it('reports a deposit that could not be read back as sent, not failed', async () => {
      const queues = createQueues();
      state.performTransaction.mockImplementation(
        legacyPerformTransaction('unlocated'),
      );

      // not a success: the form keeps its state, the modal says to reload
      await expect(deposit(queues, TOKENS.eth)).resolves.toBe(false);

      expect(queues.syncQueue.write.deposit).toHaveBeenCalledTimes(1);
      expect(state.txModalStages.failed).toHaveBeenCalledTimes(1);
      expect(state.txModalStages.failed.mock.calls[0]?.[0]).toBeInstanceOf(
        TxSentDataUnavailableError,
      );
      expect(state.txModalStages.success).not.toHaveBeenCalled();
    });

    it('reports an approval that could not be read back as sent, not as an interrupted deposit', async () => {
      const queues = createQueues();
      state.performTransaction.mockImplementation(
        legacyPerformTransaction('unlocated'),
      );

      await expect(deposit(queues, TOKENS.weth)).resolves.toBe(false);

      // the approval may or may not have landed: no deposit on top of it
      expect(queues.syncQueue.write.deposit).not.toHaveBeenCalled();
      expect(state.txModalStages.failed.mock.calls[0]?.[0]).toBeInstanceOf(
        TxSentDataUnavailableError,
      );
    });

    it('stops at a rejected approval and offers a retry', async () => {
      state.performTransaction.mockImplementation(
        legacyPerformTransaction('rejected'),
      );
      const queues = createQueues();

      await expect(deposit(queues, TOKENS.weth)).resolves.toBe(false);

      expect(queues.syncQueue.write.deposit).not.toHaveBeenCalled();
      expect(state.txModalStages.failed).toHaveBeenCalledWith(
        expect.any(Error),
        onRetry,
      );
      expect(state.txModalStages.failed).not.toHaveBeenCalledWith(
        expect.objectContaining({ name: 'TxFlowInterruptedError' }),
        expect.anything(),
      );
    });

    it('reports a multisig proposal of the deposit without waiting for a receipt', async () => {
      state.performTransaction.mockImplementation(
        legacyPerformTransaction('multisig'),
      );
      const queues = createQueues();

      await expect(deposit(queues, TOKENS.eth)).resolves.toBe(true);

      expect(state.txModalStages.successMultisig).toHaveBeenCalledTimes(1);
      expect(state.txModalStages.success).not.toHaveBeenCalled();
    });
  });

  describe('routing', () => {
    it('deposits through the sync queue', async () => {
      const queues = createQueues();

      await expect(deposit(queues, TOKENS.weth)).resolves.toBe(true);

      expect(queues.syncQueue.write.deposit).toHaveBeenCalledTimes(1);
      expect(queues.asyncQueue.write.deposit).not.toHaveBeenCalled();
    });

    it('deposits through the sync queue while it charges a penalty: no async fallback', async () => {
      const queues = createQueues({ penaltyD6: 1_000n });

      await expect(
        deposit(queues, TOKENS.weth, { shownQuote: penalisedQuote(1_000n) }),
      ).resolves.toBe(true);

      expect(state.walletClient.writeContract).toHaveBeenCalledWith(
        approveWrite(AMOUNT, TOKEN_ADDRESSES.weth, SYNC_QUEUE),
      );
      expect(queues.syncQueue.write.deposit).toHaveBeenCalledWith(
        [AMOUNT, REFERRAL, []],
        expect.anything(),
      );
      expect(queues.asyncQueue.write.deposit).not.toHaveBeenCalled();
    });

    it('deposits a token without a sync queue through the async queue', async () => {
      const queues = createQueues();

      await expect(
        deposit(queues, TOKENS.weth, { isAsyncOnly: true }),
      ).resolves.toBe(true);

      expect(queues.syncQueue.read.syncDepositParams).not.toHaveBeenCalled();
      expect(queues.asyncQueue.write.deposit).toHaveBeenCalledTimes(1);
    });
  });

  describe('quote check', () => {
    it('re-reads the quote on the deposit queue after the approval, right before the deposit', async () => {
      const queues = createQueues();

      await expect(
        deposit(queues, TOKENS.weth, { shownQuote: SHOWN_QUOTE }),
      ).resolves.toBe(true);

      expect(queues.collector.read.getDepositParams).toHaveBeenCalledTimes(1);
      expect(queues.collector.read.getDepositParams).toHaveBeenCalledWith([
        SYNC_QUEUE,
        AMOUNT,
        ACCOUNT,
        COLLECTOR_CONFIG,
      ]);
      expectOrdered(
        state.walletClient.writeContract,
        queues.collector.read.getDepositParams,
        queues.syncQueue.write.deposit,
      );
      expect(refetchQuote).not.toHaveBeenCalled();
    });

    it('stops before the deposit when the fresh quote is worse than the displayed one', async () => {
      const queues = createQueues({ freshShares: SHARES - 1n });

      await expect(
        deposit(queues, TOKENS.weth, { shownQuote: SHOWN_QUOTE }),
      ).resolves.toBe(false);

      expect(queues.syncQueue.write.deposit).not.toHaveBeenCalled();
      expect(refetchQuote).toHaveBeenCalledTimes(1);
      // the stop says why, not that the approval landed
      expect(state.txModalStages.failed).toHaveBeenCalledWith(
        expect.any(QuoteMismatchError),
        onRetry,
      );
      expect(state.txModalStages.success).not.toHaveBeenCalled();
    });

    it('deposits when the fresh quote is better than the displayed one', async () => {
      const queues = createQueues({ freshShares: SHARES + 1n });

      await expect(
        deposit(queues, TOKENS.eth, { shownQuote: SHOWN_QUOTE }),
      ).resolves.toBe(true);

      expect(queues.syncQueue.write.deposit).toHaveBeenCalledTimes(1);
      expect(refetchQuote).not.toHaveBeenCalled();
    });

    it('holds a quote displayed for another amount to its rate', async () => {
      // the debounced preview showed half the amount at the same rate
      const queues = createQueues();
      const shownQuote = { amountIn: AMOUNT / 2n, amountOut: SHARES / 2n };

      await expect(deposit(queues, TOKENS.eth, { shownQuote })).resolves.toBe(
        true,
      );
      expect(queues.syncQueue.write.deposit).toHaveBeenCalledTimes(1);
    });

    it('quotes the sync queue for the amount its penalty leaves', async () => {
      const queues = createQueues({ penaltyD6: 1_000n });
      // the form quoted the same penalty
      const shownQuote = penalisedQuote(1_000n);

      await expect(deposit(queues, TOKENS.eth, { shownQuote })).resolves.toBe(
        true,
      );

      expect(queues.collector.read.getDepositParams).toHaveBeenCalledWith([
        SYNC_QUEUE,
        (AMOUNT * 999_000n) / 1_000_000n,
        ACCOUNT,
        COLLECTOR_CONFIG,
      ]);
      expect(queues.syncQueue.write.deposit).toHaveBeenCalledTimes(1);
    });

    it('stops the deposit when a penalty was set since the form quoted', async () => {
      const queues = createQueues({ penaltyD6: 1_000n });

      await expect(
        deposit(queues, TOKENS.eth, { shownQuote: SHOWN_QUOTE }),
      ).resolves.toBe(false);

      expect(queues.syncQueue.write.deposit).not.toHaveBeenCalled();
      expect(refetchQuote).toHaveBeenCalledTimes(1);
      expect(state.txModalStages.failed).toHaveBeenCalledWith(
        expect.any(QuoteMismatchError),
        onRetry,
      );
    });

    it('quotes a queue without a penalty for the full amount', async () => {
      const queues = createQueues();

      await expect(
        deposit(queues, TOKENS.weth, {
          isAsyncOnly: true,
          shownQuote: SHOWN_QUOTE,
        }),
      ).resolves.toBe(true);

      expect(queues.collector.read.getDepositParams).toHaveBeenCalledWith([
        ASYNC_QUEUE,
        AMOUNT,
        ACCOUNT,
        COLLECTOR_CONFIG,
      ]);
      expect(queues.syncQueue.read.syncDepositParams).not.toHaveBeenCalled();
    });

    it('skips the quote check where no quote is displayed', async () => {
      const queues = createQueues({ freshShares: 1n });

      await expect(deposit(queues, TOKENS.eth)).resolves.toBe(true);

      expect(queues.collector.read.getDepositParams).not.toHaveBeenCalled();
      expect(queues.syncQueue.read.syncDepositParams).toHaveBeenCalledTimes(1);
      expect(queues.syncQueue.write.deposit).toHaveBeenCalledTimes(1);
    });

    it('stops a deposit with no quote displayed while the sync queue charges a penalty', async () => {
      const queues = createQueues({ penaltyD6: 1n });

      await expect(deposit(queues, TOKENS.weth)).resolves.toBe(false);

      // read right before the deposit, after the approval
      expectOrdered(
        state.walletClient.writeContract,
        queues.syncQueue.read.syncDepositParams,
      );
      expect(queues.syncQueue.write.deposit).not.toHaveBeenCalled();
      expect(queues.asyncQueue.write.deposit).not.toHaveBeenCalled();
      expect(state.txModalStages.failed).toHaveBeenCalledWith(
        expect.any(QuoteMismatchError),
        onRetry,
      );
    });

    it('reads no penalty for a token without a sync queue and no quote displayed', async () => {
      const queues = createQueues({ penaltyD6: 1n });

      await expect(
        deposit(queues, TOKENS.weth, { isAsyncOnly: true }),
      ).resolves.toBe(true);

      expect(queues.syncQueue.read.syncDepositParams).not.toHaveBeenCalled();
      expect(queues.asyncQueue.write.deposit).toHaveBeenCalledTimes(1);
    });
  });

  describe('EIP-5792 signing', () => {
    beforeEach(() => {
      state.isAA = true;
    });

    it('batches the approval with the deposit and reports as one deposit', async () => {
      const sendCalls = aaSendCalls({ callId: CALL_ID, txHash: TX_HASH });
      state.sendAACalls.mockImplementation(sendCalls);
      const queues = createQueues();

      await expect(
        deposit(queues, TOKENS.weth, { shownQuote: SHOWN_QUOTE }),
      ).resolves.toBe(true);

      expect(state.performTransaction).not.toHaveBeenCalled();
      expect(queues.collector.read.getDepositParams).toHaveBeenCalledTimes(1);
      const calls = sentAACalls(sendCalls);
      expect(calls).toHaveLength(2);
      expect(calls[0]?.to).toBe(TOKEN_ADDRESSES.weth);
      expect(calls[1]?.to).toBe(SYNC_QUEUE);
      const decoded = decodeFunctionData({
        abi: SYNC_DEPOSIT_QUEUE_ABI,
        data: calls[1]?.data as Hash,
      });
      expect(decoded.functionName).toBe('deposit');
      expect(decoded.args).toEqual([AMOUNT, getAddress(REFERRAL), []]);
      // one batch, one signature: no approval stage
      expect(state.txModalStages.signApproval).not.toHaveBeenCalled();
      expect(state.txModalStages.sign).toHaveBeenCalledWith(
        AMOUNT,
        TOKENS.weth,
      );
      expect(state.txModalStages.pending).toHaveBeenCalledWith(
        AMOUNT,
        TOKENS.weth,
        CALL_ID,
        true,
      );
      expect(state.txModalStages.success).toHaveBeenCalledTimes(1);
    });

    it('sends the ETH deposit as a single call carrying the value', async () => {
      const sendCalls = aaSendCalls({ callId: CALL_ID, txHash: TX_HASH });
      state.sendAACalls.mockImplementation(sendCalls);
      const queues = createQueues();

      await expect(deposit(queues, TOKENS.eth)).resolves.toBe(true);

      const calls = sentAACalls(sendCalls);
      expect(calls).toHaveLength(1);
      expect(calls[0]?.value).toBe(AMOUNT);
    });

    it('batches the deposit for the sync queue while it charges a penalty', async () => {
      const sendCalls = aaSendCalls({ callId: CALL_ID, txHash: TX_HASH });
      state.sendAACalls.mockImplementation(sendCalls);
      const queues = createQueues({ penaltyD6: 1n });

      await expect(
        deposit(queues, TOKENS.weth, { shownQuote: penalisedQuote(1n) }),
      ).resolves.toBe(true);

      const calls = sentAACalls(sendCalls);
      expect(calls[1]?.to).toBe(SYNC_QUEUE);
      const approval = decodeFunctionData({
        abi: ERC20_ABI,
        data: calls[0]?.data as Hash,
      });
      expect(approval.args).toEqual([getAddress(SYNC_QUEUE), AMOUNT]);
    });

    it('sends no batch when the fresh quote is worse than the displayed one', async () => {
      state.sendAACalls.mockImplementation(
        aaSendCalls({ callId: CALL_ID, txHash: TX_HASH }),
      );
      const queues = createQueues({ freshShares: SHARES - 1n });

      await expect(
        deposit(queues, TOKENS.weth, { shownQuote: SHOWN_QUOTE }),
      ).resolves.toBe(false);

      expect(state.sendAACalls).not.toHaveBeenCalled();
      expect(refetchQuote).toHaveBeenCalledTimes(1);
      expect(state.txModalStages.failed).toHaveBeenCalledWith(
        expect.any(QuoteMismatchError),
        onRetry,
      );
    });

    it('sends no batch with no quote displayed while the sync queue charges a penalty', async () => {
      state.sendAACalls.mockImplementation(
        aaSendCalls({ callId: CALL_ID, txHash: TX_HASH }),
      );
      const queues = createQueues({ penaltyD6: 1n });

      await expect(deposit(queues, TOKENS.weth)).resolves.toBe(false);

      expect(state.sendAACalls).not.toHaveBeenCalled();
      expect(state.txModalStages.failed).toHaveBeenCalledWith(
        expect.any(QuoteMismatchError),
        onRetry,
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
      const queues = createQueues();

      await expect(deposit(queues, TOKENS.weth)).resolves.toBe(false);

      expect(state.txModalStages.failed).toHaveBeenCalledWith(
        expect.any(Error),
        onRetry,
      );
    });
  });
});
