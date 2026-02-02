import type { Address, Abi } from 'viem';

import { CHAINS } from '@lidofinance/lido-ethereum-sdk/common';

// LIDO SDK ABIs
import { LidoLocatorAbi } from '@lidofinance/lido-ethereum-sdk/core';
import { StethAbi } from '@lidofinance/lido-ethereum-sdk/stake';
import { WithdrawalQueueAbi } from '@lidofinance/lido-ethereum-sdk/withdraw';
import {
  WstethABI,
  WstethReferralStakerABI,
} from '@lidofinance/lido-ethereum-sdk/wrap';
import {
  bridgedWstethAbi,
  rebasableL2StethAbi,
} from '@lidofinance/lido-ethereum-sdk/l2';

import {
  escrowAbi,
  emergencyProtectedTimelockAbi,
  dualGovernanceAbi,
  dgConfigProviderAbi,
} from '@lidofinance/lido-ethereum-sdk/dual-governance';

// Side contracts ABIs
import { AggregatorAbi } from 'abi/aggregator-abi';
import { ENSRegistryAbi } from 'abi/ens-registry-abi';
import { ENSResolverAbi } from 'abi/ens-resolver-abi';
import { PartialCurveAbi } from 'abi/partial-curve-abi';
import { PartialStakingRouterAbi } from 'abi/partial-staking-router';
import { wethABI } from 'abi/weth-abi';

// Earn contracts ABIs
// GGV
import {
  GGV_ACCOUNTANT_ABI,
  GGV_LENS_ABI,
  GGV_TELLER_ABI,
  GGV_VAULT_ABI,
  GGV_QUEUE_ABI,
} from 'features/earn/vault-ggv/contracts/abi';
// DVV
import {
  DVV_VAULT_ABI,
  DVV_DEPOSIT_WRAPPER_ABI,
} from 'features/earn/vault-dvv/contracts/abi';
import {
  STG_COLLECTOR_ABI,
  STG_DEPOSIT_QUEUE_ETH_ABI,
  STG_DEPOSIT_QUEUE_WETH_ABI,
  STG_DEPOSIT_QUEUE_WSTETH_ABI,
  STG_REDEEM_QUEUE_WSTETH_ABI,
  STG_SHARE_MANAGER_STRETH_ABI,
  STG_VAULT_ABI,
} from 'features/earn/vault-stg/contracts/abi';

import { config } from 'config';
import { CONTRACT_NAMES } from 'config/networks/networks-map';
import { getContractAddress } from 'config/networks/contract-address';

export const METRIC_CONTRACT_ABIS = {
  // Lido
  [CONTRACT_NAMES.lidoLocator]: LidoLocatorAbi,
  [CONTRACT_NAMES.lido]: StethAbi,
  [CONTRACT_NAMES.wsteth]: WstethABI,
  [CONTRACT_NAMES.withdrawalQueue]: WithdrawalQueueAbi,
  [CONTRACT_NAMES.L2stETH]: rebasableL2StethAbi,
  [CONTRACT_NAMES.L2wstETH]: bridgedWstethAbi,
  // SI contracts
  [CONTRACT_NAMES.wstethReferralStaker]: WstethReferralStakerABI,
  // Dual Governance
  [CONTRACT_NAMES.dualGovernance]: dualGovernanceAbi,
  [CONTRACT_NAMES.escrow]: escrowAbi,
  [CONTRACT_NAMES.emergencyProtectedTimelock]: emergencyProtectedTimelockAbi,
  [CONTRACT_NAMES.dgConfigProvider]: dgConfigProviderAbi,
  // Side contracts ABIs
  [CONTRACT_NAMES.aggregatorEthUsdPriceFeed]: AggregatorAbi,
  [CONTRACT_NAMES.aggregatorStEthUsdPriceFeed]: AggregatorAbi,
  [CONTRACT_NAMES.stakingRouter]: PartialStakingRouterAbi,
  [CONTRACT_NAMES.stethCurve]: PartialCurveAbi,
  [CONTRACT_NAMES.ensPublicResolver]: ENSResolverAbi,
  [CONTRACT_NAMES.ensRegistry]: ENSRegistryAbi,
  [CONTRACT_NAMES.weth]: wethABI,
  // GGV
  [CONTRACT_NAMES.ggvVault]: GGV_VAULT_ABI,
  [CONTRACT_NAMES.ggvTeller]: GGV_TELLER_ABI,
  [CONTRACT_NAMES.ggvAccountant]: GGV_ACCOUNTANT_ABI,
  [CONTRACT_NAMES.ggvLens]: GGV_LENS_ABI,
  [CONTRACT_NAMES.ggvQueue]: GGV_QUEUE_ABI,
  // DVV
  [CONTRACT_NAMES.dvvVault]: DVV_VAULT_ABI,
  [CONTRACT_NAMES.dvvDepositWrapper]: DVV_DEPOSIT_WRAPPER_ABI,
  // STG
  [CONTRACT_NAMES.stgVault]: STG_VAULT_ABI,
  [CONTRACT_NAMES.stgDepositQueueETH]: STG_DEPOSIT_QUEUE_ETH_ABI,
  [CONTRACT_NAMES.stgDepositQueueWETH]: STG_DEPOSIT_QUEUE_WETH_ABI,
  [CONTRACT_NAMES.stgDepositQueueWSTETH]: STG_DEPOSIT_QUEUE_WSTETH_ABI,
  [CONTRACT_NAMES.stgRedeemQueueWSTETH]: STG_REDEEM_QUEUE_WSTETH_ABI,
  [CONTRACT_NAMES.stgShareManagerSTRETH]: STG_SHARE_MANAGER_STRETH_ABI,
  [CONTRACT_NAMES.stgCollector]: STG_COLLECTOR_ABI,
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
  CONTRACT_NAMES.weth,
  // vaults are tokens, have transfer/approval events
  CONTRACT_NAMES.dvvVault,
  CONTRACT_NAMES.ggvVault,
  // in case of stRATEGY the token is share manager contract
  CONTRACT_NAMES.stgShareManagerSTRETH,
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
