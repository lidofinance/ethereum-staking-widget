import {
  decodeFunctionData,
  encodeAbiParameters,
  encodeEventTopics,
  getAddress,
  zeroAddress,
  type Address,
  type Hash,
  type Hex,
} from 'viem';
import {
  CHAINS,
  LIDO_L2_CONTRACT_ADDRESSES,
} from '@lidofinance/lido-ethereum-sdk/common';
import {
  TransactionCallbackStage,
  type LidoSDKCore,
} from '@lidofinance/lido-ethereum-sdk/core';

import type { TxFlowArgs } from 'modules/web3/hooks/tx-flow/types';
import { L2StakeModule, L2_STAKING_RECEIVER_ABI } from 'modules/l2-staking';
import {
  CCIP_ETHEREUM_CHAIN_SELECTOR,
  applySlowStakeMaxFeeBuffer,
  encodeFeeOtoD,
  LIDO_L2_SLOW_STAKE_LANES,
} from 'modules/l2-staking';
import { TOKENS_TO_STAKE } from 'features/stake/shared/types';
import { QuoteMismatchError, StakeLimitError } from 'modules/web3/utils';
import {
  aaSendCalls,
  legacyPerformTransaction,
  renderHook,
  sentAACalls,
} from 'features/stake/shared/__tests__/stake-test-utils';

const { ACCOUNT } = vi.hoisted(() => ({
  ACCOUNT: '0x00000000000000000000000000000000000000aa' as const,
}));
const WETH = getAddress('0x00000000000000000000000000000000000000ee');
const CCIP_ROUTER: Address = '0x00000000000000000000000000000000000000f2';
const CCIP_ONRAMP: Address = '0x00000000000000000000000000000000000000f3';
const CCIP_POOL: Address = '0x00000000000000000000000000000000000000f4';
const L1_RECEIVER_BYTES = encodeAbiParameters(
  [{ type: 'address' }],
  ['0x6F357d53d6bE3238180316BA5F8f11467e164588'],
);
const RECEIVER = LIDO_L2_CONTRACT_ADDRESSES[CHAINS.Base]?.stakeReceiver;
const MESSAGE_ID: Hash =
  '0xf50ff3791ba99db683b51a711436712b130ace8cb0f42789850b5f3cdc56cd5e';
const TX_HASH: Hash =
  '0x1111111111111111111111111111111111111111111111111111111111111111';
const CALL_ID = '0xcall';

const P = 10n ** 18n;
const AMOUNT = 20n * P;
const CCIP_FEE = 20_000_000_000_000_000n; // 0.02 ETH
const SHOWN_FEE = {
  ccipFee: CCIP_FEE,
  maxFee: applySlowStakeMaxFeeBuffer(CCIP_FEE),
  feeAmountDtoO: 0n,
  total: CCIP_FEE,
  gasLimit: 1_000_000,
};
const BUCKET = {
  tokens: 60n * P,
  lastUpdated: 0,
  isEnabled: true,
  capacity: 90n * P,
  rate: P,
};

const { ETH, WETH: WETH_TOKEN } = TOKENS_TO_STAKE;

