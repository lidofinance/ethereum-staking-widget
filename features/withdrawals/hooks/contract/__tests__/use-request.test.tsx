import {
  decodeFunctionData,
  encodeFunctionData,
  getAddress,
  parseAbi,
  type Address,
  type Hash,
} from 'viem';
import {
  TransactionCallbackStage,
  type TransactionCallback,
} from '@lidofinance/lido-ethereum-sdk/core';

import type { TxFlowArgs } from 'modules/web3/hooks/tx-flow/types';
import { TxSentDataUnavailableError } from 'modules/web3';
import { MATOMO_TX_EVENTS_TYPES } from 'consts/matomo';
import { ErrorMessage } from 'utils/getErrorMessage';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import {
  aaSendCalls,
  expectOrdered,
  legacyPerformTransaction,
  renderHook,
  sentAACalls,
} from 'features/stake/shared/__tests__/stake-test-utils';
import { TOKENS_TO_WITHDRAWLS } from 'features/withdrawals/types/tokens-withdrawable';

// Referenced from the hoisted mock factories, so hoisted with them
const { ACCOUNT } = vi.hoisted(() => ({
  ACCOUNT: '0x00000000000000000000000000000000000000aa' as const,
}));
const STETH = getAddress('0x00000000000000000000000000000000000000ab');
const QUEUE = getAddress('0x00000000000000000000000000000000000000ac');
const TX_HASH: Hash =
  '0x1111111111111111111111111111111111111111111111111111111111111111';
const CALL_ID = '0xcall';

const AMOUNT = 10n ** 18n;
const { stETH } = TOKENS_TO_WITHDRAWLS;

const ABI = parseAbi([
  'function approve(address spender, uint256 amount) returns (bool)',
  'function requestWithdrawals(uint256[] amounts, address owner) returns (uint256[])',
  'function requestWithdrawalsWithPermit(uint256[] amounts, address owner, (uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s) permit) returns (uint256[])',
]);

