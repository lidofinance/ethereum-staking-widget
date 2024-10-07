import { utils } from 'ethers';
import { invert, isNull, memoize, omitBy } from 'lodash';

import {
  CHAINS,
  TOKENS,
  getTokenAddress,
  getAggregatorAddress,
  getWithdrawalQueueAddress,
} from '@lido-sdk/constants';
import {
  StethAbiFactory,
  WithdrawalQueueAbiFactory,
  WstethAbiFactory,
  AggregatorAbiFactory,
} from '@lido-sdk/contracts';

import { config } from 'config';
import { getAggregatorStEthUsdPriceFeedAddress } from 'consts/aggregator';
import {
  PartialCurveAbiAbi__factory,
  PartialStakingRouterAbi__factory,
  LidoLocatorAbi__factory,
  L2StethAbi__factory,
  L2WstesthAbi__factory,
} from 'generated';
import { getStakingRouterAddress } from 'consts/staking-router';
import { MAINNET_CURVE } from 'features/rewards/hooks/use-steth-eth-rate';
import {
  LIDO_LOCATOR_BY_CHAIN,
  LIDO_L2_CONTRACT_ADDRESSES,
  CHAINS as CHAIN_SDK,
} from '@lidofinance/lido-ethereum-sdk';

export const CONTRACT_NAMES = {
  stETH: 'stETH',
  wstETH: 'wstETH',
  L2stETH: 'L2stETH',
  L2wstETH: 'L2wstETH',
  WithdrawalQueue: 'WithdrawalQueue',
  Aggregator: 'Aggregator',
  AggregatorStEthUsdPriceFeed: 'AggregatorStEthUsdPriceFeed',
  StakingRouter: 'StakingRouter',
  StethCurve: 'StethCurve',
  LidoLocator: 'LidoLocator',
} as const;
export type CONTRACT_NAMES = keyof typeof CONTRACT_NAMES;

export const METRIC_CONTRACT_ABIS = {
  [CONTRACT_NAMES.stETH]: StethAbiFactory.abi,
  [CONTRACT_NAMES.wstETH]: WstethAbiFactory.abi,
  [CONTRACT_NAMES.WithdrawalQueue]: WithdrawalQueueAbiFactory.abi,
  [CONTRACT_NAMES.Aggregator]: AggregatorAbiFactory.abi,
  [CONTRACT_NAMES.AggregatorStEthUsdPriceFeed]: AggregatorAbiFactory.abi,
  [CONTRACT_NAMES.StakingRouter]: PartialStakingRouterAbi__factory.abi,
  [CONTRACT_NAMES.StethCurve]: PartialCurveAbiAbi__factory.abi,
  [CONTRACT_NAMES.LidoLocator]: LidoLocatorAbi__factory.abi,
  [CONTRACT_NAMES.L2stETH]: L2StethAbi__factory.abi,
  [CONTRACT_NAMES.L2wstETH]: L2WstesthAbi__factory.abi,
} as const;

export const getMetricContractInterface = memoize(
  (contractName: CONTRACT_NAMES) =>
    new utils.Interface(METRIC_CONTRACT_ABIS[contractName]),
);

const getAddressOrNull = <
  G extends (...args: any) => string | null,
  A extends Parameters<G>,
>(
  getter: G,
  ...args: A
) => {
  try {
    const address = getter(...args);
    return address ? utils.getAddress(address) : null;
  } catch (error) {
    return null;
  }
};

// TODO rework to viem and remove typechain
export const METRIC_CONTRACT_ADDRESSES = (
  config.supportedChains as CHAINS[]
).reduce(
  (mapped, chainId) => {
    const map = {
      [CONTRACT_NAMES.stETH]: getAddressOrNull(
        getTokenAddress,
        chainId,
        TOKENS.STETH,
      ),
      [CONTRACT_NAMES.wstETH]: getAddressOrNull(
        getTokenAddress,
        chainId,
        TOKENS.WSTETH,
      ),
      [CONTRACT_NAMES.WithdrawalQueue]: getAddressOrNull(
        getWithdrawalQueueAddress,
        chainId,
      ),
      [CONTRACT_NAMES.Aggregator]: getAddressOrNull(
        getAggregatorAddress,
        chainId,
      ),
      [CONTRACT_NAMES.AggregatorStEthUsdPriceFeed]: getAddressOrNull(
        getAggregatorStEthUsdPriceFeedAddress,
        chainId,
      ),
      [CONTRACT_NAMES.StakingRouter]: getAddressOrNull(
        getStakingRouterAddress,
        chainId,
      ),
      [CONTRACT_NAMES.StethCurve]: getAddressOrNull((chainId: CHAINS) => {
        if (chainId === 1) return MAINNET_CURVE;
        return null;
      }, chainId),
      [CONTRACT_NAMES.LidoLocator]: getAddressOrNull((chainId: CHAINS) => {
        return (LIDO_LOCATOR_BY_CHAIN as any)[chainId] as string;
      }, chainId),
      [CONTRACT_NAMES.L2stETH]: getAddressOrNull((chainId: CHAINS) => {
        const chainIDSDK = chainId as unknown as CHAIN_SDK;
        return (
          (LIDO_L2_CONTRACT_ADDRESSES[chainIDSDK]?.['steth'] as string) ?? null
        );
      }, chainId),
      [CONTRACT_NAMES.L2wstETH]: getAddressOrNull((chainId: CHAINS) => {
        const chainIDSDK = chainId as unknown as CHAIN_SDK;
        return (
          (LIDO_L2_CONTRACT_ADDRESSES[chainIDSDK]?.['wsteth'] as string) ?? null
        );
      }, chainId),
    };
    return {
      ...mapped,
      [chainId]: invert(omitBy(map, isNull)),
    };
  },
  {} as Record<CHAINS, Record<`0x${string}`, CONTRACT_NAMES>>,
);

export const METRIC_CONTRACT_EVENT_ADDRESSES = (
  config.supportedChains as CHAINS[]
).reduce(
  (mapped, chainId) => {
    const map = {
      [CONTRACT_NAMES.stETH]: getAddressOrNull(
        getTokenAddress,
        chainId,
        TOKENS.STETH,
      ),
      [CONTRACT_NAMES.wstETH]: getAddressOrNull(
        getTokenAddress,
        chainId,
        TOKENS.WSTETH,
      ),
      [CONTRACT_NAMES.L2stETH]: getAddressOrNull((chainId: CHAINS) => {
        const chainIDSDK = chainId as unknown as CHAIN_SDK;
        return (
          (LIDO_L2_CONTRACT_ADDRESSES[chainIDSDK]?.['steth'] as string) ?? null
        );
      }, chainId),
      [CONTRACT_NAMES.L2wstETH]: getAddressOrNull((chainId: CHAINS) => {
        const chainIDSDK = chainId as unknown as CHAIN_SDK;
        return (
          (LIDO_L2_CONTRACT_ADDRESSES[chainIDSDK]?.['wsteth'] as string) ?? null
        );
      }, chainId),
    };
    return {
      ...mapped,
      [chainId]: invert(omitBy(map, isNull)),
    };
  },
  {} as Record<CHAINS, Record<`0x${string}`, CONTRACT_NAMES>>,
);
