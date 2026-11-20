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

import type { TxCallbackProps, TxFlowArgs } from 'modules/web3/tx-flow/types';
import { TxSettledError, TxSentDataUnavailableError } from 'modules/web3';
import { ErrorMessage } from 'utils/getErrorMessage';
import {
  aaSendCalls,
  expectOrdered,
  legacyPerformTransaction,
  renderHook,
  sentAACalls,
} from 'features/stake/shared/__tests__/stake-test-utils';

// Referenced from the hoisted mock factories, so hoisted with them
const { ACCOUNT } = vi.hoisted(() => ({
  ACCOUNT: '0x00000000000000000000000000000000000000aa' as const,
}));
const WSTETH = getAddress('0x00000000000000000000000000000000000000ac');
const L2_WSTETH = getAddress('0x00000000000000000000000000000000000000ad');
const L2_STETH = getAddress('0x00000000000000000000000000000000000000ae');
const TX_HASH: Hash =
  '0x1111111111111111111111111111111111111111111111111111111111111111';
const CALL_ID = '0xcall';

const P = 10n ** 18n;
const AMOUNT = 2n * P;
// the stETH the conversion reads return for AMOUNT
const WILL_RECEIVE = (AMOUNT * 6n) / 5n;
const BALANCE_AFTER = 3n * P + WILL_RECEIVE;

const ABI = parseAbi([
  'function approve(address spender, uint256 amount) returns (bool)',
  'function wrap(uint256 amount) returns (uint256)',
  'function unwrap(uint256 amount) returns (uint256)',
]);