const state = vi.hoisted(() => ({
  isAA: false,
  hasBytecode: false,
  isForceAllowance: false,
  // the bunker state the form loaded with
  isBunker: false,
  // false once a newer submission took over the form's flow
  current: true,
  sdk: undefined as { withdraw: object } | undefined,
  sendAACalls: vi.fn(),
  isBunkerModeActive: vi.fn(async () => false),
  refetchAllowance: vi.fn(async () => undefined),
  setIsForceAllowance: vi.fn(),
  closeModal: vi.fn(),
  txModalStages: {
    dialogBunker: vi.fn(async () => true),
    signPermit: vi.fn(),
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
  return {
    ...errors,
    ...context,
    useDappStatus: () => ({ address: ACCOUNT }),
    useIsSmartAccount: () => ({ hasBytecode: state.hasBytecode }),
    useLidoSDK: () => state.sdk,
    useTxFlow: () => (args: TxFlowArgs) =>
      runTxFlow(args, {
        isAA: state.isAA,
        address: ACCOUNT,
        validateAddress: async () => true,
        sendAACalls: state.sendAACalls,
        isCurrent: () => state.current,
      }),
    applyRoundUpTxParameter: (value: bigint) => value,
  };
});
vi.mock('config', () => ({
  config: {
    WITHDRAWAL_QUEUE_REQUEST_STETH_PERMIT_GAS_LIMIT_DEFAULT: 255_000n,
    WITHDRAWAL_QUEUE_REQUEST_WSTETH_PERMIT_GAS_LIMIT_DEFAULT: 256_000n,
    WITHDRAWAL_QUEUE_REQUEST_STETH_APPROVED_GAS_LIMIT_DEFAULT: 200_000n,
    WITHDRAWAL_QUEUE_REQUEST_WSTETH_APPROVED_GAS_LIMIT_DEFAULT: 201_000n,
  },
}));
vi.mock('utils/track-matomo-event', () => ({ trackMatomoEvent: vi.fn() }));
vi.mock('features/withdrawals/contexts/withdrawals-context', () => ({
  useWithdrawals: () => ({ isBunker: state.isBunker }),
}));
vi.mock(
  'features/withdrawals/request/transaction-modal-request/use-tx-modal-stages-request',
  () => ({
    useTxModalStagesRequest: () => ({ txModalStages: state.txModalStages }),
  }),
);
vi.mock('shared/transaction-modal/transaction-modal', () => ({
  useTransactionModal: () => ({ closeModal: state.closeModal }),
}));
vi.mock('../use-withdrawal-request-tx-approve', () => ({
  useWithdrawalRequestTxApprove: () => ({
    isForceAllowance: state.isForceAllowance,
    setIsForceAllowance: state.setIsForceAllowance,
    refetchAllowance: state.refetchAllowance,
  }),
}));

import { useWithdrawalRequest } from '../useRequest';

type CallbackProps = { callback: TransactionCallback };

// Stand-ins for the SDK withdraw modules: every transaction goes through the
// same performTransaction stage sequence and wallet client, so a chained
// approval and request are observable on one mock in order
type SdkOptions = {
  allowance?: bigint;
  permit?: 'signed' | 'rejected';
};

const createSdk = (
  performTransaction: ReturnType<typeof legacyPerformTransaction>,
  { allowance = 0n, permit = 'signed' }: SdkOptions = {},
) => {
  const walletClient = {
    writeContract: vi.fn(async (_params: object) => TX_HASH),
  };
  const send = (
    address: Address,
    functionName: string,
    args: unknown[],
    callback: TransactionCallback,
  ) =>
    performTransaction({
      account: { address: ACCOUNT },
      callback,
      getGasLimit: async () => 100_000n,
      sendTransaction: (options: object) =>
        walletClient.writeContract({ address, functionName, args, ...options }),
    });
  const getAllowance = vi.fn(async (_props: object) => allowance);
  const signPermit = vi.fn(async () => {
    if (permit === 'rejected') throw new Error('User rejected the request');
  });

  state.sdk = {
    withdraw: {
      views: { isBunkerModeActive: state.isBunkerModeActive },
      approval: {
        getAllowance,
        approve: ({ amount, callback }: CallbackProps & { amount: bigint }) =>
          send(STETH, 'approve', [QUEUE, amount], callback),
        approvePopulateTx: async ({ amount }: { amount: bigint }) => ({
          from: ACCOUNT,
          to: STETH,
          data: encodeFunctionData({
            abi: ABI,
            functionName: 'approve',
            args: [QUEUE, amount],
          }),
        }),
      },
      request: {
        requestWithdrawal: ({
          requests,
          callback,
        }: CallbackProps & { requests: bigint[] }) =>
          send(QUEUE, 'requestWithdrawals', [requests, ACCOUNT], callback),
        requestWithdrawalWithPermit: async ({
          requests,
          callback,
        }: CallbackProps & { requests: bigint[] }) => {
          await callback({ stage: TransactionCallbackStage.PERMIT });
          await signPermit();
          return send(
            QUEUE,
            'requestWithdrawalsWithPermit',
            [requests, ACCOUNT, 'permit'],
            callback,
          );
        },
        requestWithdrawalPopulateTx: async ({
          requests,
          receiver,
        }: {
          requests: bigint[];
          receiver: Address;
        }) => ({
          from: ACCOUNT,
          to: QUEUE,
          data: encodeFunctionData({
            abi: ABI,
            functionName: 'requestWithdrawals',
            args: [requests, receiver],
          }),
        }),
      },
    },
  };

  return { walletClient, getAllowance, signPermit };
};

const approveCall = expect.objectContaining({
  address: STETH,
  functionName: 'approve',
  args: [QUEUE, AMOUNT],
});
const requestCall = expect.objectContaining({
  address: QUEUE,
  functionName: 'requestWithdrawals',
  args: [[AMOUNT], ACCOUNT],
});

const decode = (data?: Hash) => {
  const { functionName, args } = decodeFunctionData({
    abi: ABI,
    data: data as Hash,
  });
  return [functionName, ...(args ?? [])];
};

const onConfirm = vi.fn(async () => {});
const onRetry = vi.fn(() => false);

const submit = () =>
  renderHook(() =>
    useWithdrawalRequest({ amount: AMOUNT, token: stETH, onConfirm, onRetry }),
  ).request({ requests: [AMOUNT], amount: AMOUNT, token: stETH });

const consoleErrorSpy = vi
  .spyOn(console, 'error')
  .mockImplementation(() => undefined);

beforeEach(() => {
  vi.clearAllMocks();
  state.isAA = false;
  state.hasBytecode = false;
  state.isForceAllowance = false;
  state.isBunker = false;
  state.current = true;
  state.txModalStages.dialogBunker.mockResolvedValue(true);
});
afterAll(() => {
  consoleErrorSpy.mockRestore();
});

describe('useWithdrawalRequest', () => {
  describe('approval flow', () => {
    it('requests without an approval when the allowance covers the amount', async () => {
      const { walletClient, getAllowance } = createSdk(
        legacyPerformTransaction('success'),
        { allowance: AMOUNT },
      );

      await expect(submit()).resolves.toBe(true);

      // read at submit time, so a retry after a confirmed approval skips it
      expect(getAllowance).toHaveBeenCalledWith({
        account: ACCOUNT,
        token: stETH,
      });
      expect(walletClient.writeContract).toHaveBeenCalledTimes(1);
      expect(walletClient.writeContract).toHaveBeenCalledWith(requestCall);
      expect(state.txModalStages.signApproval).not.toHaveBeenCalled();
      expect(state.txModalStages.signPermit).not.toHaveBeenCalled();
      expect(state.txModalStages.sign).toHaveBeenCalledWith(AMOUNT, stETH);
      expect(state.txModalStages.pending).toHaveBeenCalledWith(
        AMOUNT,
        stETH,
        TX_HASH,
        false,
      );
      expect(state.txModalStages.success).toHaveBeenCalledWith(
        AMOUNT,
        stETH,
        TX_HASH,
      );
      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(state.refetchAllowance).toHaveBeenCalled();
      expect(state.txModalStages.failed).not.toHaveBeenCalled();
    });

    it.each([
      ['a contract account', { hasBytecode: true, isForceAllowance: false }],
      [
        'the chosen allowance flow',
        { hasBytecode: false, isForceAllowance: true },
      ],
    ])(
      'approves and then requests as two transactions for %s',
      async (_, flags) => {
        Object.assign(state, flags);
        const { walletClient } = createSdk(
          legacyPerformTransaction('success', 'success'),
        );

        await expect(submit()).resolves.toBe(true);

        expect(walletClient.writeContract).toHaveBeenCalledTimes(2);
        expect(walletClient.writeContract).toHaveBeenNthCalledWith(
          1,
          approveCall,
        );
        expect(walletClient.writeContract).toHaveBeenNthCalledWith(
          2,
          requestCall,
        );
        expect(state.txModalStages.pendingApproval).toHaveBeenCalledWith(
          AMOUNT,
          stETH,
          TX_HASH,
        );
        expectOrdered(
          state.txModalStages.signApproval,
          state.txModalStages.pendingApproval,
          state.txModalStages.sign,
          state.txModalStages.pending,
          state.txModalStages.success,
        );
        expect(trackMatomoEvent).toHaveBeenCalledWith(
          MATOMO_TX_EVENTS_TYPES.withdrawalRequestApprovalStart,
        );
        expect(trackMatomoEvent).toHaveBeenCalledWith(
          MATOMO_TX_EVENTS_TYPES.withdrawalRequestApprovalFinish,
        );
        expect(state.txModalStages.signPermit).not.toHaveBeenCalled();
        expect(state.txModalStages.failed).not.toHaveBeenCalled();
      },
    );

    it('shows a failed approval as is and sends no request', async () => {
      state.hasBytecode = true;
      const { walletClient } = createSdk(legacyPerformTransaction('rejected'));

      await expect(submit()).resolves.toBe(false);

      expect(walletClient.writeContract).not.toHaveBeenCalled();
      expect(state.txModalStages.sign).not.toHaveBeenCalled();
      expect(state.txModalStages.failed).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'User rejected the request' }),
        onRetry,
        false,
        expect.any(Function),
      );
    });

    it('reports an interrupted request when the approval landed but the request was not sent, and a retry does not approve again', async () => {
      state.hasBytecode = true;
      const { walletClient, getAllowance } = createSdk(
        legacyPerformTransaction('success', 'unestimated'),
      );

      // not a completed request: the form keeps the amount
      await expect(submit()).resolves.toBe(false);

      expect(walletClient.writeContract).toHaveBeenCalledTimes(1);
      expect(walletClient.writeContract).toHaveBeenCalledWith(approveCall);
      // the allowance changed: the form refreshes it before a retry
      expect(state.refetchAllowance).toHaveBeenCalledTimes(1);
      expectOrdered(state.refetchAllowance, state.txModalStages.failed);
      expect(state.txModalStages.failed).toHaveBeenCalledTimes(1);
      expect(state.txModalStages.failed).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'TxFlowInterruptedError',
          message: ErrorMessage.WITHDRAWAL_REQUEST_INTERRUPTED,
          cause: expect.objectContaining({
            message: 'Not enough ether for gas',
          }),
        }),
        onRetry,
        false,
        expect.any(Function),
      );
      expect(state.txModalStages.success).not.toHaveBeenCalled();

      // Retry: the approval is on chain now
      getAllowance.mockResolvedValue(AMOUNT);
      walletClient.writeContract.mockClear();

      await expect(submit()).resolves.toBe(true);

      expect(walletClient.writeContract).toHaveBeenCalledTimes(1);
      expect(walletClient.writeContract).toHaveBeenCalledWith(requestCall);
      expect(state.txModalStages.success).toHaveBeenCalledTimes(1);
    });

    it('reports an interrupted request when the approval settled but its confirmation read failed', async () => {
      state.hasBytecode = true;
      const { walletClient } = createSdk(
        legacyPerformTransaction('unconfirmed'),
      );

      await expect(submit()).resolves.toBe(false);

      expect(walletClient.writeContract).toHaveBeenCalledTimes(1);
      expect(state.txModalStages.sign).not.toHaveBeenCalled();
      expect(state.txModalStages.failed).toHaveBeenCalledWith(
        expect.objectContaining({
          message: ErrorMessage.WITHDRAWAL_REQUEST_INTERRUPTED,
          cause: expect.objectContaining({
            message: 'confirmations read failed',
          }),
        }),
        onRetry,
        false,
        expect.any(Function),
      );
    });

    it('reports a request that was sent but never read back as sent, not interrupted', async () => {
      state.hasBytecode = true;
      createSdk(legacyPerformTransaction('success', 'unlocated'));

      await expect(submit()).resolves.toBe(false);

      expect(state.txModalStages.failed).toHaveBeenCalledWith(
        expect.any(TxSentDataUnavailableError),
        onRetry,
        false,
        expect.any(Function),
      );
    });

    it('reports a multisig proposal once', async () => {
      state.hasBytecode = true;
      createSdk(legacyPerformTransaction('multisig', 'multisig'));

      await expect(submit()).resolves.toBe(true);

      expect(state.txModalStages.successMultisig).toHaveBeenCalledTimes(1);
      expect(state.txModalStages.success).not.toHaveBeenCalled();
    });
  });

  describe('permit flow', () => {
    it('requests with a permit when an EOA is short of allowance', async () => {
      const { walletClient, signPermit } = createSdk(
        legacyPerformTransaction('success'),
      );

      await expect(submit()).resolves.toBe(true);

      expect(signPermit).toHaveBeenCalledTimes(1);
      expect(walletClient.writeContract).toHaveBeenCalledTimes(1);
      expect(walletClient.writeContract).toHaveBeenCalledWith(
        expect.objectContaining({
          address: QUEUE,
          functionName: 'requestWithdrawalsWithPermit',
        }),
      );
      expect(state.txModalStages.signApproval).not.toHaveBeenCalled();
      expectOrdered(
        state.txModalStages.signPermit,
        state.txModalStages.sign,
        state.txModalStages.pending,
        state.txModalStages.success,
      );
    });

    it('offers the allowance flow when the permit signature fails', async () => {
      const { walletClient } = createSdk(legacyPerformTransaction(), {
        permit: 'rejected',
      });

      await expect(submit()).resolves.toBe(false);

      expect(walletClient.writeContract).not.toHaveBeenCalled();
      expect(state.txModalStages.failed).toHaveBeenCalledTimes(1);
      const [error, retry, suggestTryAllowance, onTryAllowance] =
        state.txModalStages.failed.mock.calls[0];
      expect(error).toEqual(
        expect.objectContaining({ message: 'User rejected the request' }),
      );
      expect(retry).toBe(onRetry);
      expect(suggestTryAllowance).toBe(true);

      onTryAllowance();
      expect(state.closeModal).toHaveBeenCalled();
      expect(state.setIsForceAllowance).toHaveBeenCalledWith(true);
    });

    it('does not ask for a permit when the allowance is already in place', async () => {
      const { walletClient, signPermit } = createSdk(
        legacyPerformTransaction('success'),
        { allowance: AMOUNT },
      );

      await expect(submit()).resolves.toBe(true);

      expect(signPermit).not.toHaveBeenCalled();
      expect(state.txModalStages.signPermit).not.toHaveBeenCalled();
      expect(walletClient.writeContract).toHaveBeenCalledWith(requestCall);
    });
  });

  describe('EIP-5792 signing', () => {
    beforeEach(() => {
      state.isAA = true;
    });

    it('batches the approval with the request', async () => {
      const performTransaction = legacyPerformTransaction();
      createSdk(performTransaction);
      const sendCalls = aaSendCalls({ callId: CALL_ID, txHash: TX_HASH });
      state.sendAACalls.mockImplementation(sendCalls);

      await expect(submit()).resolves.toBe(true);

      expect(performTransaction).not.toHaveBeenCalled();
      const calls = sentAACalls(sendCalls);
      expect(calls.map((call) => call.to)).toEqual([STETH, QUEUE]);
      expect(decode(calls[0]?.data)).toEqual(['approve', QUEUE, AMOUNT]);
      expect(decode(calls[1]?.data)).toEqual([
        'requestWithdrawals',
        [AMOUNT],
        getAddress(ACCOUNT),
      ]);
      // one signature covers both calls: no separate approval or permit stage
      expect(state.txModalStages.signApproval).not.toHaveBeenCalled();
      expect(state.txModalStages.signPermit).not.toHaveBeenCalled();
      expect(state.txModalStages.pending).toHaveBeenCalledWith(
        AMOUNT,
        stETH,
        CALL_ID,
        true,
      );
      expectOrdered(onConfirm, state.txModalStages.success);
      expect(state.refetchAllowance).toHaveBeenCalled();
      expect(state.txModalStages.success).toHaveBeenCalledWith(
        AMOUNT,
        stETH,
        TX_HASH,
      );
    });

    it('sends the request alone when the allowance covers the amount', async () => {
      createSdk(legacyPerformTransaction(), { allowance: AMOUNT });
      const sendCalls = aaSendCalls({ callId: CALL_ID, txHash: TX_HASH });
      state.sendAACalls.mockImplementation(sendCalls);

      await expect(submit()).resolves.toBe(true);

      const calls = sentAACalls(sendCalls);
      expect(calls).toHaveLength(1);
      expect(calls[0]?.to).toBe(QUEUE);
    });
  });

  describe('bunker mode', () => {
    it('sends the request without a dialog or an extra read when bunker mode is off', async () => {
      createSdk(legacyPerformTransaction('success'), { allowance: AMOUNT });

      await expect(submit()).resolves.toBe(true);

      expect(state.txModalStages.dialogBunker).not.toHaveBeenCalled();
      expect(state.isBunkerModeActive).not.toHaveBeenCalled();
    });

    it('asks to confirm from the form state, without an extra read', async () => {
      state.isBunker = true;
      const { walletClient, getAllowance } = createSdk(
        legacyPerformTransaction('success'),
        { allowance: AMOUNT },
      );

      await expect(submit()).resolves.toBe(true);

      expect(state.isBunkerModeActive).not.toHaveBeenCalled();
      expect(state.txModalStages.dialogBunker).toHaveBeenCalledTimes(1);
      expectOrdered(state.txModalStages.dialogBunker, getAllowance);
      expect(walletClient.writeContract).toHaveBeenCalledTimes(1);
    });

    it('sends nothing when the user declines', async () => {
      state.isBunker = true;
      state.txModalStages.dialogBunker.mockResolvedValue(false);
      const { walletClient, getAllowance } = createSdk(
        legacyPerformTransaction('success'),
      );

      await expect(submit()).resolves.toBe(false);

      expect(state.closeModal).toHaveBeenCalled();
      expect(getAllowance).not.toHaveBeenCalled();
      expect(walletClient.writeContract).not.toHaveBeenCalled();
      expect(state.txModalStages.failed).not.toHaveBeenCalled();
    });
  });

  describe('a newer submission takes over', () => {
    it('never reaches the wallet and shows nothing when superseded at the signing stage', async () => {
      const { walletClient } = createSdk(legacyPerformTransaction('success'), {
        allowance: AMOUNT,
      });
      state.txModalStages.sign.mockImplementationOnce(() => {
        state.current = false;
      });

      await expect(submit()).resolves.toBe(false);

      expect(walletClient.writeContract).not.toHaveBeenCalled();
      expect(state.txModalStages.failed).not.toHaveBeenCalled();
    });

    it('never sends the request when superseded after the approval', async () => {
      state.hasBytecode = true;
      const { walletClient } = createSdk(
        legacyPerformTransaction('success', 'success'),
      );
      state.txModalStages.pendingApproval.mockImplementationOnce(() => {
        state.current = false;
      });

      await expect(submit()).resolves.toBe(false);

      expect(walletClient.writeContract).toHaveBeenCalledTimes(1);
      expect(walletClient.writeContract).toHaveBeenCalledWith(approveCall);
      expect(state.txModalStages.failed).not.toHaveBeenCalled();
    });
  });
});
