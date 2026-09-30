import type { EncodableContract } from '@lidofinance/lido-ethereum-sdk/common';
import type { GetContractReturnType } from 'viem';
import type {
  L2StakingReceiverAbiType,
  L2StakingOracleFeedAbiType,
  L2StakingOraclePoolAbiType,
} from './l2-staking-abi';
import type { LidoSdkKeyedClients } from '@lidofinance/lido-ethereum-sdk/core';

export type L2StakingReceiverContractType = EncodableContract<
  GetContractReturnType<L2StakingReceiverAbiType, LidoSdkKeyedClients>
>;
export type L2StakingOraclePoolContractType = EncodableContract<
  GetContractReturnType<L2StakingOraclePoolAbiType, LidoSdkKeyedClients>
>;

export type L2StakingOracleFeedContractType = EncodableContract<
  GetContractReturnType<L2StakingOracleFeedAbiType, LidoSdkKeyedClients>
>;