const state = vi.hoisted(() => ({
  isAA: false,
  isL2Wrap: false,
  // false once a newer submission took over the form's flow
  current: true,
  sdk: undefined as { wrap: unknown; stETH: unknown } | undefined,
  l2: {},
  sendAACalls: vi.fn(),
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
  return {
    ...actual,
    ...errors,
    ...context,
    useDappStatus: () => ({ address: ACCOUNT }),
    useAA: () => ({ isAA: state.isAA }),
    useLidoSDK: () => state.sdk,
    useLidoSDKL2: () => ({ l2: state.l2, isL2Wrap: state.isL2Wrap }),
    useTxFlow: () => (args: TxFlowArgs) =>
      runTxFlow(args, {
        isAA: state.isAA,
        address: ACCOUNT,
        validateAddress: async () => true,
        sendAACalls: state.sendAACalls,
        isCurrent: () => state.current,
      }),
  };
});
vi.mock('utils/track-matomo-event', () => ({ trackMatomoEvent: vi.fn() }));
vi.mock('../use-tx-modal-stages-unwrap', () => ({
  useTxModalStagesUnwrap: () => ({ txModalStages: state.txModalStages }),
}));

import { useUnwrapFormProcessor } from '../use-unwrap-form-processing';

type SendProps = { value: bigint; callback: TransactionCallback };

// Stand-ins for the SDK wrap modules: every transaction goes through the
// same performTransaction stage sequence and wallet client, so a chained
// approval and unwrap are observable on one mock in order
const createSdk = (
  performTransaction: ReturnType<typeof legacyPerformTransaction>,
  { allowance = 0n } = {},
) => {
  const walletClient = {
    writeContract: vi.fn(async (_params: object) => TX_HASH),
  };
  const send =
    (
      address: Address,
      functionName: string,
      args: (value: bigint) => unknown[],
    ) =>
    ({ value, callback }: SendProps) =>
      performTransaction({
        account: { address: ACCOUNT },
        callback,
        getGasLimit: async () => 100_000n,
        sendTransaction: (options: object) =>
          walletClient.writeContract({
            address,
            functionName,
            args: args(value),
            ...options,
          }),
      });
  const populate = (to: Address, data: Hash) => ({ to, from: ACCOUNT, data });

  const stethBalance = vi.fn(async () => BALANCE_AFTER);
  const wrap = {
    convertWstethToSteth: vi.fn(async () => WILL_RECEIVE),
    unwrap: send(WSTETH, 'unwrap', (value) => [value]),
    unwrapPopulateTx: async ({ value }: { value: bigint }) =>
      populate(
        WSTETH,
        encodeFunctionData({ abi: ABI, functionName: 'unwrap', args: [value] }),
      ),
  };
  state.sdk = { wrap, stETH: { balance: stethBalance } };

  // on L2 wstETH → stETH is the stETH token's wrap, which pulls the wstETH
  const allowanceRead = vi.fn(async () => allowance);
  const l2 = {
    steth: {
      convertToSteth: vi.fn(async () => WILL_RECEIVE),
      balance: stethBalance,
    },
    getWstethForWrapAllowance: allowanceRead,
    approveWstethForWrap: send(L2_WSTETH, 'approve', (value) => [
      L2_STETH,
      value,
    ]),
    wrapWstethToSteth: send(L2_STETH, 'wrap', (value) => [value]),
    approveWstethForWrapPopulateTx: async ({ value }: { value: bigint }) =>
      populate(
        L2_WSTETH,
        encodeFunctionData({
          abi: ABI,
          functionName: 'approve',
          args: [L2_STETH, value],
        }),
      ),
    wrapWstethToStethPopulateTx: async ({ value }: { value: bigint }) =>
      populate(
        L2_STETH,
        encodeFunctionData({ abi: ABI, functionName: 'wrap', args: [value] }),
      ),
  };
  state.l2 = l2;

  return { walletClient, allowanceRead };
};

const unwrapCall = expect.objectContaining({
  address: WSTETH,
  functionName: 'unwrap',
  args: [AMOUNT],
});
const l2ApproveCall = expect.objectContaining({
  address: L2_WSTETH,
  functionName: 'approve',
  args: [L2_STETH, AMOUNT],
});
const l2UnwrapCall = expect.objectContaining({
  address: L2_STETH,
  functionName: 'wrap',
  args: [AMOUNT],
});

const decode = (data?: Hash) => {
  const { functionName, args } = decodeFunctionData({
    abi: ABI,
    data: data as Hash,
  });
  return [functionName, ...(args ?? [])];
};

const onConfirm = vi.fn(async () => {});
const onRetry = vi.fn();

const submit = () =>
  renderHook(() => useUnwrapFormProcessor({ onConfirm, onRetry }))({
    amount: AMOUNT,
    dummyErrorField: null,
  });

const consoleWarnSpy = vi
  .spyOn(console, 'warn')
  .mockImplementation(() => undefined);

beforeEach(() => {
  vi.clearAllMocks();
  state.isAA = false;
  state.isL2Wrap = false;
  state.current = true;
});
afterAll(() => {
  consoleWarnSpy.mockRestore();
});

describe('useUnwrapFormProcessor', () => {
  describe('legacy signing, L1', () => {
    it('unwraps without an allowance', async () => {
      const { walletClient, allowanceRead } = createSdk(
        legacyPerformTransaction('success'),
      );

      await expect(submit()).resolves.toBe(true);

      expect(allowanceRead).not.toHaveBeenCalled();
      expect(walletClient.writeContract).toHaveBeenCalledTimes(1);
      expect(walletClient.writeContract).toHaveBeenCalledWith(unwrapCall);
      expect(state.txModalStages.sign).toHaveBeenCalledWith(
        AMOUNT,
        WILL_RECEIVE,
      );
      expect(state.txModalStages.pending).toHaveBeenCalledWith(
        AMOUNT,
        WILL_RECEIVE,
        TX_HASH,
        false,
      );
      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(state.txModalStages.success).toHaveBeenCalledWith(
        BALANCE_AFTER,
        TX_HASH,
      );
      expect(state.txModalStages.failed).not.toHaveBeenCalled();
    });

    it('reports an unwrap whose confirmation read failed as completed', async () => {
      createSdk(legacyPerformTransaction('unconfirmed'));

      await expect(submit()).resolves.toBe(true);

      expect(state.txModalStages.failed).toHaveBeenCalledWith(
        expect.any(TxSettledError),
        onRetry,
      );
      expect(state.txModalStages.success).not.toHaveBeenCalled();
    });

    it('reports an unwrap that could not be read back as sent, not failed', async () => {
      createSdk(legacyPerformTransaction('unlocated'));

      await expect(submit()).resolves.toBe(false);

      expect(state.txModalStages.failed).toHaveBeenCalledWith(
        expect.any(TxSentDataUnavailableError),
        onRetry,
      );
    });

    it('reports a rejected signature and offers a retry', async () => {
      const { walletClient } = createSdk(legacyPerformTransaction('rejected'));

      await expect(submit()).resolves.toBe(false);

      expect(walletClient.writeContract).not.toHaveBeenCalled();
      expect(onConfirm).not.toHaveBeenCalled();
      expect(state.txModalStages.failed).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'User rejected the request' }),
        onRetry,
      );
    });
  });

  describe('legacy signing, L2', () => {
    beforeEach(() => {
      state.isL2Wrap = true;
    });

    it('unwraps without an approval when the allowance covers the amount', async () => {
      const { walletClient, allowanceRead } = createSdk(
        legacyPerformTransaction('success'),
        { allowance: AMOUNT },
      );

      await expect(submit()).resolves.toBe(true);

      // read at submit time, so a retry after a confirmed approval skips it
      expect(allowanceRead).toHaveBeenCalledWith(ACCOUNT);
      expect(walletClient.writeContract).toHaveBeenCalledTimes(1);
      expect(walletClient.writeContract).toHaveBeenCalledWith(l2UnwrapCall);
      expect(state.txModalStages.signApproval).not.toHaveBeenCalled();
      expect(state.txModalStages.success).toHaveBeenCalledWith(
        BALANCE_AFTER,
        TX_HASH,
      );
    });

    it('approves and then unwraps as two transactions', async () => {
      const { walletClient } = createSdk(
        legacyPerformTransaction('success', 'success'),
      );

      await expect(submit()).resolves.toBe(true);

      expect(walletClient.writeContract).toHaveBeenCalledTimes(2);
      expect(walletClient.writeContract).toHaveBeenNthCalledWith(
        1,
        l2ApproveCall,
      );
      expect(walletClient.writeContract).toHaveBeenNthCalledWith(
        2,
        l2UnwrapCall,
      );
      expect(state.txModalStages.signApproval).toHaveBeenCalledWith(AMOUNT);
      expect(state.txModalStages.pendingApproval).toHaveBeenCalledWith(
        AMOUNT,
        TX_HASH,
      );
      expectOrdered(
        state.txModalStages.signApproval,
        state.txModalStages.pendingApproval,
        state.txModalStages.sign,
        state.txModalStages.pending,
        state.txModalStages.success,
      );
      expect(state.txModalStages.failed).not.toHaveBeenCalled();
    });

    it('offers to continue when the approval settles but its confirmation read fails', async () => {
      const { walletClient } = createSdk(
        legacyPerformTransaction('unconfirmed'),
      );

      // not a completed unwrap: the form keeps the amount
      await expect(submit()).resolves.toBe(false);

      expect(walletClient.writeContract).toHaveBeenCalledTimes(1);
      expect(walletClient.writeContract).toHaveBeenCalledWith(l2ApproveCall);
      expect(state.txModalStages.sign).not.toHaveBeenCalled();
      // the allowance changed: the form refreshes it before a retry
      expect(onConfirm).toHaveBeenCalledTimes(1);
      expectOrdered(onConfirm, state.txModalStages.failed);
      expect(state.txModalStages.failed).toHaveBeenCalledTimes(1);
      expect(state.txModalStages.failed).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'TxFlowInterruptedError',
          message: ErrorMessage.UNWRAP_INTERRUPTED,
          cause: expect.objectContaining({
            message: 'confirmations read failed',
          }),
        }),
        onRetry,
      );
      expect(state.txModalStages.success).not.toHaveBeenCalled();
    });

    it('reports the completed approval when the unwrap signature is rejected', async () => {
      const { walletClient } = createSdk(
        legacyPerformTransaction('success', 'rejected'),
      );

      await expect(submit()).resolves.toBe(false);

      expect(walletClient.writeContract).toHaveBeenCalledTimes(1);
      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(state.txModalStages.failed).toHaveBeenCalledWith(
        expect.objectContaining({ message: ErrorMessage.UNWRAP_INTERRUPTED }),
        onRetry,
      );
    });
  });

  describe('EIP-5792 signing', () => {
    beforeEach(() => {
      state.isAA = true;
    });

    it('sends the L1 unwrap as one call', async () => {
      const performTransaction = legacyPerformTransaction();
      createSdk(performTransaction);
      const sendCalls = aaSendCalls({ callId: CALL_ID, txHash: TX_HASH });
      state.sendAACalls.mockImplementation(sendCalls);

      await expect(submit()).resolves.toBe(true);

      expect(performTransaction).not.toHaveBeenCalled();
      const calls = sentAACalls(sendCalls);
      expect(calls).toHaveLength(1);
      expect(calls[0]?.to).toBe(WSTETH);
      expect(decode(calls[0]?.data)).toEqual(['unwrap', AMOUNT]);
      expect(state.txModalStages.pending).toHaveBeenCalledWith(
        AMOUNT,
        WILL_RECEIVE,
        CALL_ID,
        true,
      );
      expect(state.txModalStages.success).toHaveBeenCalledWith(
        BALANCE_AFTER,
        TX_HASH,
      );
    });

    it('batches the L2 approval with the unwrap', async () => {
      state.isL2Wrap = true;
      createSdk(legacyPerformTransaction());
      const sendCalls = aaSendCalls({ callId: CALL_ID, txHash: TX_HASH });
      state.sendAACalls.mockImplementation(sendCalls);

      await expect(submit()).resolves.toBe(true);

      const calls = sentAACalls(sendCalls);
      expect(calls.map((call) => call.to)).toEqual([L2_WSTETH, L2_STETH]);
      expect(decode(calls[0]?.data)).toEqual(['approve', L2_STETH, AMOUNT]);
      expect(decode(calls[1]?.data)).toEqual(['wrap', AMOUNT]);
      // one signature covers both calls: no separate approval stage
      expect(state.txModalStages.signApproval).not.toHaveBeenCalled();
      expect(state.txModalStages.sign).toHaveBeenCalledWith(
        AMOUNT,
        WILL_RECEIVE,
      );
      expect(state.txModalStages.success).toHaveBeenCalledWith(
        BALANCE_AFTER,
        TX_HASH,
      );
    });
  });

  describe('a newer submission takes over', () => {
    it('never reaches the wallet when superseded at the signing stage', async () => {
      const { walletClient } = createSdk(legacyPerformTransaction('success'));
      state.txModalStages.sign.mockImplementationOnce(() => {
        state.current = false;
      });

      await expect(submit()).resolves.toBe(false);

      expect(walletClient.writeContract).not.toHaveBeenCalled();
      expect(state.txModalStages.failed).not.toHaveBeenCalled();
    });

    it('never reaches the wallet with an AA batch superseded at the signing stage', async () => {
      state.isAA = true;
      createSdk(legacyPerformTransaction());
      const walletSendCalls = vi.fn();
      // mirrors useSendAACalls: SIGN is awaited right before sendCalls
      state.sendAACalls.mockImplementation(
        async (
          _calls: unknown,
          callback: (props: TxCallbackProps) => Promise<void>,
        ) => {
          await callback({ stage: TransactionCallbackStage.SIGN });
          walletSendCalls();
        },
      );
      state.txModalStages.sign.mockImplementationOnce(() => {
        state.current = false;
      });

      await expect(submit()).resolves.toBe(false);

      expect(walletSendCalls).not.toHaveBeenCalled();
      expect(state.txModalStages.failed).not.toHaveBeenCalled();
    });

    it('never offers a retry for an unwrap that settled before its confirmation read failed', async () => {
      const { walletClient } = createSdk(
        legacyPerformTransaction('unconfirmed'),
      );
      state.txModalStages.pending.mockImplementationOnce(() => {
        state.current = false;
      });

      // the unwrap is on chain: a completed unwrap, the form resets
      await expect(submit()).resolves.toBe(true);

      expect(walletClient.writeContract).toHaveBeenCalledTimes(1);
      expect(state.txModalStages.failed).not.toHaveBeenCalled();
      expect(state.txModalStages.success).not.toHaveBeenCalled();
    });

    it('never offers a retry for an unwrap that was sent but never read back', async () => {
      const { walletClient } = createSdk(legacyPerformTransaction('unlocated'));
      state.txModalStages.pending.mockImplementationOnce(() => {
        state.current = false;
      });

      await expect(submit()).resolves.toBe(false);

      expect(walletClient.writeContract).toHaveBeenCalledTimes(1);
      expect(state.txModalStages.failed).not.toHaveBeenCalled();
    });
  });
});
