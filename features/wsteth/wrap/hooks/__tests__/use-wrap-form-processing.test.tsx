import {
  decodeFunctionData,
  encodeFunctionData,
  getAddress,
  parseAbi,
  type Address,
  type Hash,
} from 'viem';
import type { TransactionCallback } from '@lidofinance/lido-ethereum-sdk/core';

import type { TxFlowArgs } from 'modules/web3/tx-flow/types';
import { TxSettledError, TxSentDataUnavailableError } from 'modules/web3';
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

import { TOKENS_TO_WRAP } from '../../../shared/types';

// Referenced from the hoisted mock factories, so hoisted with them
const { ACCOUNT, FALLBACK_REFERRAL } = vi.hoisted(() => ({
  ACCOUNT: '0x00000000000000000000000000000000000000aa' as const,
  FALLBACK_REFERRAL: '0x00000000000000000000000000000000000000fb' as const,
}));
const REFERRAL: Address = '0x00000000000000000000000000000000000000bb';
const STETH = getAddress('0x00000000000000000000000000000000000000ab');
const WSTETH = getAddress('0x00000000000000000000000000000000000000ac');
const REFERRAL_STAKER = getAddress(
  '0x00000000000000000000000000000000000000ad',
);
const L2_STETH = getAddress('0x00000000000000000000000000000000000000ae');
const TX_HASH: Hash =
  '0x1111111111111111111111111111111111111111111111111111111111111111';
const CALL_ID = '0xcall';

const P = 10n ** 18n;
const AMOUNT = 2n * P;
// the wstETH the conversion reads return for AMOUNT
const WILL_RECEIVE = (AMOUNT * 5n) / 6n;
const BALANCE_AFTER = 3n * P + WILL_RECEIVE;

const { ETH, stETH } = TOKENS_TO_WRAP;

const ABI = parseAbi([
  'function approve(address spender, uint256 amount) returns (bool)',
  'function wrap(uint256 amount) returns (uint256)',
  'function unwrap(uint256 amount) returns (uint256)',
  'function stakeETH(address referral) payable returns (uint256)',
]);

const state = vi.hoisted(() => ({
  isAA: false,
  isL2Wrap: false,
  // false once a newer submission took over the form's flow
  current: true,
  sdk: undefined as { wrap: unknown; wstETH: unknown } | undefined,
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
    applyRoundUpTxParameter: (value: bigint) => value,
  };
});
vi.mock('config', () => ({
  config: {
    enableQaHelpers: false,
    WRAP_ETH_GASLIMIT_FALLBACK: 120_000n,
    FALLBACK_REFERRAL_ADDRESS: FALLBACK_REFERRAL,
  },
}));
vi.mock('utils/track-matomo-event', () => ({ trackMatomoEvent: vi.fn() }));
vi.mock('../use-tx-modal-stages-wrap', () => ({
  useTxModalWrap: () => ({ txModalStages: state.txModalStages }),
}));

import { useWrapFormProcessor } from '../use-wrap-form-processing';

type SendProps = { value: bigint; callback: TransactionCallback };

