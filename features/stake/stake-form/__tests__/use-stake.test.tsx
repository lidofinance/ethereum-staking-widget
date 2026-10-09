import {
  decodeFunctionData,
  encodeFunctionData,
  getAddress,
  type Address,
  type Hash,
} from 'viem';
import { StethAbi } from '@lidofinance/lido-ethereum-sdk/stake';
import type { TransactionCallback } from '@lidofinance/lido-ethereum-sdk/core';

import type { TxFlowArgs } from 'modules/web3/hooks/tx-flow/types';
import { wethABI } from 'abi/weth-abi';
import { TOKENS_TO_STAKE } from 'features/stake/shared/types';
import {
  aaSendCalls,
  expectOrdered,
  legacyPerformTransaction,
  renderHook,
  sentAACalls,
} from 'features/stake/shared/__tests__/stake-test-utils';

// Referenced from the hoisted mock factories, so hoisted with them
const { ACCOUNT, FALLBACK_REFERRAL, WETH } = vi.hoisted(() => ({
  ACCOUNT: '0x00000000000000000000000000000000000000aa' as const,
  FALLBACK_REFERRAL: '0x00000000000000000000000000000000000000fb' as const,
  WETH: '0x00000000000000000000000000000000000000Ee' as const,
}));
const REFERRAL: Address = '0x00000000000000000000000000000000000000bb';
const STETH = getAddress('0x00000000000000000000000000000000000000ab');
const TX_HASH: Hash =
  '0x1111111111111111111111111111111111111111111111111111111111111111';
const CALL_ID = '0xcall';

const P = 10n ** 18n;
const AMOUNT = 2n * P;
const BALANCE_BEFORE = 5n * P;
const BALANCE_AFTER = BALANCE_BEFORE + AMOUNT;

const { ETH, WETH: WETH_TOKEN } = TOKENS_TO_STAKE;

type StakeEthProps = {
  value: bigint;
  referralAddress: Address;
  callback: TransactionCallback;
};

const state = vi.hoisted(() => ({
  isAA: false,
  sdk: undefined as
    { stake: unknown; stETH: unknown; core: unknown } | undefined,
  sendAACalls: vi.fn(),
  txModalStages: {
    signUnwrap: vi.fn(),
    pendingUnwrap: vi.fn(),
    sign: vi.fn(),
    pending: vi.fn(),
    success: vi.fn(),
    successMultisig: vi.fn(),
    failed: vi.fn(),
  },
}));

