import type { EncodableContract } from '@lidofinance/lido-ethereum-sdk/common';
import type { wethABI } from 'abi/weth-abi';
import type {
  GetContractReturnType,
  Address,
  Hash,
  Hex,
  JsonRpcAccount,
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
} from '@lidofinance/lido-ethereum-sdk/core';

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
  GetContractReturnType<typeof wethABI, LidoSdkKeyedClients>
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