// Stand-ins for the SDK wrap modules: every transaction goes through the
// same performTransaction stage sequence and wallet client, so a chained
// approval and wrap are observable on one mock in order
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
    ({ value, callback }: SendProps, ethValue?: bigint) =>
      performTransaction({
        account: { address: ACCOUNT },
        callback,
        getGasLimit: async () => 100_000n,
        sendTransaction: (options: object) =>
          walletClient.writeContract({
            address,
            functionName,
            args: args(value),
            ...(ethValue !== undefined && { value: ethValue }),
            ...options,
          }),
      });
  const populate = (to: Address, data: Hash, value?: bigint) => ({
    to,
    from: ACCOUNT,
    data,
    ...(value !== undefined && { value }),
  });

  const allowanceRead = vi.fn(async () => allowance);
  const wrap = {
    core: { publicClient: {} },
    getStethForWrapAllowance: allowanceRead,
    convertStethToWsteth: vi.fn(async () => WILL_RECEIVE),
    approveStethForWrap: send(STETH, 'approve', (value) => [WSTETH, value]),
    wrapSteth: send(WSTETH, 'wrap', (value) => [value]),
    wrapEth: (props: SendProps & { referralAddress: Address }) =>
      send(REFERRAL_STAKER, 'stakeETH', () => [props.referralAddress])(
        props,
        props.value,
      ),
    approveStethForWrapPopulateTx: async ({ value }: { value: bigint }) =>
      populate(
        STETH,
        encodeFunctionData({
          abi: ABI,
          functionName: 'approve',
          args: [WSTETH, value],
        }),
      ),
    wrapStethPopulateTx: async ({ value }: { value: bigint }) =>
      populate(
        WSTETH,
        encodeFunctionData({ abi: ABI, functionName: 'wrap', args: [value] }),
      ),
    wrapEthPopulateTx: async ({
      value,
      referralAddress,
    }: {
      value: bigint;
      referralAddress: Address;
    }) =>
      populate(
        REFERRAL_STAKER,
        encodeFunctionData({
          abi: ABI,
          functionName: 'stakeETH',
          args: [referralAddress],
        }),
        value,
      ),
  };
  const wstethBalance = vi.fn(async () => BALANCE_AFTER);
  state.sdk = { wrap, wstETH: { balance: wstethBalance } };

  // on L2 stETH → wstETH is the stETH token's unwrap
  const l2 = {
    steth: { convertToShares: vi.fn(async () => WILL_RECEIVE) },
    wsteth: { balance: wstethBalance },
    unwrapStethToWsteth: send(L2_STETH, 'unwrap', (value) => [value]),
    unwrapStethPopulateTx: async ({ value }: { value: bigint }) =>
      populate(
        L2_STETH,
        encodeFunctionData({ abi: ABI, functionName: 'unwrap', args: [value] }),
      ),
  };
  state.l2 = l2;

  return { walletClient, allowanceRead, l2 };
};

