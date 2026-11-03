import type { EncodableContract } from '@lidofinance/lido-ethereum-sdk/common';
import type {
  erc20Abi,
  GetContractReturnType,
  Address,
  Hash,
  Hex,
  JsonRpcAccount,
  PublicClient,
} from 'viem';
import type { L2StakingReceiverAbiType } from './abi/l2-staking-receiver';
import type { L2StakingOraclePoolAbiType } from './abi/l2-staking-oracle-pool';
import type { L2StakingOracleFeedAbiType } from './abi/l2-staking-oracle-feed';
import type { CcipRouterAbiType, CcipTokenPoolAbiType } from './abi/ccip';
import type {
  CommonTransactionProps,
  EtherValue,
  LidoSdkKeyedClients,
  LidoSDKCore,
} from '@lidofinance/lido-ethereum-sdk/core';
import type { L1StakingReceiverAbiType } from './abi/l1-staking-receiver';
import type { L2_SLOW_STAKE_OUTCOME, L2_SLOW_STAKE_STAGE } from './const';

export type L2StakingReceiverContractType = EncodableContract<
  GetContractReturnType<L2StakingReceiverAbiType, LidoSdkKeyedClients>
>;
export type L2StakingOraclePoolContractType = EncodableContract<
  GetContractReturnType<L2StakingOraclePoolAbiType, LidoSdkKeyedClients>
>;

export type L2StakingOracleFeedContractType = EncodableContract<
  GetContractReturnType<L2StakingOracleFeedAbiType, LidoSdkKeyedClients>
>;

export type L2StakableToken = 'ETH' | 'WETH';

export type L2FastStakeProps = {
  token: L2StakableToken;
  amount: EtherValue;
  minReceiveAmount: EtherValue;
  referral?: Address;
} & CommonTransactionProps;

export type ParsedL2FastStakeProps = L2FastStakeProps & {
  amount: bigint;
  minReceiveAmount: bigint;
  referral: Address;
  account: JsonRpcAccount;
};

// What the FastStake event of a sent stake carries, the referral when one
// was passed
export type L2FastStakeResult = {
  user: Address;
  token: Address;
  amountIn: bigint;
  amountOut: bigint;
  referral?: Address;
};

// Whether each route is open, from the sender's admin switches and, for the
// slow lane, CCIP's own gates
export type L2StakeState = {
  isFastLaneAvailable: boolean;
  isSlowLaneAvailable: boolean;
};

export type L2WethContractType = EncodableContract<
  GetContractReturnType<typeof erc20Abi, LidoSdkKeyedClients>
>;

export type L2ApproveWethProps = {
  amount: EtherValue;
} & CommonTransactionProps;

export type ParsedL2ApproveWethProps = L2ApproveWethProps & {
  amount: bigint;
  account: JsonRpcAccount;
};

export type CcipRouterContractType = EncodableContract<
  GetContractReturnType<CcipRouterAbiType, LidoSdkKeyedClients>
>;

export type CcipTokenPoolContractType = EncodableContract<
  GetContractReturnType<CcipTokenPoolAbiType, LidoSdkKeyedClients>
>;

// The per-lane shape of a slow stake, resolved once per chain
export type L2SlowStakeConfig = {
  destChainSelector: bigint;
  // the L1 receiver as the sender stores it, ABI-encoded
  receiver: Hex;
  gasLimit: number;
  feeDtoO: Hex;
  // native pulled on top of the stake for the way back (Arbitrum only)
  feeAmountDtoO: bigint;
  minProcessMessageGas: bigint;
};

export type L2SlowStakeFeeProps = {
  amount: EtherValue;
  // the recipient written into the payload; the quote does not depend on it
  account?: Address;
};

export type L2SlowStakeFee = {
  // the live CCIP quote: what the send is priced at
  ccipFee: bigint;
  // the cap to sign; the part above the fee is refunded in the same tx
  maxFee: bigint;
  feeAmountDtoO: bigint;
  // the cost to show: the quote plus the return-leg budget
  total: bigint;
  gasLimit: number;
};

// The outbound bucket of the lane's CCIP WETH pool, in stake terms. The
// bucket is consumed by the stake plus the return-leg budget, so the stake
// caps are that much below the raw bucket. Both are absent while the limiter
// is off
export type L2SlowStakeLimits = {
  isEnabled: boolean;
  capacity: bigint;
  available: bigint;
  // refill per second
  rate: bigint;
  lastUpdated: number;
  // the largest stake the lane accepts at all; above it, splitting is the
  // only way through
  maxAmount?: bigint;
  // the largest stake that goes through right now
  availableAmount?: bigint;
};

export type L2SlowStakeProps = {
  token: L2StakableToken;
  amount: EtherValue;
  // the signed cap on the CCIP fee, from a fresh quote
  maxFee: EtherValue;
} & CommonTransactionProps;

