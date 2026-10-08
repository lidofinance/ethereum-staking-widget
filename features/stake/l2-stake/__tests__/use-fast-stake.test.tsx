import {
  decodeFunctionData,
  getAddress,
  zeroAddress,
  type Address,
  type Hash,
} from 'viem';
import {
  CHAINS,
  LIDO_L2_CONTRACT_ADDRESSES,
} from '@lidofinance/lido-ethereum-sdk/common';
import type { LidoSDKCore } from '@lidofinance/lido-ethereum-sdk/core';

import type { TxFlowArgs } from 'modules/web3/hooks/tx-flow/types';
import {
  L2StakeModule,
  calcFastStakeWstethByEth,
} from 'modules/l2-staking/l2-staking-module';
import { L2_STAKING_RECEIVER_ABI } from 'modules/l2-staking/l2-staking-abi';
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
const { ACCOUNT, FALLBACK_REFERRAL } = vi.hoisted(() => ({
  ACCOUNT: '0x00000000000000000000000000000000000000aa' as const,
  FALLBACK_REFERRAL: '0x00000000000000000000000000000000000000fb' as const,
}));
const REFERRAL: Address = '0x00000000000000000000000000000000000000bb';
const POOL: Address = '0x00000000000000000000000000000000000000cc';
const FEED: Address = '0x00000000000000000000000000000000000000dd';
const WETH = getAddress('0x00000000000000000000000000000000000000ee');
const RECEIVER = LIDO_L2_CONTRACT_ADDRESSES[CHAINS.Base]?.stakeReceiver;
const TX_HASH: Hash =
  '0x1111111111111111111111111111111111111111111111111111111111111111';
const CALL_ID = '0xcall';

const P = 10n ** 18n;
const FEE = 10n ** 15n;
const PRICE = 12n * 10n ** 17n;
const AMOUNT = 2n * P;
const MIN_RECEIVE = calcFastStakeWstethByEth(AMOUNT, FEE, PRICE);
const BALANCE_BEFORE = 5n * P;
const BALANCE_AFTER = BALANCE_BEFORE + MIN_RECEIVE;

const { ETH, WETH: WETH_TOKEN } = TOKENS_TO_STAKE;