const approveCall = expect.objectContaining({
  address: STETH,
  functionName: 'approve',
  args: [WSTETH, AMOUNT],
});
const wrapCall = expect.objectContaining({
  address: WSTETH,
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

const submit = (token: TOKENS_TO_WRAP = stETH) =>
  renderHook(() => useWrapFormProcessor({ onConfirm, onRetry }))({
    amount: AMOUNT,
    token,
    referral: REFERRAL,
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

describe('useWrapFormProcessor', () => {
  describe('legacy signing, stETH', () => {
    it('wraps without an approval when the allowance covers the amount', async () => {
      const { walletClient, allowanceRead } = createSdk(
        legacyPerformTransaction('success'),
        { allowance: AMOUNT },
      );

      await expect(submit()).resolves.toBe(true);

      // read at submit time, so a retry after a confirmed approval skips it
      expect(allowanceRead).toHaveBeenCalledWith(ACCOUNT);

      expect(walletClient.writeContract).toHaveBeenCalledTimes(1);
      expect(walletClient.writeContract).toHaveBeenCalledWith(wrapCall);
      expect(state.txModalStages.signApproval).not.toHaveBeenCalled();
      expect(state.txModalStages.sign).toHaveBeenCalledWith(
        AMOUNT,
        stETH,
        WILL_RECEIVE,
      );
      expect(state.txModalStages.pending).toHaveBeenCalledWith(
        AMOUNT,
        stETH,
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

    it('approves and then wraps as two transactions', async () => {
      const { walletClient } = createSdk(
        legacyPerformTransaction('success', 'success'),
      );

      await expect(submit()).resolves.toBe(true);

      expect(walletClient.writeContract).toHaveBeenCalledTimes(2);
      expect(walletClient.writeContract).toHaveBeenNthCalledWith(
        1,
        approveCall,
      );
      expect(walletClient.writeContract).toHaveBeenNthCalledWith(2, wrapCall);
      expect(state.txModalStages.signApproval).toHaveBeenCalledWith(
        AMOUNT,
        stETH,
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
        MATOMO_TX_EVENTS_TYPES.wrapApprovalStart,
      );
      expect(trackMatomoEvent).toHaveBeenCalledWith(
        MATOMO_TX_EVENTS_TYPES.wrapApprovalFinish,
      );
      expect(state.txModalStages.failed).not.toHaveBeenCalled();
    });

    it('offers to continue when the approval settles but its confirmation read fails', async () => {
      const { walletClient } = createSdk(
        legacyPerformTransaction('unconfirmed'),
      );

      // not a completed wrap: the form keeps the amount
      await expect(submit()).resolves.toBe(false);

      expect(walletClient.writeContract).toHaveBeenCalledTimes(1);
      expect(walletClient.writeContract).toHaveBeenCalledWith(approveCall);
      expect(state.txModalStages.sign).not.toHaveBeenCalled();
      // the allowance changed: the form refreshes it before a retry
      expect(onConfirm).toHaveBeenCalledTimes(1);
      expectOrdered(onConfirm, state.txModalStages.failed);
      expect(state.txModalStages.failed).toHaveBeenCalledTimes(1);
      expect(state.txModalStages.failed).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'TxFlowInterruptedError',
          message: ErrorMessage.WRAP_INTERRUPTED,
          cause: expect.objectContaining({
            message: 'confirmations read failed',
          }),
        }),
        onRetry,
      );
      expect(state.txModalStages.success).not.toHaveBeenCalled();
    });

    it('reports the completed approval when the wrap signature is rejected', async () => {
      const { walletClient } = createSdk(
        legacyPerformTransaction('success', 'rejected'),
      );

      await expect(submit()).resolves.toBe(false);

      expect(walletClient.writeContract).toHaveBeenCalledTimes(1);
      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(state.txModalStages.failed).toHaveBeenCalledWith(
        expect.objectContaining({ message: ErrorMessage.WRAP_INTERRUPTED }),
        onRetry,
      );
    });

    it('reports a wrap whose confirmation read failed as completed', async () => {
      createSdk(legacyPerformTransaction('unconfirmed'), { allowance: AMOUNT });

      await expect(submit()).resolves.toBe(true);

      expect(state.txModalStages.failed).toHaveBeenCalledWith(
        expect.any(TxSettledError),
        onRetry,
      );
      expect(state.txModalStages.success).not.toHaveBeenCalled();
    });

    it('reports a wrap that could not be read back as sent, not failed', async () => {
      createSdk(legacyPerformTransaction('unlocated'), { allowance: AMOUNT });

      await expect(submit()).resolves.toBe(false);

      expect(state.txModalStages.failed).toHaveBeenCalledWith(
        expect.any(TxSentDataUnavailableError),
        onRetry,
      );
    });

    it('reports a multisig proposal once', async () => {
      createSdk(legacyPerformTransaction('multisig', 'multisig'));

      await expect(submit()).resolves.toBe(true);

      expect(state.txModalStages.successMultisig).toHaveBeenCalledTimes(1);
      expect(state.txModalStages.success).not.toHaveBeenCalled();
    });
  });

  describe('legacy signing, ETH', () => {
    it('stakes and wraps the ETH in one call, without an allowance', async () => {
      const { walletClient, allowanceRead } = createSdk(
        legacyPerformTransaction('success'),
      );

      await expect(submit(ETH)).resolves.toBe(true);

      expect(allowanceRead).not.toHaveBeenCalled();
      expect(walletClient.writeContract).toHaveBeenCalledTimes(1);
      expect(walletClient.writeContract).toHaveBeenCalledWith(
        expect.objectContaining({
          address: REFERRAL_STAKER,
          functionName: 'stakeETH',
          args: [getAddress(REFERRAL)],
          value: AMOUNT,
        }),
      );
      expect(state.txModalStages.sign).toHaveBeenCalledWith(
        AMOUNT,
        ETH,
        WILL_RECEIVE,
      );
      expect(state.txModalStages.success).toHaveBeenCalledWith(
        BALANCE_AFTER,
        TX_HASH,
      );
    });
  });

  describe('legacy signing, L2', () => {
    beforeEach(() => {
      state.isL2Wrap = true;
    });

    it('wraps through the stETH token without an allowance', async () => {
      const { walletClient, allowanceRead, l2 } = createSdk(
        legacyPerformTransaction('success'),
      );

      await expect(submit()).resolves.toBe(true);

      expect(allowanceRead).not.toHaveBeenCalled();
      expect(l2.steth.convertToShares).toHaveBeenCalledWith(AMOUNT);
      expect(walletClient.writeContract).toHaveBeenCalledTimes(1);
      expect(walletClient.writeContract).toHaveBeenCalledWith(
        expect.objectContaining({
          address: L2_STETH,
          functionName: 'unwrap',
          args: [AMOUNT],
        }),
      );
      expect(state.txModalStages.success).toHaveBeenCalledWith(
        BALANCE_AFTER,
        TX_HASH,
      );
    });
  });

  describe('EIP-5792 signing', () => {
    beforeEach(() => {
      state.isAA = true;
    });

    it('batches the approval with the wrap', async () => {
      const performTransaction = legacyPerformTransaction();
      createSdk(performTransaction);
      const sendCalls = aaSendCalls({ callId: CALL_ID, txHash: TX_HASH });
      state.sendAACalls.mockImplementation(sendCalls);

      await expect(submit()).resolves.toBe(true);

      expect(performTransaction).not.toHaveBeenCalled();
      const calls = sentAACalls(sendCalls);
      expect(calls.map((call) => call.to)).toEqual([STETH, WSTETH]);
      expect(decode(calls[0]?.data)).toEqual(['approve', WSTETH, AMOUNT]);
      expect(decode(calls[1]?.data)).toEqual(['wrap', AMOUNT]);
      // one signature covers both calls: no separate approval stage
      expect(state.txModalStages.signApproval).not.toHaveBeenCalled();
      expect(state.txModalStages.sign).toHaveBeenCalledWith(
        AMOUNT,
        stETH,
        WILL_RECEIVE,
      );
      expect(state.txModalStages.pending).toHaveBeenCalledWith(
        AMOUNT,
        stETH,
        WILL_RECEIVE,
        CALL_ID,
        true,
      );
      expect(state.txModalStages.success).toHaveBeenCalledWith(
        BALANCE_AFTER,
        TX_HASH,
      );
    });

    it('sends the ETH wrap as one call carrying the value', async () => {
      createSdk(legacyPerformTransaction());
      const sendCalls = aaSendCalls({ callId: CALL_ID, txHash: TX_HASH });
      state.sendAACalls.mockImplementation(sendCalls);

      await expect(submit(ETH)).resolves.toBe(true);

      const calls = sentAACalls(sendCalls);
      expect(calls).toHaveLength(1);
      expect(calls[0]?.to).toBe(REFERRAL_STAKER);
      expect(calls[0]?.value).toBe(AMOUNT);
      expect(decode(calls[0]?.data)).toEqual([
        'stakeETH',
        getAddress(REFERRAL),
      ]);
    });
  });

  describe('a newer submission takes over', () => {
    it('never reaches the wallet when superseded at the signing stage', async () => {
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

    it('never sends the wrap when superseded after the approval', async () => {
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

    it('never offers a retry for a wrap that settled before its confirmation read failed', async () => {
      const { walletClient } = createSdk(
        legacyPerformTransaction('unconfirmed'),
        {
          allowance: AMOUNT,
        },
      );
      state.txModalStages.pending.mockImplementationOnce(() => {
        state.current = false;
      });

      // the wrap is on chain: a completed wrap, the form resets
      await expect(submit()).resolves.toBe(true);

      expect(walletClient.writeContract).toHaveBeenCalledTimes(1);
      expect(state.txModalStages.failed).not.toHaveBeenCalled();
      expect(state.txModalStages.success).not.toHaveBeenCalled();
    });

    it('never offers a retry for a wrap that was sent but never read back', async () => {
      const { walletClient } = createSdk(
        legacyPerformTransaction('unlocated'),
        {
          allowance: AMOUNT,
        },
      );
      state.txModalStages.pending.mockImplementationOnce(() => {
        state.current = false;
      });

      await expect(submit()).resolves.toBe(false);

      expect(walletClient.writeContract).toHaveBeenCalledTimes(1);
      expect(state.txModalStages.failed).not.toHaveBeenCalled();
    });
  });
});