const state = vi.hoisted(() => ({
  isAA: false,
  l2Stake: undefined as L2StakeModule | undefined,
  refetchFee: vi.fn(),
  refetchLimits: vi.fn(),
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

vi.mock('../use-slow-stake-limits', () => ({
  useSlowStakeLimits: () => ({ refetch: state.refetchLimits }),
}));
vi.mock('modules/web3', async () => {
  const { runTxFlow } = await import('modules/web3/hooks/tx-flow/run-tx-flow');
  const errors = await import('modules/web3/utils');
  const context = await import('modules/web3/hooks/tx-flow/context');
  return {
    ...errors,
    ...context,
    getPrettyChainName: () => 'Base',
    useDappStatus: () => ({ address: ACCOUNT, chainId: CHAINS.Base }),
    useAA: () => ({ isAA: state.isAA }),
    useLidoSDKL2: () => ({ l2Stake: state.l2Stake }),
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
const pendingStore = vi.hoisted(() => ({ add: vi.fn() }));
vi.mock('../slow-stake-pending-store', () => ({
  addPendingSlowStake: pendingStore.add,
}));
vi.mock('../use-tx-modal-stages-slow-stake', () => ({
  useTxModalStagesL2SlowStake: () => ({ txModalStages: state.txModalStages }),
}));
vi.mock('../../hooks/use-track-event', () => ({
  useTrackStakeEvent: () => vi.fn(),
}));

import { useL2SlowStake } from '../use-slow-stake';

type ModuleOptions = { allowance?: bigint; liveFee?: bigint; tokens?: bigint };

const createModule = (
  performTransaction: ReturnType<typeof legacyPerformTransaction>,
  {
    allowance = 0n,
    liveFee = CCIP_FEE,
    tokens = BUCKET.tokens,
  }: ModuleOptions = {},
) => {
  const reads: Record<string, unknown> = {
    allowance,
    TOKEN: WETH,
    WNATIVE: WETH,
    MIN_PROCESS_MESSAGE_GAS: 75_000n,
    LINK_TOKEN: zeroAddress,
    CCIP_ROUTER,
    getReceiver: L1_RECEIVER_BYTES,
    getOnRamp: CCIP_ONRAMP,
    getPoolBySourceToken: CCIP_POOL,
    getCurrentOutboundRateLimiterState: { ...BUCKET, tokens },
    getFee: liveFee,
  };
  const publicClient = {
    readContract: vi.fn(async ({ functionName }: { functionName: string }) => {
      if (!(functionName in reads))
        throw new Error(`unexpected read: ${functionName}`);
      return reads[functionName];
    }),
    estimateContractGas: vi.fn(async () => 300_000n),
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
  return { walletClient, publicClient };
};

const decodeSlowStake = (data: Hex) => {
  const decoded = decodeFunctionData({ abi: L2_STAKING_RECEIVER_ABI, data });
  expect(decoded.functionName).toBe('slowStake');
  return decoded.args as readonly [bigint, Address, bigint, Hex, Hex];
};

const lane = LIDO_L2_SLOW_STAKE_LANES[CHAINS.Base];
const feeOtoD = (maxFee: bigint) =>
  encodeFeeOtoD({ maxFee, payInLink: false, gasLimit: lane?.gasLimit ?? 0 });

const onConfirm = vi.fn();
const onRetry = vi.fn();

const stake = (token: TOKENS_TO_STAKE, shownFee = SHOWN_FEE) =>
  renderHook(() =>
    useL2SlowStake({
      onConfirm,
      onRetry,
      shownFee,
      refetchFee: state.refetchFee,
    }),
  )({ amount: AMOUNT, token });

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

describe('useL2SlowStake', () => {
  it('sends ETH to Ethereum capped at the fresh quote and fronting the cap', async () => {
    const { walletClient } = createModule(legacyPerformTransaction('success'));

    await expect(stake(ETH)).resolves.toBe(true);

    expect(walletClient.writeContract).toHaveBeenCalledTimes(1);
    const [write] = walletClient.writeContract.mock.calls[0] as unknown as [
      {
        address: Address;
        functionName: string;
        args: unknown[];
        value: bigint;
      },
    ];
    expect(write.address).toBe(RECEIVER);
    expect(write.functionName).toBe('slowStake');
    expect(write.args).toEqual([
      CCIP_ETHEREUM_CHAIN_SELECTOR,
      zeroAddress,
      AMOUNT,
      feeOtoD(SHOWN_FEE.maxFee),
      expect.any(String),
    ]);
    expect(write.value).toBe(AMOUNT + SHOWN_FEE.maxFee);
    expect(state.txModalStages.sign).toHaveBeenCalledWith(AMOUNT, ETH);
    expect(state.txModalStages.pending).toHaveBeenCalledWith(
      AMOUNT,
      ETH,
      TX_HASH,
      false,
    );
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(state.txModalStages.success).toHaveBeenCalledWith(
      AMOUNT,
      ETH,
      'Base',
      TX_HASH,
      undefined,
    );
    expect(state.txModalStages.failed).not.toHaveBeenCalled();
  });

  it('records the sent stake by its message id for the list', async () => {
    const perform = legacyPerformTransaction('success');
    // the SDK confirms with the receipt, whose SlowStake log carries the id
    const slowStakeLog = {
      address: RECEIVER,
      topics: encodeEventTopics({
        abi: L2_STAKING_RECEIVER_ABI,
        eventName: 'SlowStake',
        args: {
          user: ACCOUNT,
          destChainSelector: CCIP_ETHEREUM_CHAIN_SELECTOR,
          token: WETH,
        },
      }),
      data: encodeAbiParameters(
        [{ type: 'bytes32' }, { type: 'uint256' }],
        [MESSAGE_ID, AMOUNT],
      ),
    };
    const withLogs = vi.fn(async (props: Parameters<typeof perform>[0]) =>
      perform({
        ...props,
        callback: (args) =>
          props.callback(
            args.stage === TransactionCallbackStage.CONFIRMATION
              ? {
                  ...args,
                  payload: {
                    ...args.payload,
                    blockNumber: 42n,
                    logs: [slowStakeLog],
                  } as never,
                }
              : args,
          ),
      }),
    );
    createModule(withLogs);

    await expect(stake(ETH)).resolves.toBe(true);

    expect(state.txModalStages.success).toHaveBeenCalledWith(
      AMOUNT,
      ETH,
      'Base',
      TX_HASH,
      MESSAGE_ID,
    );

    expect(pendingStore.add).toHaveBeenCalledWith({
      messageId: MESSAGE_ID,
      chainId: CHAINS.Base,
      address: ACCOUNT,
      token: WETH,
      amount: AMOUNT,
      sendTxHash: TX_HASH,
      sendBlockNumber: 42n,
    });
  });

  it('records nothing without a receipt to read the id from', async () => {
    createModule(legacyPerformTransaction('success'));
    await stake(ETH);
    expect(pendingStore.add).not.toHaveBeenCalled();
  });

  it('signs the live cap when the quote moved within the shown headroom', async () => {
    const liveFee = CCIP_FEE + CCIP_FEE / 10n;
    const { walletClient } = createModule(legacyPerformTransaction('success'), {
      liveFee,
    });

    await expect(stake(ETH)).resolves.toBe(true);

    const [write] = walletClient.writeContract.mock.calls[0] as unknown as [
      { args: unknown[]; value: bigint },
    ];
    const liveMaxFee = applySlowStakeMaxFeeBuffer(liveFee);
    expect(write.args[3]).toBe(feeOtoD(liveMaxFee));
    expect(write.value).toBe(AMOUNT + liveMaxFee);
  });

  it('stops before the wallet when the quote rose above the shown cap', async () => {
    const { walletClient } = createModule(legacyPerformTransaction('success'), {
      liveFee: SHOWN_FEE.maxFee + 1n,
    });

    await expect(stake(ETH)).resolves.toBe(false);

    expect(walletClient.writeContract).not.toHaveBeenCalled();
    expect(state.txModalStages.failed).toHaveBeenCalledWith(
      expect.any(QuoteMismatchError),
      onRetry,
    );
    expect(state.refetchFee).toHaveBeenCalled();
  });

  it('stops before the wallet when the bucket no longer takes the amount', async () => {
    const { walletClient } = createModule(legacyPerformTransaction('success'), {
      tokens: AMOUNT - 1n,
    });

    await expect(stake(ETH)).resolves.toBe(false);

    expect(walletClient.writeContract).not.toHaveBeenCalled();
    expect(state.txModalStages.failed).toHaveBeenCalledWith(
      expect.any(StakeLimitError),
      onRetry,
    );
    const [[error]] = state.txModalStages.failed.mock.calls as [[Error]];
    expect(error.message).toContain('Up to 19.999');
    expect(state.refetchLimits).toHaveBeenCalled();
  });

  it('approves WETH first and fronts only the cap on the stake', async () => {
    const { walletClient } = createModule(
      legacyPerformTransaction('success', 'success'),
    );

    await expect(stake(WETH_TOKEN)).resolves.toBe(true);

    expect(walletClient.writeContract).toHaveBeenCalledTimes(2);
    expect(walletClient.writeContract).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        address: WETH,
        functionName: 'approve',
        args: [RECEIVER, AMOUNT],
      }),
    );
    const [, [write]] = walletClient.writeContract.mock.calls as unknown as [
      unknown,
      [{ args: unknown[]; value: bigint }],
    ];
    expect(write.args[1]).toBe(WETH);
    expect(write.value).toBe(SHOWN_FEE.maxFee);
    expect(state.txModalStages.signApproval).toHaveBeenCalledWith(AMOUNT);
  });

  it('skips the approval when the allowance is already there', async () => {
    const { walletClient } = createModule(legacyPerformTransaction('success'), {
      allowance: AMOUNT,
    });

    await expect(stake(WETH_TOKEN)).resolves.toBe(true);

    expect(walletClient.writeContract).toHaveBeenCalledTimes(1);
    expect(state.txModalStages.signApproval).not.toHaveBeenCalled();
  });

  it('batches the approval and the stake for an AA wallet, verified before the batch', async () => {
    state.isAA = true;
    state.sendAACalls = aaSendCalls({ callId: CALL_ID, txHash: TX_HASH });
    createModule(legacyPerformTransaction('success'));

    await expect(stake(WETH_TOKEN)).resolves.toBe(true);

    const calls = sentAACalls(state.sendAACalls);
    expect(calls).toHaveLength(2);
    const stakeCall = calls[1];
    if (!stakeCall?.data) throw new Error('the stake call has no calldata');
    const decoded = decodeSlowStake(stakeCall.data);
    expect(decoded[1]).toBe(WETH);
    expect(decoded[3]).toBe(feeOtoD(SHOWN_FEE.maxFee));
    expect(stakeCall.value).toBe(SHOWN_FEE.maxFee);
    expect(state.txModalStages.success).toHaveBeenCalledWith(
      AMOUNT,
      WETH_TOKEN,
      'Base',
      TX_HASH,
      undefined,
    );
  });
});
