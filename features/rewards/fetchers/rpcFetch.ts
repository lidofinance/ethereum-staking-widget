import { BigNumber, ContractInterface, Contract } from 'ethers';
import { isAddress } from 'ethers/lib/utils';
import get from 'lodash/get';

import { StaticJsonRpcBatchProvider } from '@lidofinance/eth-providers';
import { CHAINS } from '@lido-sdk/constants';

import STETH_ABI from 'abi/steth.abi.json';

const CURVE_ABI = [
  {
    name: 'get_dy',
    outputs: [{ type: 'uint256', name: '' }],
    inputs: [
      { type: 'int128', name: 'i' },
      { type: 'int128', name: 'j' },
      { type: 'uint256', name: 'dx' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];

const TOKENS = {
  ETH: 'ETH',
  STETH: 'stETH',
  WSTETH: 'wstETH',
  CURVE: 'curve',
  LDO: 'LDO',
  LDO_REWARDS: 'LDO_Rewards',
} as const;
export type TOKENS = (typeof TOKENS)[keyof typeof TOKENS];

export const TOKENS_BY_CHAIN_ID = {
  [CHAINS.Mainnet]: [TOKENS.STETH, TOKENS.WSTETH, TOKENS.CURVE],
  [CHAINS.Rinkeby]: [TOKENS.STETH, TOKENS.WSTETH],
  [CHAINS.Goerli]: [TOKENS.STETH, TOKENS.LDO_REWARDS, TOKENS.WSTETH],
} as const;

export const TOKEN_ADDRESS_BY_CHAIN_ID = {
  [CHAINS.Mainnet]: {
    [TOKENS.STETH]: '0xae7ab96520de3a18e5e111b5eaab095312d7fe84',
    [TOKENS.CURVE]: '0xDC24316b9AE028F1497c275EB9192a3Ea0f67022',
  },
  [CHAINS.Ropsten]: {},
  [CHAINS.Rinkeby]: {
    [TOKENS.STETH]: '0xbA453033d328bFdd7799a4643611b616D80ddd97',
  },
  [CHAINS.Goerli]: {
    [TOKENS.STETH]: '0x1643e812ae58766192cf7d2cf9567df2c37e9b7f',
  },
  [CHAINS.Kovan]: {},
} as const;

export const TOKEN_ABI_BY_CHAIN_ID = {
  [CHAINS.Mainnet]: {
    [TOKENS.STETH]: STETH_ABI,
    [TOKENS.CURVE]: CURVE_ABI,
  },
  [CHAINS.Ropsten]: {},
  [CHAINS.Rinkeby]: {
    [TOKENS.STETH]: STETH_ABI,
  },
  [CHAINS.Goerli]: {
    [TOKENS.STETH]: STETH_ABI,
  },
  [CHAINS.Kovan]: {},
} as const;

export const getTokenAddress = (
  chainId: CHAINS,
  token: TOKENS,
): string | undefined => get(TOKEN_ADDRESS_BY_CHAIN_ID, [chainId, token]);

export const getTokenAbi = (
  chainId: CHAINS,
  token: TOKENS,
): ContractInterface | undefined =>
  get(TOKEN_ABI_BY_CHAIN_ID, [chainId, token]);

// Transforms into [[address, abi], ...]
export const getSwrTokenConfig = (chainId: CHAINS) => {
  const tokens = get(TOKENS_BY_CHAIN_ID, chainId, []) as TOKENS[];
  const config = tokens.reduce<[string, ContractInterface][]>(
    (arr, tokenName) => {
      const address = getTokenAddress(chainId, tokenName);
      const abi = getTokenAbi(chainId, tokenName);
      if (address && abi) arr.push([address, abi]);
      return arr;
    },
    [],
  );
  return config;
};

// Returns { address, abi } by tokenName
export const getTokenConfig = (chainId: CHAINS, tokenName: TOKENS) => ({
  address: getTokenAddress(chainId, tokenName),
  abi: getTokenAbi(chainId, tokenName),
});

export const GAS_LIMITS_BY_TOKEN = {
  [TOKENS.STETH]: {
    submit: BigNumber.from(120000),
  },
};

// TODO: Migrate to typechain for properly methods and arguments typings
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rpcFetcher = <Result>(
  mainnetProvider: StaticJsonRpcBatchProvider,
  args: any[],
): Promise<Result> => {
  mainnetProvider.pollingInterval = 30000;
  const ABIs = new Map(getSwrTokenConfig(1));

  const [arg1, arg2, ...params] = args;

  // it's a contract
  if (isAddress(arg1)) {
    if (!ABIs) throw new Error('ABI repo not found');
    if (!ABIs.get) throw new Error("ABI repo isn't a Map");

    const address = arg1;
    const method = arg2;
    const abi = ABIs.get(address);

    if (!abi) throw new Error(`ABI not found for ${address}`);
    const contract = new Contract(address, abi, mainnetProvider);
    return contract[method](...params);
  }

  // it's a eth call
  const method = arg1;

  // TODO: Migrate to typechain for properly methods and arguments typings
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (mainnetProvider as any)[method](arg2, ...params);
};

export default rpcFetcher;
