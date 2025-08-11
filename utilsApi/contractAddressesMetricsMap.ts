import { Abi } from 'viem';
import type { Address } from 'viem';

import { CHAINS } from '@lidofinance/lido-ethereum-sdk/common';
import { LidoLocatorAbi } from '@lidofinance/lido-ethereum-sdk/core';
import { StethAbi } from '@lidofinance/lido-ethereum-sdk/stake';
import { WithdrawalQueueAbi } from '@lidofinance/lido-ethereum-sdk/withdraw';
import { WstethABI } from '@lidofinance/lido-ethereum-sdk/wrap';
import {
  bridgedWstethAbi,
  rebasableL2StethAbi,
} from '@lidofinance/lido-ethereum-sdk/l2';

import { AggregatorAbi } from 'abi/aggregator-abi';
import { ENSRegistryAbi } from 'abi/ens-registry-abi';
import { ENSResolverAbi } from 'abi/ens-resolver-abi';
import { PartialCurveAbi } from 'abi/partial-curve-abi';
import { PartialStakingRouterAbi } from 'abi/partial-staking-router';

import {
  GGV_ACCOUNTANT_ABI,
  GGV_LENS_ABI,
  GGV_TELLER_ABI,
  GGV_VAULT_ABI,
} from 'features/earn/vault-ggv/contracts/abi';

import { config } from 'config';
import { CONTRACT_NAMES } from 'config/networks/networks-map';
import { getContractAddress } from 'config/networks/contract-address';

export const METRIC_CONTRACT_ABIS = {
  [CONTRACT_NAMES.lido]: StethAbi,
  [CONTRACT_NAMES.wsteth]: WstethABI,
  [CONTRACT_NAMES.withdrawalQueue]: WithdrawalQueueAbi,
  [CONTRACT_NAMES.aggregatorEthUsdPriceFeed]: AggregatorAbi,
  [CONTRACT_NAMES.aggregatorStEthUsdPriceFeed]: AggregatorAbi,
  [CONTRACT_NAMES.stakingRouter]: PartialStakingRouterAbi,
  [CONTRACT_NAMES.stethCurve]: PartialCurveAbi,
  [CONTRACT_NAMES.lidoLocator]: LidoLocatorAbi,
  [CONTRACT_NAMES.L2stETH]: rebasableL2StethAbi,
  [CONTRACT_NAMES.L2wstETH]: bridgedWstethAbi,
  [CONTRACT_NAMES.ensPublicResolver]: ENSResolverAbi,
  [CONTRACT_NAMES.ensRegistry]: ENSRegistryAbi,
  // GGV
  [CONTRACT_NAMES.ggvVault]: GGV_VAULT_ABI,
  [CONTRACT_NAMES.ggvTeller]: GGV_TELLER_ABI,
  [CONTRACT_NAMES.ggvAccountant]: GGV_ACCOUNTANT_ABI,
  [CONTRACT_NAMES.ggvLens]: GGV_LENS_ABI,
} as const;

export type MetricContractName = keyof typeof CONTRACT_NAMES;

export const getMetricContractAbi = (contractName: MetricContractName): Abi => {
  return METRIC_CONTRACT_ABIS[contractName];
};

const supportedChainsWithMainnet: CHAINS[] = config.supportedChains.includes(
  CHAINS.Mainnet,
)
  ? config.supportedChains
  : [...config.supportedChains, CHAINS.Mainnet];

const CONTRACTS_WITH_EVENTS = [
  CONTRACT_NAMES.withdrawalQueue,
  CONTRACT_NAMES.lido,
  CONTRACT_NAMES.wsteth,
  CONTRACT_NAMES.L2stETH,
  CONTRACT_NAMES.L2wstETH,
];

const invertContractsNamesToAddress = (
  contractNames: CONTRACT_NAMES[],
  chainId: CHAINS,
) =>
  contractNames.reduce(
    (acc, contractName) => {
      const address = getContractAddress(chainId, contractName);
      if (address) {
        acc[address] = contractName;
      }
      return acc;
    },
    {} as Record<Address, CONTRACT_NAMES>,
  );

export const METRIC_CONTRACT_ADDRESSES = supportedChainsWithMainnet.reduce(
  (mapped, chainId) => {
    return {
      ...mapped,
      [chainId]: invertContractsNamesToAddress(
        Object.values(CONTRACT_NAMES),
        chainId,
      ),
    };
  },
  {} as Record<CHAINS, Record<Address, CONTRACT_NAMES>>,
);

export const METRIC_CONTRACT_EVENT_ADDRESSES =
  supportedChainsWithMainnet.reduce(
    (mapped, chainId) => {
      return {
        ...mapped,
        [chainId]: invertContractsNamesToAddress(
          Object.values(CONTRACTS_WITH_EVENTS),
          chainId,
        ),
      };
    },
    {} as Record<CHAINS, Record<Address, CONTRACT_NAMES>>,
  );
