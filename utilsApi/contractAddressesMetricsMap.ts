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
} from '@lido-sdk/contracts';
import { dynamics, getAggregatorStEthUsdPriceFeedAddress } from 'config';
import { utils } from 'ethers';
import {
  AggregatorAbi__factory,
  AggregatorEthUsdPriceFeedAbi__factory,
} from 'generated';
import { invert, isNull, memoize, omitBy } from 'lodash';

export const METRIC_CONTRACT_NAMES = {
  stETH: 'stETH',
  wstETH: 'wstETH',
  WithdrawalQueue: 'WithdrawalQueue',
  Aggregator: 'Aggregator',
  AggregatorStEthUsdPriceFeed: 'AggregatorStEthUsdPriceFeed',
} as const;
export type CONTRACT_NAMES = keyof typeof METRIC_CONTRACT_NAMES;

export const METRIC_CONTRACT_ABIS = {
  [METRIC_CONTRACT_NAMES.stETH]: StethAbiFactory.abi,
  [METRIC_CONTRACT_NAMES.wstETH]: WstethAbiFactory.abi,
  [METRIC_CONTRACT_NAMES.WithdrawalQueue]: WithdrawalQueueAbiFactory.abi,
  [METRIC_CONTRACT_NAMES.Aggregator]: AggregatorAbi__factory.abi,
  [METRIC_CONTRACT_NAMES.AggregatorStEthUsdPriceFeed]:
    AggregatorEthUsdPriceFeedAbi__factory.abi,
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
  dynamics.supportedChains as CHAINS[]
).reduce(
  (mapped, chainId) => {
    const map = {
      [METRIC_CONTRACT_NAMES.stETH]: getAddressOrNull(
        getTokenAddress,
        chainId,
        TOKENS.STETH,
      ),
      [METRIC_CONTRACT_NAMES.wstETH]: getAddressOrNull(
        getTokenAddress,
        chainId,
        TOKENS.WSTETH,
      ),
      [METRIC_CONTRACT_NAMES.WithdrawalQueue]: getAddressOrNull(
        getWithdrawalQueueAddress,
        chainId,
      ),
      [METRIC_CONTRACT_NAMES.Aggregator]: getAddressOrNull(
        getAggregatorAddress,
        chainId,
      ),
      [METRIC_CONTRACT_NAMES.AggregatorStEthUsdPriceFeed]: getAddressOrNull(
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
