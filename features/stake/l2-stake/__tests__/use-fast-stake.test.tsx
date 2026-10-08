import { renderToStaticMarkup } from 'react-dom/server';
import {
  decodeFunctionData,
  getAddress,
  zeroAddress,
  type Address,
  type Hash,
  type TransactionReceipt,
} from 'viem';
import {
  CHAINS,
  LIDO_L2_CONTRACT_ADDRESSES,
} from '@lidofinance/lido-ethereum-sdk/common';
import {
  TransactionCallbackStage,
  type LidoSDKCore,
  type TransactionCallback,
} from '@lidofinance/lido-ethereum-sdk/core';

import type { AACall, TxFlowArgs } from 'modules/web3/hooks/tx-flow/types';
import {
  L2StakeModule,
  calcFastStakeWstethByEth,
} from 'modules/l2-staking/l2-staking-module';
import { L2_STAKING_RECEIVER_ABI } from 'modules/l2-staking/l2-staking-abi';

// Referenced from the hoisted mock factories, so hoisted with them
const { ACCOUNT, FALLBACK_REFERRAL } = vi.hoisted(() => ({
  ACCOUNT: '0x00000000000000000000000000000000000000aa' as const,
  FALLBACK_REFERRAL: '0x00000000000000000000000000000000000000fb' as const,
}));
const REFERRAL: Address = '0x00000000000000000000000000000000000000bb';
const POOL: Address = '0x00000000000000000000000000000000000000cc';
const FEED: Address = '0x00000000000000000000000000000000000000dd';
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

type PerformTransactionProps = {
  account: { address: Address };
  callback: TransactionCallback;
  getGasLimit: (options: object) => Promise<bigint>;
  sendTransaction: (options: object) => Promise<Hash>;
};

