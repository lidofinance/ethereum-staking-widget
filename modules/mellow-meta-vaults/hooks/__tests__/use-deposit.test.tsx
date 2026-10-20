import { decodeFunctionData, getAddress, type Address, type Hash } from 'viem';

import type { TxFlowArgs } from 'modules/web3/hooks/tx-flow/types';
import { TxSettledError } from 'modules/web3/utils/tx-settled-error';
import { ErrorMessage } from 'utils/getErrorMessage';
import { TOKENS } from 'consts/tokens';
import {
  aaSendCalls,
  expectOrdered,
  legacyPerformTransaction,
  renderHook,
  sentAACalls,
} from 'features/stake/shared/__tests__/stake-test-utils';
import { SYNC_DEPOSIT_QUEUE_ABI } from 'modules/mellow-meta-vaults/abi';
import type { DepositQueueGetter } from 'modules/mellow-meta-vaults/types/deposit-queue-getter';

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
const QUEUE: Address = '0x00000000000000000000000000000000000000c1';
const TX_HASH: Hash =
  '0x1111111111111111111111111111111111111111111111111111111111111111';
const CALL_ID = '0xcall';
const AMOUNT = 2n * 10n ** 18n;

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

vi.mock('modules/web3', async () => {
  const { runTxFlow } = await import('modules/web3/hooks/tx-flow/run-tx-flow');
  const errors = await import('modules/web3/utils');
  const context = await import('modules/web3/hooks/tx-flow/context');
  const publicClient = {
    readContract: async ({ functionName }: { functionName: string }) => {
      if (functionName === 'allowance') return state.allowance;
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
    }),
    useTxFlow: () => (args: TxFlowArgs) =>
      runTxFlow(args, {
        isAA: state.isAA,
        address: ACCOUNT,
        validateAddress: async () => true,
        sendAACalls: state.sendAACalls,
        isCurrent: () => true,
        txHash: { current: undefined },
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

const createQueue = () => ({
  address: QUEUE,
  abi: SYNC_DEPOSIT_QUEUE_ABI,
  estimateGas: { deposit: vi.fn(async () => 200_000n) },
  write: { deposit: vi.fn(async () => TX_HASH) },
});
type Queue = ReturnType<typeof createQueue>;

const onRetry = vi.fn();

const deposit = (queue: Queue, token: string) =>
  renderHook(() =>
    useDeposit({
      depositQueueGetter: (() =>
        queue) as unknown as DepositQueueGetter<string>,
      txModalStages: state.txModalStages,
      onRetry,
    }),
  ).deposit({ amount: AMOUNT, token: token as never, referral: REFERRAL });

// the contract keeps the address as the token map spells it
const approveWrite = (value: bigint, tokenAddress: Address) =>
  expect.objectContaining({
    address: tokenAddress,
    functionName: 'approve',
    args: [QUEUE, value],
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
      const queue = createQueue();

      await expect(deposit(queue, TOKENS.eth)).resolves.toBe(true);

      expect(state.walletClient.writeContract).not.toHaveBeenCalled();
      expect(queue.write.deposit).toHaveBeenCalledWith(
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
      );
      expect(state.txModalStages.failed).not.toHaveBeenCalled();
    });

    it('approves and then deposits a token short of allowance', async () => {
      const queue = createQueue();

      await expect(deposit(queue, TOKENS.weth)).resolves.toBe(true);

      expect(state.walletClient.writeContract).toHaveBeenCalledTimes(1);
      expect(state.walletClient.writeContract).toHaveBeenCalledWith(
        approveWrite(AMOUNT, TOKEN_ADDRESSES.weth),
      );
      expect(queue.write.deposit).toHaveBeenCalledWith(
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
      const queue = createQueue();

      await expect(deposit(queue, TOKENS.weth)).resolves.toBe(true);

      expect(state.walletClient.writeContract).not.toHaveBeenCalled();
      expect(queue.write.deposit).toHaveBeenCalledTimes(1);
      expect(state.txModalStages.signApproval).not.toHaveBeenCalled();
    });

    it('resets a non-zero USDT allowance before approving', async () => {
      state.allowance = 1n;
      const queue = createQueue();

      await expect(deposit(queue, TOKENS.usdt)).resolves.toBe(true);

      expect(state.walletClient.writeContract).toHaveBeenCalledTimes(2);
      expect(state.walletClient.writeContract).toHaveBeenNthCalledWith(
        1,
        approveWrite(0n, TOKEN_ADDRESSES.usdt),
      );
      expect(state.walletClient.writeContract).toHaveBeenNthCalledWith(
        2,
        approveWrite(AMOUNT, TOKEN_ADDRESSES.usdt),
      );
      expect(queue.write.deposit).toHaveBeenCalledTimes(1);
    });

    // ETHV-DEP-BIND-05: a settled approval must not read as a completed deposit
    it('reports an unfinished deposit when the approval settles but its confirmation read fails', async () => {
      state.performTransaction.mockImplementation(
        legacyPerformTransaction('unconfirmed'),
      );
      const queue = createQueue();

      await expect(deposit(queue, TOKENS.weth)).resolves.toBe(false);

      expect(state.walletClient.writeContract).toHaveBeenCalledTimes(1);
      expect(queue.write.deposit).not.toHaveBeenCalled();
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

    it('does not approve again when retried after a confirmed approval', async () => {
      state.performTransaction.mockImplementation(
        legacyPerformTransaction('unconfirmed'),
      );
      const queue = createQueue();
      await expect(deposit(queue, TOKENS.weth)).resolves.toBe(false);

      // the allowance is on chain now; the retry reads it and goes to the deposit
      state.allowance = AMOUNT;
      state.performTransaction.mockImplementation(legacyPerformTransaction());
      await expect(deposit(queue, TOKENS.weth)).resolves.toBe(true);

      expect(state.walletClient.writeContract).toHaveBeenCalledTimes(1);
      expect(queue.write.deposit).toHaveBeenCalledTimes(1);
      expect(state.txModalStages.success).toHaveBeenCalledTimes(1);
    });

    it('reports a deposit whose confirmation read failed as completed', async () => {
      const queue = createQueue();
      state.performTransaction.mockImplementation(
        legacyPerformTransaction('unconfirmed'),
      );

      await expect(deposit(queue, TOKENS.eth)).resolves.toBe(true);

      expect(queue.write.deposit).toHaveBeenCalledTimes(1);
      expect(state.txModalStages.failed).toHaveBeenCalledWith(
        expect.any(TxSettledError),
        onRetry,
      );
      expect(state.txModalStages.success).not.toHaveBeenCalled();
    });

    it('stops at a rejected approval and offers a retry', async () => {
      state.performTransaction.mockImplementation(
        legacyPerformTransaction('rejected'),
      );
      const queue = createQueue();

      await expect(deposit(queue, TOKENS.weth)).resolves.toBe(false);

      expect(queue.write.deposit).not.toHaveBeenCalled();
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
      const queue = createQueue();

      await expect(deposit(queue, TOKENS.eth)).resolves.toBe(true);

      expect(state.txModalStages.successMultisig).toHaveBeenCalledTimes(1);
      expect(state.txModalStages.success).not.toHaveBeenCalled();
    });
  });

  describe('EIP-5792 signing', () => {
    beforeEach(() => {
      state.isAA = true;
    });

    it('batches the approval with the deposit and reports as one deposit', async () => {
      const sendCalls = aaSendCalls({ callId: CALL_ID, txHash: TX_HASH });
      state.sendAACalls.mockImplementation(sendCalls);
      const queue = createQueue();

      await expect(deposit(queue, TOKENS.weth)).resolves.toBe(true);

      expect(state.performTransaction).not.toHaveBeenCalled();
      const calls = sentAACalls(sendCalls);
      expect(calls).toHaveLength(2);
      expect(calls[0]?.to).toBe(TOKEN_ADDRESSES.weth);
      expect(calls[1]?.to).toBe(QUEUE);
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
      const queue = createQueue();

      await expect(deposit(queue, TOKENS.eth)).resolves.toBe(true);

      const calls = sentAACalls(sendCalls);
      expect(calls).toHaveLength(1);
      expect(calls[0]?.value).toBe(AMOUNT);
    });

    it('reports a rejected batch and offers a retry', async () => {
      state.sendAACalls.mockImplementation(
        aaSendCalls({
          callId: CALL_ID,
          txHash: TX_HASH,
          failWith: new Error('User rejected the request'),
        }),
      );
      const queue = createQueue();

      await expect(deposit(queue, TOKENS.weth)).resolves.toBe(false);

      expect(state.txModalStages.failed).toHaveBeenCalledWith(
        expect.any(Error),
        onRetry,
      );
    });
  });
});