vi.mock('modules/web3', async () => {
  const { runTxFlow } = await import('modules/web3/hooks/tx-flow/run-tx-flow');
  return {
    useDappStatus: () => ({ address: ACCOUNT }),
    useAA: () => ({ isAA: state.isAA }),
    useLidoSDK: () => state.sdk,
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
vi.mock('config', () => ({
  config: {
    enableQaHelpers: false,
    STAKE_GASLIMIT_FALLBACK: 150_000n,
    FALLBACK_REFERRAL_ADDRESS: FALLBACK_REFERRAL,
  },
  useConfig: () => ({
    externalConfig: { featureFlags: { holidayDecorEnabled: false } },
  }),
}));
vi.mock('config/networks/token-address', () => ({
  getTokenAddress: () => WETH,
}));
vi.mock('utils/track-matomo-event', () => ({ trackMatomoEvent: vi.fn() }));
vi.mock('../hooks/use-bells', () => ({
  useBells: () => ({ bells: vi.fn() }),
}));
vi.mock('../hooks/use-tx-modal-stages-stake', () => ({
  useTxModalStagesStake: () => ({ txModalStages: state.txModalStages }),
}));

import { useStake } from '../use-stake';

// A stand-in for the SDK stake module: the same performTransaction stage
// sequence and wallet client as the WETH unwrap, so both transactions are
// observable on one mock in order
const stakeEthPopulateTx = vi.fn(async () => {
  throw new Error('insufficient funds for gas * price + value');
});

const createSdk = (
  performTransaction: ReturnType<typeof legacyPerformTransaction>,
) => {
  const walletClient = {
    writeContract: vi.fn(async (_params: object) => TX_HASH),
  };
  const publicClient = { estimateContractGas: vi.fn(async () => 50_000n) };
  const stethBalance = vi
    .fn()
    .mockResolvedValueOnce(BALANCE_BEFORE)
    .mockResolvedValueOnce(BALANCE_AFTER);
  const core = {
    chainId: 1,
    publicClient,
    rpcProvider: publicClient,
    useWalletClient: () => walletClient,
    performTransaction,
  };
  const stake = {
    core,
    // Must never be reached: it estimates `submit` with the full value, which
    // a node rejects for a WETH stake until the unwrap has landed
    stakeEthPopulateTx,
    stakeEth: async ({ value, referralAddress, callback }: StakeEthProps) =>
      performTransaction({
        account: { address: ACCOUNT },
        callback,
        getGasLimit: async () => 150_000n,
        sendTransaction: (options: object) =>
          walletClient.writeContract({
            address: STETH,
            functionName: 'submit',
            args: [referralAddress],
            value,
            ...options,
          }),
      }),
  };
  state.sdk = {
    stake,
    stETH: { balance: stethBalance, contractAddress: async () => STETH },
    core,
  };
  return { walletClient };
};

const unwrapCall = expect.objectContaining({
  address: WETH,
  functionName: 'withdraw',
  args: [AMOUNT],
});
const submitCall = (referral: Address = REFERRAL) =>
  expect.objectContaining({
    address: STETH,
    functionName: 'submit',
    args: [getAddress(referral)],
    value: AMOUNT,
  });

const decodeSubmit = (data: Hash) => {
  const decoded = decodeFunctionData({ abi: StethAbi, data });
  expect(decoded.functionName).toBe('submit');
  return decoded.args as readonly [Address];
};
const decodeWithdraw = (data: Hash) => {
  const decoded = decodeFunctionData({ abi: wethABI, data });
  expect(decoded.functionName).toBe('withdraw');
  return decoded.args as readonly [bigint];
};

const onConfirm = vi.fn();
const onRetry = vi.fn();
const onUnwrapped = vi.fn();

const stake = (token: TOKENS_TO_STAKE, referral: Address | null = REFERRAL) =>
  renderHook(() => useStake({ onConfirm, onRetry, onUnwrapped }))({
    amount: AMOUNT,
    token,
    referral,
  });

const consoleWarnSpy = vi
  .spyOn(console, 'warn')
  .mockImplementation(() => undefined);

beforeEach(() => {
  vi.clearAllMocks();
  state.isAA = false;
});
afterAll(() => {
  consoleWarnSpy.mockRestore();
});

describe('useStake', () => {
  describe('legacy signing, ETH', () => {
    it('submits the ETH and reports success', async () => {
      const { walletClient } = createSdk(legacyPerformTransaction('success'));

      await expect(stake(ETH)).resolves.toBe(true);

      expect(walletClient.writeContract).toHaveBeenCalledTimes(1);
      expect(walletClient.writeContract).toHaveBeenCalledWith(submitCall());
      expect(state.txModalStages.sign).toHaveBeenCalledWith(AMOUNT, ETH);
      expect(state.txModalStages.pending).toHaveBeenCalledWith(
        AMOUNT,
        ETH,
        TX_HASH,
        false,
      );
      expect(state.txModalStages.signUnwrap).not.toHaveBeenCalled();
      expect(onUnwrapped).not.toHaveBeenCalled();
      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(state.txModalStages.success).toHaveBeenCalledWith(
        BALANCE_AFTER,
        BALANCE_BEFORE,
        TX_HASH,
      );
      expect(state.txModalStages.failed).not.toHaveBeenCalled();
    });

    it('falls back to the configured referral when none is given', async () => {
      const { walletClient } = createSdk(legacyPerformTransaction('success'));

      await stake(ETH, null);

      expect(walletClient.writeContract).toHaveBeenCalledWith(
        submitCall(FALLBACK_REFERRAL),
      );
    });

    it('reports a rejected signature and offers a retry', async () => {
      const { walletClient } = createSdk(legacyPerformTransaction('rejected'));

      await expect(stake(ETH)).resolves.toBe(false);

      expect(walletClient.writeContract).not.toHaveBeenCalled();
      expect(state.txModalStages.failed).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'User rejected the request' }),
        onRetry,
      );
      expect(onUnwrapped).not.toHaveBeenCalled();
      expect(onConfirm).not.toHaveBeenCalled();
      expect(state.txModalStages.success).not.toHaveBeenCalled();
    });

    it('reports a multisig proposal without waiting for a receipt', async () => {
      createSdk(legacyPerformTransaction('multisig'));

      await expect(stake(ETH)).resolves.toBe(true);

      expect(state.txModalStages.successMultisig).toHaveBeenCalledTimes(1);
      expect(state.txModalStages.success).not.toHaveBeenCalled();
      expect(onConfirm).not.toHaveBeenCalled();
    });
  });

  describe('legacy signing, WETH', () => {
    it('unwraps and then submits as two transactions', async () => {
      const { walletClient } = createSdk(
        legacyPerformTransaction('success', 'success'),
      );

      await expect(stake(WETH_TOKEN)).resolves.toBe(true);

      expect(walletClient.writeContract).toHaveBeenCalledTimes(2);
      expect(walletClient.writeContract).toHaveBeenNthCalledWith(1, unwrapCall);
      expect(walletClient.writeContract).toHaveBeenNthCalledWith(
        2,
        submitCall(),
      );
      expect(state.txModalStages.signUnwrap).toHaveBeenCalledWith(AMOUNT);
      expect(state.txModalStages.pendingUnwrap).toHaveBeenCalledWith(
        AMOUNT,
        TX_HASH,
      );
      expect(state.txModalStages.sign).toHaveBeenCalledWith(AMOUNT, WETH_TOKEN);
      expect(state.txModalStages.pending).toHaveBeenCalledWith(
        AMOUNT,
        WETH_TOKEN,
        TX_HASH,
        false,
      );
      expectOrdered(
        state.txModalStages.signUnwrap,
        state.txModalStages.pendingUnwrap,
        state.txModalStages.sign,
        state.txModalStages.pending,
        state.txModalStages.success,
      );
      // the stake went through, so the form keeps WETH selected
      expect(onUnwrapped).not.toHaveBeenCalled();
      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(state.txModalStages.success).toHaveBeenCalledWith(
        BALANCE_AFTER,
        BALANCE_BEFORE,
        TX_HASH,
      );
      expect(state.txModalStages.failed).not.toHaveBeenCalled();
    });

    it('stops at a rejected unwrap', async () => {
      const { walletClient } = createSdk(legacyPerformTransaction('rejected'));

      await expect(stake(WETH_TOKEN)).resolves.toBe(false);

      expect(walletClient.writeContract).not.toHaveBeenCalled();
      expect(state.txModalStages.signUnwrap).toHaveBeenCalledTimes(1);
      expect(state.txModalStages.sign).not.toHaveBeenCalled();
      expect(state.txModalStages.failed).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'User rejected the request' }),
        onRetry,
      );
      // nothing was unwrapped: the funds are still WETH
      expect(onUnwrapped).not.toHaveBeenCalled();
      expect(onConfirm).not.toHaveBeenCalled();
      expect(state.txModalStages.success).not.toHaveBeenCalled();
    });

    it('recovers to ETH when the stake is rejected after a confirmed unwrap', async () => {
      const { walletClient } = createSdk(
        legacyPerformTransaction('success', 'rejected'),
      );

      await expect(stake(WETH_TOKEN)).resolves.toBe(false);

      expect(walletClient.writeContract).toHaveBeenCalledTimes(1);
      expect(walletClient.writeContract).toHaveBeenCalledWith(unwrapCall);
      // the funds are ETH now: the form switches token and refreshes balances
      expect(onUnwrapped).toHaveBeenCalledTimes(1);
      expect(onConfirm).toHaveBeenCalledTimes(1);
      expectOrdered(onUnwrapped, onConfirm, state.txModalStages.failed);
      expect(state.txModalStages.failed).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'User rejected the request' }),
        onRetry,
      );
      expect(state.txModalStages.success).not.toHaveBeenCalled();
    });

    it('recovers to ETH when the stake reverts after a confirmed unwrap', async () => {
      createSdk(legacyPerformTransaction('success', 'reverted'));

      await expect(stake(WETH_TOKEN)).resolves.toBe(false);

      expect(onUnwrapped).toHaveBeenCalledTimes(1);
      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(state.txModalStages.failed).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'TRANSACTION_REVERTED' }),
        onRetry,
      );
      expect(state.txModalStages.success).not.toHaveBeenCalled();
    });

    it('proposes both transactions to a multisig and reports once', async () => {
      const { walletClient } = createSdk(
        legacyPerformTransaction('multisig', 'multisig'),
      );

      await expect(stake(WETH_TOKEN)).resolves.toBe(true);

      expect(walletClient.writeContract).toHaveBeenCalledTimes(2);
      expect(state.txModalStages.successMultisig).toHaveBeenCalledTimes(1);
      expect(state.txModalStages.success).not.toHaveBeenCalled();
      expect(state.txModalStages.failed).not.toHaveBeenCalled();
      // a proposal is not a confirmed unwrap
      expect(onUnwrapped).not.toHaveBeenCalled();
    });
  });

  describe('EIP-5792 signing', () => {
    beforeEach(() => {
      state.isAA = true;
    });

    it('sends a single submit call carrying the ETH value', async () => {
      const performTransaction = legacyPerformTransaction('success');
      const { walletClient } = createSdk(performTransaction);
      const sendCalls = aaSendCalls({ callId: CALL_ID, txHash: TX_HASH });
      state.sendAACalls.mockImplementation(sendCalls);

      await expect(stake(ETH)).resolves.toBe(true);

      expect(performTransaction).not.toHaveBeenCalled();
      expect(walletClient.writeContract).not.toHaveBeenCalled();
      const calls = sentAACalls(sendCalls);
      expect(calls).toHaveLength(1);
      expect(calls[0]?.to).toBe(STETH);
      expect(calls[0]?.value).toBe(AMOUNT);
      expect(decodeSubmit(calls[0]?.data as Hash)).toEqual([
        getAddress(REFERRAL),
      ]);
      expect(state.txModalStages.sign).toHaveBeenCalledWith(AMOUNT, ETH);
      expect(state.txModalStages.pending).toHaveBeenCalledWith(
        AMOUNT,
        ETH,
        CALL_ID,
        true,
      );
      expect(state.txModalStages.success).toHaveBeenCalledWith(
        BALANCE_AFTER,
        BALANCE_BEFORE,
        TX_HASH,
      );
    });

    it('batches the unwrap with the submit', async () => {
      const performTransaction = legacyPerformTransaction('success');
      createSdk(performTransaction);
      const sendCalls = aaSendCalls({ callId: CALL_ID, txHash: TX_HASH });
      state.sendAACalls.mockImplementation(sendCalls);

      await expect(stake(WETH_TOKEN)).resolves.toBe(true);

      expect(performTransaction).not.toHaveBeenCalled();
      const calls = sentAACalls(sendCalls);
      expect(calls).toHaveLength(2);
      expect(calls[0]?.to).toBe(WETH);
      expect(calls[0]?.value ?? 0n).toBe(0n);
      expect(decodeWithdraw(calls[0]?.data as Hash)).toEqual([AMOUNT]);
      expect(calls[1]?.to).toBe(STETH);
      expect(calls[1]?.value).toBe(AMOUNT);
      expect(decodeSubmit(calls[1]?.data as Hash)).toEqual([
        getAddress(REFERRAL),
      ]);
      // one signature covers both calls: no separate unwrap stage
      expect(state.txModalStages.signUnwrap).not.toHaveBeenCalled();
      expect(state.txModalStages.pendingUnwrap).not.toHaveBeenCalled();
      expect(state.txModalStages.sign).toHaveBeenCalledWith(AMOUNT, WETH_TOKEN);
      expect(state.txModalStages.pending).toHaveBeenCalledWith(
        AMOUNT,
        WETH_TOKEN,
        CALL_ID,
        true,
      );
      expect(onUnwrapped).not.toHaveBeenCalled();
      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(state.txModalStages.success).toHaveBeenCalledWith(
        BALANCE_AFTER,
        BALANCE_BEFORE,
        TX_HASH,
      );
    });

    it('keeps WETH selected when the batch is rejected', async () => {
      const { walletClient } = createSdk(legacyPerformTransaction('success'));
      const rejected = new Error('User rejected the request');
      state.sendAACalls.mockImplementation(
        aaSendCalls({ callId: CALL_ID, txHash: TX_HASH, failWith: rejected }),
      );

      await expect(stake(WETH_TOKEN)).resolves.toBe(false);

      expect(walletClient.writeContract).not.toHaveBeenCalled();
      expect(state.txModalStages.failed).toHaveBeenCalledWith(
        rejected,
        onRetry,
      );
      // the batch is atomic: nothing was unwrapped
      expect(onUnwrapped).not.toHaveBeenCalled();
      expect(onConfirm).not.toHaveBeenCalled();
      expect(state.txModalStages.success).not.toHaveBeenCalled();
    });
  });
});

describe('stake call construction', () => {
  it('never estimates the stake up front: the ETH of a WETH stake only exists after the unwrap', async () => {
    createSdk(legacyPerformTransaction('success', 'success'));
    await expect(stake(WETH_TOKEN)).resolves.toBe(true);
    expect(stakeEthPopulateTx).not.toHaveBeenCalled();

    state.isAA = true;
    createSdk(legacyPerformTransaction());
    state.sendAACalls.mockImplementation(
      aaSendCalls({ callId: CALL_ID, txHash: TX_HASH }),
    );
    await expect(stake(WETH_TOKEN)).resolves.toBe(true);
    expect(stakeEthPopulateTx).not.toHaveBeenCalled();
    const [, stakeCall] = sentAACalls(state.sendAACalls);
    expect(stakeCall).toEqual({
      to: STETH,
      data: encodeFunctionData({
        abi: StethAbi,
        functionName: 'submit',
        args: [REFERRAL],
      }),
      value: AMOUNT,
    });
  });
});