const state = vi.hoisted(() => ({
  isAA: false,
  l2Stake: undefined as L2StakeModule | undefined,
  wstethBalance: vi.fn(),
  sendAACalls: vi.fn(),
  txModalStages: {
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

// Hooks run during a server render; the returned callback is then driven
// outside of React like the form submit would
const renderHook = <T,>(useHook: () => T): T => {
  let value: T | undefined;
  const Probe = () => {
    value = useHook();
    return null;
  };
  renderToStaticMarkup(<Probe />);
  return value as T;
};

type LegacyOutcome = 'success' | 'reverted' | 'rejected' | 'multisig';

// Mirrors the SDK's performTransaction stage sequence for each outcome
const legacyPerformTransaction = (outcome: LegacyOutcome) =>
  vi.fn(async (props: PerformTransactionProps) => {
    const { callback, getGasLimit, sendTransaction, account } = props;
    const gas = await getGasLimit({ account });
    await callback({ stage: TransactionCallbackStage.SIGN, payload: gas });
    if (outcome === 'rejected') throw new Error('User rejected the request');
    const hash = await sendTransaction({ account, gas });
    if (outcome === 'multisig') {
      await callback({ stage: TransactionCallbackStage.MULTISIG_DONE });
      return { hash };
    }
    await callback({ stage: TransactionCallbackStage.RECEIPT, payload: hash });
    const receipt = {
      status: outcome === 'reverted' ? 'reverted' : 'success',
      transactionHash: hash,
    } as unknown as TransactionReceipt;
    await callback({
      stage: TransactionCallbackStage.CONFIRMATION,
      payload: receipt,
    });
    await callback({ stage: TransactionCallbackStage.DONE, payload: 0n });
    return { hash };
  });

const createModule = (
  performTransaction: ReturnType<typeof legacyPerformTransaction>,
) => {
  const reads: Record<string, unknown> = {
    getOraclePool: POOL,
    getOracle: FEED,
    getFee: FEE,
    getLatestAnswer: PRICE,
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
  return {
    module: new L2StakeModule({ core: core as unknown as LidoSDKCore }),
    walletClient,
  };
};

const decodeFastStake = (data: Hash) => {
  const decoded = decodeFunctionData({ abi: L2_STAKING_RECEIVER_ABI, data });
  expect(decoded.functionName).toBe('fastStakeReferral');
  return decoded.args as readonly [Address, bigint, bigint, Address];
};

const onConfirm = vi.fn();
const onRetry = vi.fn();
const stake = () => renderHook(() => useL2FastStake({ onConfirm, onRetry }));

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
  describe('legacy signing', () => {
    it('stakes ETH for the quoted wstETH and reports success', async () => {
      const performTransaction = legacyPerformTransaction('success');
      const { module, walletClient } = createModule(performTransaction);
      state.l2Stake = module;

      await expect(
        stake()({ amount: AMOUNT, referral: REFERRAL }),
      ).resolves.toBe(true);

      expect(walletClient.writeContract).toHaveBeenCalledWith(
        expect.objectContaining({
          address: RECEIVER,
          functionName: 'fastStakeReferral',
          args: [zeroAddress, AMOUNT, MIN_RECEIVE, getAddress(REFERRAL)],
          value: AMOUNT,
        }),
      );
      expect(state.txModalStages.sign).toHaveBeenCalledWith(
        AMOUNT,
        MIN_RECEIVE,
      );
      expect(state.txModalStages.pending).toHaveBeenCalledWith(
        AMOUNT,
        TX_HASH,
        false,
      );
      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(state.txModalStages.success).toHaveBeenCalledWith(
        BALANCE_AFTER,
        BALANCE_BEFORE,
        TX_HASH,
      );
      expect(state.txModalStages.failed).not.toHaveBeenCalled();
    });

    it('falls back to the configured referral when none is given', async () => {
      const { module, walletClient } = createModule(
        legacyPerformTransaction('success'),
      );
      state.l2Stake = module;

      await stake()({ amount: AMOUNT, referral: null });

      expect(walletClient.writeContract).toHaveBeenCalledWith(
        expect.objectContaining({
          args: [
            zeroAddress,
            AMOUNT,
            MIN_RECEIVE,
            getAddress(FALLBACK_REFERRAL),
          ],
        }),
      );
    });

    it('reports a rejected signature and offers a retry', async () => {
      const { module, walletClient } = createModule(
        legacyPerformTransaction('rejected'),
      );
      state.l2Stake = module;

      await expect(
        stake()({ amount: AMOUNT, referral: REFERRAL }),
      ).resolves.toBe(false);

      expect(walletClient.writeContract).not.toHaveBeenCalled();
      expect(state.txModalStages.failed).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'User rejected the request' }),
        onRetry,
      );
      expect(state.txModalStages.success).not.toHaveBeenCalled();
      expect(onConfirm).not.toHaveBeenCalled();
    });

    it('reports a reverted transaction as a failure', async () => {
      const { module } = createModule(legacyPerformTransaction('reverted'));
      state.l2Stake = module;

      await expect(
        stake()({ amount: AMOUNT, referral: REFERRAL }),
      ).resolves.toBe(false);

      expect(state.txModalStages.pending).toHaveBeenCalledWith(
        AMOUNT,
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
      const { module } = createModule(legacyPerformTransaction('multisig'));
      state.l2Stake = module;

      await expect(
        stake()({ amount: AMOUNT, referral: REFERRAL }),
      ).resolves.toBe(true);

      expect(state.txModalStages.successMultisig).toHaveBeenCalledTimes(1);
      expect(state.txModalStages.success).not.toHaveBeenCalled();
      expect(state.txModalStages.failed).not.toHaveBeenCalled();
      expect(onConfirm).not.toHaveBeenCalled();
    });
  });

  describe('EIP-5792 signing', () => {
    beforeEach(() => {
      state.isAA = true;
    });

    it('sends a single receiver call carrying the ETH value', async () => {
      const performTransaction = legacyPerformTransaction('success');
      const { module, walletClient } = createModule(performTransaction);
      state.l2Stake = module;
      let calls: AACall[] = [];
      state.sendAACalls.mockImplementation(
        async (
          sentCalls: AACall[],
          callback: (props: {
            stage: TransactionCallbackStage;
            callId?: string;
            txHash?: Hash;
          }) => Promise<void>,
        ) => {
          calls = sentCalls;
          await callback({ stage: TransactionCallbackStage.SIGN });
          await callback({
            stage: TransactionCallbackStage.RECEIPT,
            callId: CALL_ID,
          });
          await callback({
            stage: TransactionCallbackStage.DONE,
            txHash: TX_HASH,
          });
        },
      );

      await expect(
        stake()({ amount: AMOUNT, referral: REFERRAL }),
      ).resolves.toBe(true);

      expect(performTransaction).not.toHaveBeenCalled();
      expect(walletClient.writeContract).not.toHaveBeenCalled();
      expect(calls).toHaveLength(1);
      const [call] = calls;
      expect(call?.to).toBe(RECEIVER);
      expect(call?.value).toBe(AMOUNT);
      expect(decodeFastStake(call?.data as Hash)).toEqual([
        zeroAddress,
        AMOUNT,
        MIN_RECEIVE,
        getAddress(REFERRAL),
      ]);
      expect(state.txModalStages.sign).toHaveBeenCalledWith(
        AMOUNT,
        MIN_RECEIVE,
      );
      expect(state.txModalStages.pending).toHaveBeenCalledWith(
        AMOUNT,
        CALL_ID,
        true,
      );
      expect(state.txModalStages.success).toHaveBeenCalledWith(
        BALANCE_AFTER,
        BALANCE_BEFORE,
        TX_HASH,
      );
    });

    it('reports a rejected batch and offers a retry', async () => {
      const { module } = createModule(legacyPerformTransaction('success'));
      state.l2Stake = module;
      const rejected = new Error('User rejected the request');
      state.sendAACalls.mockImplementation(
        async (
          _calls: AACall[],
          callback: (props: {
            stage: TransactionCallbackStage;
            error?: unknown;
          }) => Promise<void>,
        ) => {
          await callback({ stage: TransactionCallbackStage.SIGN });
          await callback({
            stage: TransactionCallbackStage.ERROR,
            error: rejected,
          });
          throw rejected;
        },
      );

      await expect(
        stake()({ amount: AMOUNT, referral: REFERRAL }),
      ).resolves.toBe(false);

      expect(state.txModalStages.failed).toHaveBeenCalledWith(
        rejected,
        onRetry,
      );
      expect(state.txModalStages.success).not.toHaveBeenCalled();
    });
  });
});
