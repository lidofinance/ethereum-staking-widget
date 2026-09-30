import type { EncodableContract } from '@lidofinance/lido-ethereum-sdk/common';
import type { GetContractReturnType, Address } from 'viem';
import type {
  L2StakingReceiverAbiType,
  L2StakingOracleFeedAbiType,
  L2StakingOraclePoolAbiType,
} from './l2-staking-abi';
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
};
