import { CHAINS } from 'utils/chains';
import { StethAbi__factory } from 'generated';

// DELETE: use https://github.com/lidofinance/lido-js-sdk/blob/cd47110a0fa346d8ff699dc900694fdc588584a7/packages/constants/src/tokens.ts#L33
export const STETH_BY_NETWORK: {
  [key in CHAINS]: string;
} = {
  [CHAINS.Mainnet]: '0xae7ab96520de3a18e5e111b5eaab095312d7fe84',
  [CHAINS.Goerli]: '0x1643e812ae58766192cf7d2cf9567df2c37e9b7f',
};

// DELETE: use https://github.com/lidofinance/lido-js-sdk/blob/cd47110a0fa346d8ff699dc900694fdc588584a7/packages/constants/src/tokens.ts#L33
export const getStethAddress = (chainId: CHAINS): string => {
  return STETH_BY_NETWORK[chainId];
};

export type ContractSteth = typeof StethAbi__factory;

export const getStethContractFactory = (): ContractSteth => {
  return StethAbi__factory;
};

export const STETH_SUBMIT_GAS_LIMIT_DEFAULT = 90000;
