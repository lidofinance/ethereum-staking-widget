import { Abi } from 'viem';
import type { Address } from 'viem';
import { mainnet } from 'viem/chains';
import { invert, isNull, memoize, omitBy } from 'lodash';

import {
  LIDO_LOCATOR_BY_CHAIN,
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
import { getRateTokenAddress } from 'consts/token-addresses';
import {
  getWithdrawalQueueAddress,
  getStakingRouterAddress,
} from 'consts/contract-addresses';
import { AGGREGATOR_STETH_USD_PRICE_FEED_BY_NETWORK } from 'consts/aggregator';
import { MAINNET_CURVE } from 'features/rewards/hooks/use-steth-eth-rate';

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
        getRateTokenAddress(chainId, LIDO_TOKENS.steth) ?? null,
      [CONTRACT_NAMES.wsteth]:
        getRateTokenAddress(chainId, LIDO_TOKENS.wsteth) ?? null,
      [CONTRACT_NAMES.withdrawalQueue]:
        getWithdrawalQueueAddress(chainId) ?? null,
      [CONTRACT_NAMES.aggregator]:
        AGGREGATOR_STETH_USD_PRICE_FEED_BY_NETWORK[chainId] ?? null,
      [CONTRACT_NAMES.aggregatorStEthUsdPriceFeed]:
        AGGREGATOR_STETH_USD_PRICE_FEED_BY_NETWORK[chainId] ?? null,
      [CONTRACT_NAMES.stakingRouter]: getStakingRouterAddress(chainId) ?? null,
      [CONTRACT_NAMES.stethCurve]:
        chainId === mainnet.id ? MAINNET_CURVE : null,
      [CONTRACT_NAMES.lidoLocator]: LIDO_LOCATOR_BY_CHAIN[chainId] ?? null,
      [CONTRACT_NAMES.L2stETH]:
        LIDO_L2_CONTRACT_ADDRESSES[chainId]?.['steth'] ?? null,
      [CONTRACT_NAMES.L2wstETH]:
        LIDO_L2_CONTRACT_ADDRESSES[chainId]?.['wsteth'] ?? null,
      [CONTRACT_NAMES.ensPublicResolver]:
        chainId === mainnet.id
          ? '0x4976fb03c32e5b8cfe2b6ccb31c09ba78ebaba41'
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
          getWithdrawalQueueAddress(chainId) ?? null,
        [CONTRACT_NAMES.lido]:
          getRateTokenAddress(chainId, LIDO_TOKENS.steth) ?? null,
        [CONTRACT_NAMES.wsteth]:
          getRateTokenAddress(chainId, LIDO_TOKENS.wsteth) ?? null,
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
