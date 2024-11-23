import { Abi, getAddress } from 'viem';
import type { Address } from 'viem';
import { mainnet } from 'viem/chains';
import { invert, isNull, memoize, omitBy } from 'lodash';

import { LidoSDK } from '@lidofinance/lido-ethereum-sdk';
import {
  LIDO_LOCATOR_BY_CHAIN,
  LIDO_L2_CONTRACT_ADDRESSES,
  LIDO_CONTRACT_NAMES,
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

import { config, secretConfig } from 'config';
import { isSDKSupportedL2Chain } from 'consts/chains';
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

// Utility to add a timeout to a promise
const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Request timed out')), ms),
  );
  return Promise.race([promise, timeout]);
};

const lidoSDKs = supportedChainsWithMainnet.reduce<Record<number, LidoSDK>>(
  (acc, chainId) => {
    const rpcUrlKey = `rpcUrls_${chainId}` as keyof typeof secretConfig;
    const rpcUrls = secretConfig[rpcUrlKey];

    if (!rpcUrls) {
      console.error(`RPC URL not found for chainId: ${chainId}`);
      // Skip if RPC URL is missing
      return acc;
    }

    acc[chainId] = new LidoSDK({
      // @ts-expect-error: typing, there are enough params
      rpcUrls: Array.isArray(rpcUrls) ? rpcUrls : [rpcUrls],
      chainId,
    });

    return acc;
  },
  {},
);

const getAddressOrNull = async (
  chainId: number,
  contractName: CONTRACT_NAMES,
): Promise<Address | null> => {
  try {
    // Bad function naming.
    // Check is needed so that L2 does not execute the code below
    if (isSDKSupportedL2Chain(chainId)) {
      return null;
    }

    const sdk = lidoSDKs[chainId];
    if (!sdk) {
      console.error(`SDK not initialized for chainId: ${chainId}`);
      return null;
    }

    const address = await withTimeout(
      sdk.core.getContractAddress(contractName as LIDO_CONTRACT_NAMES),
      3000, // 3 second timeout
    );
    return address ? getAddress(address) : null;
  } catch (error) {
    console.error(
      `Failed to fetch address for ${contractName} on chainId ${chainId}:`,
      error,
    );
    return null;
  }
};

export let metricContractAddresses:
  | Record<CHAINS, Record<Address, CONTRACT_NAMES>>
  | undefined = undefined;
export let metricContractEventAddresses:
  | Record<CHAINS, Record<Address, CONTRACT_NAMES>>
  | undefined = undefined;

export const initializeMetricContractAddresses = async () => {
  try {
    const [_metricContractAddresses, _metricContractEventAddresses] =
      await Promise.all([initializeAddresses(), initializeEventAddresses()]);

    metricContractAddresses = _metricContractAddresses;
    metricContractEventAddresses = _metricContractEventAddresses;

    return {
      metricContractAddresses: _metricContractAddresses,
      metricContractEventAddresses: _metricContractEventAddresses,
    };
  } catch (error) {
    console.error('Failed to initialize contract addresses:', error);
    throw error;
  }
};

const initializeAddresses = async () => {
  const addresses = await Promise.allSettled(
    supportedChainsWithMainnet.map(async (chainId) => {
      const map = {
        [CONTRACT_NAMES.lido]: await getAddressOrNull(
          chainId,
          CONTRACT_NAMES.lido,
        ),
        [CONTRACT_NAMES.wsteth]: await getAddressOrNull(
          chainId,
          CONTRACT_NAMES.wsteth,
        ),
        [CONTRACT_NAMES.withdrawalQueue]: await getAddressOrNull(
          chainId,
          CONTRACT_NAMES.withdrawalQueue,
        ),
        [CONTRACT_NAMES.aggregator]:
          AGGREGATOR_STETH_USD_PRICE_FEED_BY_NETWORK[chainId] ?? null,
        [CONTRACT_NAMES.aggregatorStEthUsdPriceFeed]:
          AGGREGATOR_STETH_USD_PRICE_FEED_BY_NETWORK[chainId] ?? null,
        [CONTRACT_NAMES.stakingRouter]: await getAddressOrNull(
          chainId,
          CONTRACT_NAMES.stakingRouter,
        ),
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

      const inverted = Object.entries(invert(omitBy(map, isNull))).reduce(
        (acc, [key, value]) => {
          acc[key as Address] = value as CONTRACT_NAMES;
          return acc;
        },
        {} as Record<Address, CONTRACT_NAMES>,
      );

      return { chainId, addresses: inverted };
    }),
  );

  return addresses.reduce(
    (acc, result) => {
      if (result.status === 'fulfilled') {
        const { chainId, addresses } = result.value;
        acc[chainId] = addresses;
      } else {
        console.error(`Failed to initialize addresses:`, result.reason);
      }
      return acc;
    },
    {} as Record<CHAINS, Record<Address, CONTRACT_NAMES>>,
  );
};

const initializeEventAddresses = async () => {
  const eventAddresses = await Promise.allSettled(
    supportedChainsWithMainnet.map(async (chainId) => {
      const map = {
        [CONTRACT_NAMES.lido]: await getAddressOrNull(
          chainId,
          CONTRACT_NAMES.lido,
        ),
        [CONTRACT_NAMES.wsteth]: await getAddressOrNull(
          chainId,
          CONTRACT_NAMES.wsteth,
        ),
        [CONTRACT_NAMES.L2stETH]:
          LIDO_L2_CONTRACT_ADDRESSES[chainId]?.['steth'] ?? null,
        [CONTRACT_NAMES.L2wstETH]:
          LIDO_L2_CONTRACT_ADDRESSES[chainId]?.['wsteth'] ?? null,
      };

      const inverted = Object.entries(invert(omitBy(map, isNull))).reduce(
        (acc, [key, value]) => {
          acc[key as Address] = value as CONTRACT_NAMES;
          return acc;
        },
        {} as Record<Address, CONTRACT_NAMES>,
      );

      return { chainId, addresses: inverted };
    }),
  );

  return eventAddresses.reduce(
    (acc, result) => {
      if (result.status === 'fulfilled') {
        const { chainId, addresses } = result.value;
        acc[chainId] = addresses;
      } else {
        console.error(`Failed to initialize event addresses:`, result.reason);
      }
      return acc;
    },
    {} as Record<CHAINS, Record<Address, CONTRACT_NAMES>>,
  );
};
