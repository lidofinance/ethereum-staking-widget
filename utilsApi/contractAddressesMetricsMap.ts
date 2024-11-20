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
import { StethAbi } from '@lidofinance/lido-ethereum-sdk/stake';
import { WithdrawalQueueAbi } from '@lidofinance/lido-ethereum-sdk/withdraw';
import { WstethABI } from '@lidofinance/lido-ethereum-sdk/wrap';
import {
  bridgedWstethAbi,
  rebasableL2StethAbi,
} from '@lidofinance/lido-ethereum-sdk/l2';

import { PartialCurveAbi } from 'abi/partial-curve-abi';
import { PartialStakingRouterAbi } from 'abi/partial-staking-router';
import { LidoLocatorAbi } from 'abi/lido-locator';
import { ENSRegistryAbi } from 'abi/ens-registry-abi';
import { ENSResolverAbi } from 'abi/ens-resolver-abi';

import { config, secretConfig } from 'config';
import { isSDKSupportedL2Chain } from 'consts/chains';
// import { getAggregatorStEthUsdPriceFeedAddress } from 'consts/aggregator';
import { MAINNET_CURVE } from 'features/rewards/hooks/use-steth-eth-rate';

export const CONTRACT_NAMES = {
  lido: 'lido',
  wsteth: 'wsteth',
  L2stETH: 'L2stETH',
  L2wstETH: 'L2wstETH',
  withdrawalQueue: 'withdrawalQueue',
  // aggregator: 'aggregator',
  // aggregatorStEthUsdPriceFeed: 'aggregatorStEthUsdPriceFeed',
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
  // TODO
  // [CONTRACT_NAMES.aggregator]: AggregatorAbiFactory.abi,
  // [CONTRACT_NAMES.aggregatorStEthUsdPriceFeed]: AggregatorAbiFactory.abi,
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
      // Skip if sdk is missing
      return null;
    }

    const address = await sdk.core.getContractAddress(
      contractName as LIDO_CONTRACT_NAMES,
    );
    return address ? getAddress(address) : null;
    return null;
  } catch (error) {
    console.error(
      `Failed to fetch address for ${contractName} on chainId ${chainId}:`,
      error,
    );
    return null;
  }
};

export const initializeMetricContractAddresses = async () => {
  const metricContractAddresses = await Promise.all(
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
        // TODO
        // [CONTRACT_NAMES.aggregator]: await getAddressOrNull(
        //   chainId,
        //   CONTRACT_NAMES.aggregator,
        // ),
        // [CONTRACT_NAMES.aggregatorStEthUsdPriceFeed]: await getAddressOrNull(
        //   chainId,
        //   CONTRACT_NAMES.aggregatorStEthUsdPriceFeed,
        // ),
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
          const typedKey = key as Address;
          acc[typedKey] = value as CONTRACT_NAMES;
          return acc;
        },
        {} as Record<Address, CONTRACT_NAMES>,
      );

      return {
        chainId,
        addresses: inverted,
      };
    }),
  ).then((results) =>
    results.reduce(
      (acc, { chainId, addresses }) => {
        acc[chainId] = addresses;
        return acc;
      },
      {} as Record<CHAINS, Record<Address, CONTRACT_NAMES>>,
    ),
  );

  const metricContractEventAddresses = await Promise.all(
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
          const typedKey = key as Address;
          acc[typedKey] = value as CONTRACT_NAMES;
          return acc;
        },
        {} as Record<Address, CONTRACT_NAMES>,
      );

      return {
        chainId,
        addresses: inverted,
      };
    }),
  ).then((results) =>
    results.reduce(
      (acc, { chainId, addresses }) => {
        acc[chainId] = addresses;
        return acc;
      },
      {} as Record<CHAINS, Record<Address, CONTRACT_NAMES>>,
    ),
  );

  return {
    metricContractAddresses,
    metricContractEventAddresses,
  };
};
