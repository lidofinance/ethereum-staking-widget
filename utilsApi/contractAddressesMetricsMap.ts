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

export const CONTRACT_NAMES = {
  stETH: 'stETH',
  wstETH: 'wstETH',
  WithdrawalQueue: 'WithdrawalQueue',
  Aggregator: 'Aggregator',
  AggregatorStEthUsdPriceFeed: 'AggregatorStEthUsdPriceFeed',
} as const;
export type CONTRACT_NAMES = keyof typeof CONTRACT_NAMES;

export const METRIC_CONTRACT_ABIS = {
  [CONTRACT_NAMES.stETH]: StethAbiFactory.abi,
  [CONTRACT_NAMES.wstETH]: WstethAbiFactory.abi,
  [CONTRACT_NAMES.WithdrawalQueue]: WithdrawalQueueAbiFactory.abi,
  [CONTRACT_NAMES.Aggregator]: AggregatorAbiFactory.abi,
  [CONTRACT_NAMES.AggregatorStEthUsdPriceFeed]: AggregatorAbiFactory.abi,
} as const;

export const getMetricContractInterface = memoize(
  (contractName: CONTRACT_NAMES) =>
    new utils.Interface(METRIC_CONTRACT_ABIS[contractName]),
);

const getAddressOrNull = <
  G extends (...args: any) => string,
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
    };
    return {
      ...mapped,
      [chainId]: invert(omitBy(map, isNull)),
    };
  },
  {} as Record<CHAINS, Record<`0x${string}`, CONTRACT_NAMES>>,
);