const state = vi.hoisted(() => ({
  isAA: false,
  l2Stake: undefined as L2StakeModule | undefined,
  wstethBalance: vi.fn(),
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

vi.mock('modules/web3', async () => {
  const { runTxFlow } = await import('modules/web3/hooks/tx-flow/run-tx-flow');
  return {
    useDappStatus: () => ({ address: ACCOUNT }),
    useAA: () => ({ isAA: state.isAA }),
    useLidoSDK: () => ({ core: { publicClient: {} } }),
    useLidoSDKL2: () => ({
      l2Stake: state.l2Stake,
      l2: { wsteth: { balance: state.wstethBalance } },
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
vi.mock('config', () => ({
  config: {
    STAKE_GASLIMIT_FALLBACK: 150_000n,
    FALLBACK_REFERRAL_ADDRESS: FALLBACK_REFERRAL,
  },
  useConfig: () => ({
    externalConfig: { featureFlags: { holidayDecorEnabled: false } },
  }),
}));
vi.mock('features/stake/stake-form/hooks/use-bells', () => ({
  useBells: () => ({ bells: vi.fn() }),
}));
vi.mock('../hooks/use-tx-modal-stages-fast-stake', () => ({
  useTxModalStagesL2FastStake: () => ({ txModalStages: state.txModalStages }),
}));
vi.mock('../hooks/use-track-event', () => ({
  useTrackStakeEvent: () => vi.fn(),
}));

import { useL2FastStake } from '../hooks/use-fast-stake';

const createModule = (
  performTransaction: ReturnType<typeof legacyPerformTransaction>,
  { allowance = 0n } = {},
) => {
  const reads: Record<string, unknown> = {
    // the receiver's WETH allowance, read when the transaction is built
    allowance,
    getOraclePool: POOL,
    getOracle: FEED,
    getFee: FEE,
    getLatestAnswer: PRICE,
    // receiver constants: WETH is the receiver's WNATIVE
    TOKEN: zeroAddress,
    WNATIVE: WETH,
    MIN_PROCESS_MESSAGE_GAS: 0n,
    LINK_TOKEN: zeroAddress,
    CCIP_ROUTER: zeroAddress,
  };
  const publicClient = {
    readContract: vi.fn(async ({ functionName }: { functionName: string }) => {
      if (!(functionName in reads))
        throw new Error(`unexpected read: ${functionName}`);
      return reads[functionName];
    }),
    estimateContractGas: vi.fn(async () => 120_000n),
  };
  const walletClient = { writeContract: vi.fn(async () => TX_HASH) };
  const core = {
    chain: { id: CHAINS.Base },
    chainId: CHAINS.Base,
    logMode: 'none',
    keyedClient: { public: publicClient, wallet: walletClient },
    useAccount: vi.fn(async () => ({ address: ACCOUNT, type: 'json-rpc' })),
    useWalletClient: vi.fn(() => walletClient),
    performTransaction,
  };
  state.l2Stake = new L2StakeModule({ core: core as unknown as LidoSDKCore });
  // lets a test move the chain state between two stake calls
  const setAllowance = (value: bigint) => {
    reads.allowance = value;
  };
  return { walletClient, publicClient, setAllowance };
};

const allowanceRead = expect.objectContaining({ functionName: 'allowance' });

const decodeFastStake = (data: Hash) => {
  const decoded = decodeFunctionData({ abi: L2_STAKING_RECEIVER_ABI, data });
  expect(decoded.functionName).toBe('fastStakeReferral');
  return decoded.args as readonly [Address, bigint, bigint, Address];
};

const decodeApprove = (data: Hash) => {
  const decoded = decodeFunctionData({ abi: wethABI, data });
  expect(decoded.functionName).toBe('approve');
  return decoded.args as readonly [Address, bigint];
};

const approveCall = expect.objectContaining({
  address: WETH,
  functionName: 'approve',
  args: [RECEIVER, AMOUNT],
});
const stakeCall = (token: Address, referral: Address = REFERRAL) =>
  expect.objectContaining({
    address: RECEIVER,
    functionName: 'fastStakeReferral',
    args: [token, AMOUNT, MIN_RECEIVE, getAddress(referral)],
    value: token === zeroAddress ? AMOUNT : 0n,
  });

const onConfirm = vi.fn();
const onRetry = vi.fn();

const stake = (token: TOKENS_TO_STAKE, referral: Address | null = REFERRAL) =>
  renderHook(() => useL2FastStake({ onConfirm, onRetry }))({
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
  state.wstethBalance
    .mockReset()
    .mockResolvedValueOnce(BALANCE_BEFORE)
    .mockResolvedValueOnce(BALANCE_AFTER);
});
afterAll(() => {
  consoleWarnSpy.mockRestore();
});

describe('useL2FastStake', () => {
  describe('legacy signing, ETH', () => {
    it('stakes ETH for the quoted wstETH and reports success', async () => {
      const { walletClient, publicClient } = createModule(
        legacyPerformTransaction('success'),
      );

      await expect(stake(ETH)).resolves.toBe(true);

      expect(walletClient.writeContract).toHaveBeenCalledTimes(1);
      expect(walletClient.writeContract).toHaveBeenCalledWith(
        stakeCall(zeroAddress),
      );
      expect(state.txModalStages.sign).toHaveBeenCalledWith(
        AMOUNT,
        ETH,
        MIN_RECEIVE,
      );
      expect(state.txModalStages.pending).toHaveBeenCalledWith(
        AMOUNT,
        ETH,
        TX_HASH,
        false,
      );
      expect(state.txModalStages.signApproval).not.toHaveBeenCalled();
      // the allowance only matters for WETH
      expect(publicClient.readContract).not.toHaveBeenCalledWith(allowanceRead);
      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(state.txModalStages.success).toHaveBeenCalledWith(
        BALANCE_AFTER,
        BALANCE_BEFORE,
        TX_HASH,
      );
      expect(state.txModalStages.failed).not.toHaveBeenCalled();
    });

    it('falls back to the configured referral when none is given', async () => {
      const { walletClient } = createModule(
        legacyPerformTransaction('success'),
      );

      await stake(ETH, null);

      expect(walletClient.writeContract).toHaveBeenCalledWith(
        stakeCall(zeroAddress, FALLBACK_REFERRAL),
      );
    });

    it('reports a rejected signature and offers a retry', async () => {
      const { walletClient } = createModule(
        legacyPerformTransaction('rejected'),
      );

      await expect(stake(ETH)).resolves.toBe(false);

      expect(walletClient.writeContract).not.toHaveBeenCalled();
      expect(state.txModalStages.failed).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'User rejected the request' }),
        onRetry,
      );
      expect(state.txModalStages.success).not.toHaveBeenCalled();
      expect(onConfirm).not.toHaveBeenCalled();
    });

    it('reports a reverted transaction as a failure', async () => {
      createModule(legacyPerformTransaction('reverted'));

      await expect(stake(ETH)).resolves.toBe(false);

      expect(state.txModalStages.pending).toHaveBeenCalledWith(
        AMOUNT,
        ETH,
        TX_HASH,
        false,
      );
      expect(state.txModalStages.failed).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'TRANSACTION_REVERTED' }),
        onRetry,
      );
      expect(state.txModalStages.success).not.toHaveBeenCalled();
      expect(onConfirm).not.toHaveBeenCalled();
    });

    it('reports a multisig proposal without waiting for a receipt', async () => {
      createModule(legacyPerformTransaction('multisig'));

      await expect(stake(ETH)).resolves.toBe(true);

      expect(state.txModalStages.successMultisig).toHaveBeenCalledTimes(1);
      expect(state.txModalStages.success).not.toHaveBeenCalled();
      expect(state.txModalStages.failed).not.toHaveBeenCalled();
      expect(onConfirm).not.toHaveBeenCalled();
    });
  });

  describe('legacy signing, WETH', () => {
    it('approves and then stakes as two transactions when the allowance is short', async () => {
      const { walletClient, publicClient } = createModule(
        legacyPerformTransaction('success', 'success'),
        { allowance: AMOUNT - 1n },
      );

      await expect(stake(WETH_TOKEN)).resolves.toBe(true);

      expect(publicClient.readContract).toHaveBeenCalledWith(allowanceRead);
      expect(walletClient.writeContract).toHaveBeenCalledTimes(2);
      expect(walletClient.writeContract).toHaveBeenNthCalledWith(
        1,
        approveCall,
      );
      expect(walletClient.writeContract).toHaveBeenNthCalledWith(
        2,
        stakeCall(WETH),
      );

      expect(state.txModalStages.signApproval).toHaveBeenCalledWith(AMOUNT);
      expect(state.txModalStages.pendingApproval).toHaveBeenCalledWith(
        AMOUNT,
        TX_HASH,
      );
      expect(state.txModalStages.sign).toHaveBeenCalledWith(
        AMOUNT,
        WETH_TOKEN,
        MIN_RECEIVE,
      );
      expect(state.txModalStages.pending).toHaveBeenCalledWith(
        AMOUNT,
        WETH_TOKEN,
        TX_HASH,
        false,
      );
      expectOrdered(
        state.txModalStages.signApproval,
        state.txModalStages.pendingApproval,
        state.txModalStages.sign,
        state.txModalStages.pending,
        state.txModalStages.success,
      );
      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(state.txModalStages.success).toHaveBeenCalledWith(
        BALANCE_AFTER,
        BALANCE_BEFORE,
        TX_HASH,
      );
      expect(state.txModalStages.failed).not.toHaveBeenCalled();
    });

    it('skips the approval when the allowance covers the amount', async () => {
      const { walletClient } = createModule(
        legacyPerformTransaction('success'),
        { allowance: AMOUNT },
      );

      await expect(stake(WETH_TOKEN)).resolves.toBe(true);

      expect(walletClient.writeContract).toHaveBeenCalledTimes(1);
      expect(walletClient.writeContract).toHaveBeenCalledWith(stakeCall(WETH));
      expect(state.txModalStages.signApproval).not.toHaveBeenCalled();
      expect(state.txModalStages.success).toHaveBeenCalledTimes(1);
    });

    it('stops at a rejected approval', async () => {
      const { walletClient } = createModule(
        legacyPerformTransaction('rejected'),
      );

      await expect(stake(WETH_TOKEN)).resolves.toBe(false);

      expect(walletClient.writeContract).not.toHaveBeenCalled();
      expect(state.txModalStages.signApproval).toHaveBeenCalledTimes(1);
      expect(state.txModalStages.sign).not.toHaveBeenCalled();
      expect(state.txModalStages.failed).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'User rejected the request' }),
        onRetry,
      );
      expect(state.txModalStages.success).not.toHaveBeenCalled();
    });

    it('does not approve again when retried after a confirmed approval', async () => {
      const { walletClient, setAllowance } = createModule(
        legacyPerformTransaction('success', 'rejected', 'success'),
      );

      await expect(stake(WETH_TOKEN)).resolves.toBe(false);

      expect(walletClient.writeContract).toHaveBeenCalledTimes(1);
      expect(walletClient.writeContract).toHaveBeenCalledWith(approveCall);
      expect(state.txModalStages.failed).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'User rejected the request' }),
        onRetry,
      );
      expect(state.txModalStages.success).not.toHaveBeenCalled();
      expect(onConfirm).not.toHaveBeenCalled();

      // the approval is on chain: the retry reads it while building the stake
      setAllowance(AMOUNT);
      walletClient.writeContract.mockClear();
      state.txModalStages.signApproval.mockClear();
      state.wstethBalance
        .mockReset()
        .mockResolvedValueOnce(BALANCE_BEFORE)
        .mockResolvedValueOnce(BALANCE_AFTER);

      await expect(stake(WETH_TOKEN)).resolves.toBe(true);

      expect(walletClient.writeContract).toHaveBeenCalledTimes(1);
      expect(walletClient.writeContract).toHaveBeenCalledWith(stakeCall(WETH));
      expect(state.txModalStages.signApproval).not.toHaveBeenCalled();
      expect(state.txModalStages.success).toHaveBeenCalledTimes(1);
    });

    it('reports a reverted stake after a confirmed approval', async () => {
      createModule(legacyPerformTransaction('success', 'reverted'));

      await expect(stake(WETH_TOKEN)).resolves.toBe(false);

      expect(state.txModalStages.pendingApproval).toHaveBeenCalledTimes(1);
      expect(state.txModalStages.failed).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'TRANSACTION_REVERTED' }),
        onRetry,
      );
      expect(state.txModalStages.success).not.toHaveBeenCalled();
    });

    it('proposes both transactions to a multisig and reports once', async () => {
      const { walletClient } = createModule(
        legacyPerformTransaction('multisig', 'multisig'),
      );

      await expect(stake(WETH_TOKEN)).resolves.toBe(true);

      expect(walletClient.writeContract).toHaveBeenCalledTimes(2);
      expect(state.txModalStages.successMultisig).toHaveBeenCalledTimes(1);
      expect(state.txModalStages.success).not.toHaveBeenCalled();
      expect(state.txModalStages.failed).not.toHaveBeenCalled();
    });
  });

  describe('EIP-5792 signing', () => {
    beforeEach(() => {
      state.isAA = true;
    });

    it('sends a single receiver call carrying the ETH value', async () => {
      const performTransaction = legacyPerformTransaction('success');
      const { walletClient } = createModule(performTransaction);
      const sendCalls = aaSendCalls({ callId: CALL_ID, txHash: TX_HASH });
      state.sendAACalls.mockImplementation(sendCalls);

      await expect(stake(ETH)).resolves.toBe(true);

      expect(performTransaction).not.toHaveBeenCalled();
      expect(walletClient.writeContract).not.toHaveBeenCalled();
      const calls = sentAACalls(sendCalls);
      expect(calls).toHaveLength(1);
      expect(calls[0]?.to).toBe(RECEIVER);
      expect(calls[0]?.value).toBe(AMOUNT);
      expect(decodeFastStake(calls[0]?.data as Hash)).toEqual([
        zeroAddress,
        AMOUNT,
        MIN_RECEIVE,
        getAddress(REFERRAL),
      ]);
      expect(state.txModalStages.sign).toHaveBeenCalledWith(
        AMOUNT,
        ETH,
        MIN_RECEIVE,
      );
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

    it('batches the approval with the WETH stake', async () => {
      const performTransaction = legacyPerformTransaction('success');
      createModule(performTransaction);
      const sendCalls = aaSendCalls({ callId: CALL_ID, txHash: TX_HASH });
      state.sendAACalls.mockImplementation(sendCalls);

      await expect(stake(WETH_TOKEN)).resolves.toBe(true);

      expect(performTransaction).not.toHaveBeenCalled();
      const calls = sentAACalls(sendCalls);
      expect(calls).toHaveLength(2);
      expect(calls[0]?.to).toBe(WETH);
      expect(calls[0]?.value ?? 0n).toBe(0n);
      expect(decodeApprove(calls[0]?.data as Hash)).toEqual([RECEIVER, AMOUNT]);
      expect(calls[1]?.to).toBe(RECEIVER);
      expect(calls[1]?.value).toBe(0n);
      expect(decodeFastStake(calls[1]?.data as Hash)).toEqual([
        WETH,
        AMOUNT,
        MIN_RECEIVE,
        getAddress(REFERRAL),
      ]);
      // one signature covers both calls: no separate approval stage
      expect(state.txModalStages.signApproval).not.toHaveBeenCalled();
      expect(state.txModalStages.pendingApproval).not.toHaveBeenCalled();
      expect(state.txModalStages.sign).toHaveBeenCalledWith(
        AMOUNT,
        WETH_TOKEN,
        MIN_RECEIVE,
      );
      expect(state.txModalStages.pending).toHaveBeenCalledWith(
        AMOUNT,
        WETH_TOKEN,
        CALL_ID,
        true,
      );
      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(state.txModalStages.success).toHaveBeenCalledWith(
        BALANCE_AFTER,
        BALANCE_BEFORE,
        TX_HASH,
      );
    });

    it('sends only the stake when the allowance already covers the amount', async () => {
      createModule(legacyPerformTransaction('success'), {
        allowance: AMOUNT,
      });
      const sendCalls = aaSendCalls({ callId: CALL_ID, txHash: TX_HASH });
      state.sendAACalls.mockImplementation(sendCalls);

      await expect(stake(WETH_TOKEN)).resolves.toBe(true);

      const calls = sentAACalls(sendCalls);
      expect(calls).toHaveLength(1);
      expect(calls[0]?.to).toBe(RECEIVER);
      expect(decodeFastStake(calls[0]?.data as Hash)[0]).toBe(WETH);
    });

    it('reports a rejected batch and offers a retry', async () => {
      const { walletClient } = createModule(
        legacyPerformTransaction('success'),
      );
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
      expect(state.txModalStages.success).not.toHaveBeenCalled();
      expect(onConfirm).not.toHaveBeenCalled();
    });
  });
});