export type ParsedL2SlowStakeProps = L2SlowStakeProps & {
  amount: bigint;
  maxFee: bigint;
  account: JsonRpcAccount;
};

// What the SlowStake event of a sent stake carries
export type L2SlowStakeResult = {
  messageId: Hash;
  user: Address;
  token: Address;
  amount: bigint;
};

export type L2StakeModuleProps = {
  core: LidoSDKCore;
  // Ethereum client for the L1 legs of a slow stake's status; the status
  // methods require it, everything else works without
  l1PublicClient?: PublicClient;
  ccipApiBaseUrl?: string;
  fetcher?: typeof fetch;
};

export type L1StakingReceiverContractType = GetContractReturnType<
  L1StakingReceiverAbiType,
  PublicClient
>;

// The L2 send, as the sender's SlowStake event records it
export type L2SlowStakeSent = {
  messageId: Hash;
  user: Address;
  token: Address;
  amount: bigint;
  sendTxHash: Hash;
  sendBlockNumber: bigint;
  // when the send was mined, in ms since the epoch; read from the block
  // when not known
  sendTimestampMs?: number;
};

// The CCIP message as the receiver got it; what a retry on L1 needs
export type L1FailedMessage = {
  messageId: Hash;
  sourceChainSelector: bigint;
  sender: Hex;
  data: Hex;
  destTokenAmounts: readonly { token: Address; amount: bigint }[];
};

export type L2SlowStakeStage =
  (typeof L2_SLOW_STAKE_STAGE)[keyof typeof L2_SLOW_STAKE_STAGE];
export type L2SlowStakeOutcome =
  (typeof L2_SLOW_STAKE_OUTCOME)[keyof typeof L2_SLOW_STAKE_OUTCOME];

// The key the L1 receipt leaves for the wstETH's way back, one per bridge:
// what the landing on the L2 is read by
export type L2SlowStakeReturnLeg =
  // the deposit transaction on the L2, derived from the portal's log
  | { bridge: 'op-stack'; l2TxHash: Hash }
  // the retryable ticket: the hash of its creation transaction on the L2
  | { bridge: 'arbitrum'; ticketId: Hash }
  // the message hash the L2 message service tracks the claim by
  | { bridge: 'linea'; messageHash: Hash };

type L2SlowStakeStatusBase = L2SlowStakeSent & {
  sendTimestampMs: number;
  ccipExplorerUrl: string;
};

// executed on Ethereum, the wstETH handed to the bridge back
type L2SlowStakeStaked = {
  l1TxHash: Hash;
  l1BlockNumber: bigint;
  stakedAmount: bigint;
  returnLeg: L2SlowStakeReturnLeg;
};

export type L2SlowStakeStatus = L2SlowStakeStatusBase &
  (
    | { outcome: 'inflight'; stage: 'sent' }
    | {
        outcome: 'inflight';
        stage: 'in_transit';
        ccipStatus: string;
      }
    | (L2SlowStakeStaked & { outcome: 'inflight'; stage: 'bridging' })
    | {
        outcome: 'error';
        stage: 'transport_failed';
        ccipStatus: string;
        readyForManualExecution: boolean;
      }
    | {
        outcome: 'error';
        stage: 'parked';
        l1TxHash: Hash;
        l1BlockNumber: bigint;
        failedMessage: L1FailedMessage;
      }
    | (L2SlowStakeStaked & {
        outcome: 'error';
        stage: 'relay_failed';
        // the failed relay or redeem on the L2, when it was mined
        l2TxHash?: Hash;
      })
    | (L2SlowStakeStaked & { outcome: 'error'; stage: 'unresolved' })
    | (L2SlowStakeStaked & {
        outcome: 'success';
        stage: 'delivered';
        // the landing transaction; Linea's claim has no key to read it by
        l2TxHash?: Hash;
      })
    | {
        outcome: 'success';
        stage: 'recovered';
        l1TxHash: Hash;
        l1BlockNumber: bigint;
      }
  );

export type L2SlowStakeApiLookupProps = {
  account: Address;
  // pages of the lane's message list to walk, newest first
  pageSize?: number;
  maxPages?: number;
};

export type L2SlowStakeLatestProps = {
  // how many of the newest sends get their status resolved
  limit?: number;
};

// Statuses by what they ask of the user, each stack newest first
export type L2SlowStakeStacks = {
  inflight: L2SlowStakeStatus[];
  error: L2SlowStakeStatus[];
  success: L2SlowStakeStatus[];
};

// The newest sends with their statuses, and whether older sends exist
// beyond the limit
export type L2SlowStakeLatest = L2SlowStakeStacks & {
  hasMore: boolean;
};
