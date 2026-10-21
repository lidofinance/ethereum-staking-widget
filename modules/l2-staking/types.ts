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
import type {
  L2StakingReceiverAbiType,
  L2StakingOracleFeedAbiType,
  L2StakingOraclePoolAbiType,
} from './l2-staking-abi';
import type { CcipRouterAbiType, CcipTokenPoolAbiType } from './ccip-abi';
import type {
  CommonTransactionProps,
  EtherValue,
  LidoSdkKeyedClients,
  LidoSDKCore,
} from '@lidofinance/lido-ethereum-sdk/core';
import type { L1StakingReceiverAbiType } from './l1-receiver-abi';
import type { L2_SLOW_STAKE_STAGE } from './const';

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
  // the widest eth_getLogs block range the RPC in front serves
  logsBlockRange?: number;
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

type L2SlowStakeStatusBase = L2SlowStakeSent & {
  ccipExplorerUrl: string;
};

export type L2SlowStakeStatus =
  | (L2SlowStakeStatusBase & { stage: 'sent' })
  | (L2SlowStakeStatusBase & { stage: 'in_transit'; ccipStatus: string })
  | (L2SlowStakeStatusBase & {
      stage: 'transport_failed';
      ccipStatus: string;
      readyForManualExecution: boolean;
    })
  | (L2SlowStakeStatusBase & {
      stage: 'parked';
      l1TxHash: Hash;
      l1BlockNumber: bigint;
      failedMessage: L1FailedMessage;
    })
  | (L2SlowStakeStatusBase & { stage: 'tokens_recovered'; l1TxHash: Hash })
  | (L2SlowStakeStatusBase & {
      stage: 'staked';
      l1TxHash: Hash;
      l1BlockNumber: bigint;
      stakedAmount: bigint;
      // the retryable ticket on Arbitrum; absent on the other lanes
      bridgeMessageId?: Hash;
    })
  | (L2SlowStakeStatusBase & {
      stage: 'delivered';
      l1TxHash: Hash;
      stakedAmount: bigint;
      l2TxHash: Hash;
    });

export type L2SlowStakeLookupProps = {
  account: Address;
  // the L2 block to search the user's sends from; the search is chunked by
  // the module's logs block range
  fromBlock: bigint;
  toBlock?: bigint;
};

export type L2SlowStakeApiLookupProps = {
  account: Address;
  // pages of the lane's message list to walk, newest first
  pageSize?: number;
  maxPages?: number;
};
