import { Abi } from 'viem';
import type { Address } from 'viem';
import { mainnet } from 'viem/chains';
import { invert, isNull, memoize, omitBy } from 'lodash';

import {
  LIDO_L2_CONTRACT_ADDRESSES,
  LIDO_TOKENS,
  CHAINS,
} from '@lidofinance/lido-ethereum-sdk/common';
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

import { config } from 'config';
import { CONTRACT_KEYS, NETWORKS_MAP } from 'config/networks/networks-map';
import { getContractAddress } from 'config/networks/contract-address';
import { getTokenAddress } from 'config/networks/token-address';

export const CONTRACT_NAMES = {
  lido: 'lido',
  wsteth: 'wsteth',
  L2stETH: 'L2stETH',
  L2wstETH: 'L2wstETH',
  withdrawalQueue: 'withdrawalQueue',
  aggregator: 'aggregator',
  aggregatorStEthUsdPriceFeed: 'aggregatorStEthUsdPriceFeed',
  stakingRouter: 'stakingRouter',
  stethCurve: 'stethCurve',
  lidoLocator: 'lidoLocator',
  ensPublicResolver: 'ensPublicResolver',
  ensRegistry: 'ensRegistry',
} as const;
export type CONTRACT_NAMES = keyof typeof CONTRACT_NAMES;

export const METRIC_CONTRACT_ABIS = {
  [CONTRACT_NAMES.lido]: StethAbi,
  [CONTRACT_NAMES.wsteth]: WstethABI,
  [CONTRACT_NAMES.withdrawalQueue]: WithdrawalQueueAbi,
  [CONTRACT_NAMES.aggregator]: AggregatorAbi,
  [CONTRACT_NAMES.aggregatorStEthUsdPriceFeed]: AggregatorAbi,
  [CONTRACT_NAMES.stakingRouter]: PartialStakingRouterAbi,
  [CONTRACT_NAMES.stethCurve]: PartialCurveAbi,
  [CONTRACT_NAMES.lidoLocator]: LidoLocatorAbi,
  [CONTRACT_NAMES.L2stETH]: rebasableL2StethAbi,
  [CONTRACT_NAMES.L2wstETH]: bridgedWstethAbi,
  [CONTRACT_NAMES.ensPublicResolver]: ENSResolverAbi,
  [CONTRACT_NAMES.ensRegistry]: ENSRegistryAbi,
} as const;

export const getMetricContractAbi = memoize(
  (contractName: CONTRACT_NAMES): Abi => {
    return METRIC_CONTRACT_ABIS[contractName];
  },
);

const supportedChainsWithMainnet: CHAINS[] = config.supportedChains.includes(
  CHAINS.Mainnet,
)
  ? config.supportedChains
  : [...config.supportedChains, CHAINS.Mainnet];

export const METRIC_CONTRACT_ADDRESSES = supportedChainsWithMainnet.reduce(
  (mapped, chainId) => {
    const map = {
      [CONTRACT_NAMES.lido]:
        getTokenAddress(chainId, LIDO_TOKENS.steth) ?? null,
      [CONTRACT_NAMES.wsteth]:
        getTokenAddress(chainId, LIDO_TOKENS.wsteth) ?? null,
      [CONTRACT_NAMES.withdrawalQueue]:
        getContractAddress(chainId, CONTRACT_KEYS.WITHDRAWAL_QUEUE) ?? null,
      [CONTRACT_NAMES.aggregator]:
        getContractAddress(
          chainId,
          CONTRACT_KEYS.AGGREGATOR_STETH_USD_PRICE_FEED,
        ) ?? null,
      [CONTRACT_NAMES.aggregatorStEthUsdPriceFeed]:
        getContractAddress(
          chainId,
          CONTRACT_KEYS.AGGREGATOR_STETH_USD_PRICE_FEED,
        ) ?? null,
      [CONTRACT_NAMES.stakingRouter]:
        getContractAddress(chainId, CONTRACT_KEYS.STAKING_ROUTER) ?? null,
      [CONTRACT_NAMES.stethCurve]:
        chainId === mainnet.id
          ? NETWORKS_MAP[CHAINS.Mainnet].contracts
              .LIDO_CURVE_LIQUIDITY_FARMING_POOL
          : null,
      [CONTRACT_NAMES.lidoLocator]:
        getContractAddress(chainId, CONTRACT_KEYS.LIDO_LOCATOR) ?? null,
      [CONTRACT_NAMES.L2stETH]:
        LIDO_L2_CONTRACT_ADDRESSES[chainId]?.['steth'] ?? null,
      [CONTRACT_NAMES.L2wstETH]:
        LIDO_L2_CONTRACT_ADDRESSES[chainId]?.['wsteth'] ?? null,
      [CONTRACT_NAMES.ensPublicResolver]:
        chainId === mainnet.id
          ? NETWORKS_MAP[CHAINS.Mainnet].contracts.ENS_PUBLIC_RESOLVER
          : null,
      [CONTRACT_NAMES.ensRegistry]:
        chainId === mainnet.id ? mainnet.contracts.ensRegistry.address : null,
    };
    return {
      ...mapped,
      [chainId]: invert(omitBy(map, isNull)),
    };
  },
  {} as Record<CHAINS, Record<Address, CONTRACT_NAMES>>,
);

export const METRIC_CONTRACT_EVENT_ADDRESSES =
  supportedChainsWithMainnet.reduce(
    (mapped, chainId) => {
      const map = {
        [CONTRACT_NAMES.withdrawalQueue]:
          getContractAddress(chainId, CONTRACT_KEYS.WITHDRAWAL_QUEUE) ?? null,
        [CONTRACT_NAMES.lido]:
          getTokenAddress(chainId, LIDO_TOKENS.steth) ?? null,
        [CONTRACT_NAMES.wsteth]:
          getTokenAddress(chainId, LIDO_TOKENS.wsteth) ?? null,
        [CONTRACT_NAMES.L2stETH]:
          LIDO_L2_CONTRACT_ADDRESSES[chainId]?.['steth'] ?? null,
        [CONTRACT_NAMES.L2wstETH]:
          LIDO_L2_CONTRACT_ADDRESSES[chainId]?.['wsteth'] ?? null,
      };
      return {
        ...mapped,
        [chainId]: invert(omitBy(map, isNull)),
      };
    },
    {} as Record<CHAINS, Record<Address, CONTRACT_NAMES>>,
  );
