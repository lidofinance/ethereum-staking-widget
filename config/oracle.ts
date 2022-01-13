import { CHAINS } from '@lido-sdk/constants';
import { OracleAbi__factory } from 'generated';

export const ORACLE_BY_NETWORK: {
  [key in CHAINS]: string;
} = {
  [CHAINS.Mainnet]: '0x442af784A788A5bd6F42A01Ebe9F287a871243fb',
  [CHAINS.Ropsten]: '0x0000000000000000000000000000000000000000',
  [CHAINS.Rinkeby]: '0x0000000000000000000000000000000000000000',
  [CHAINS.Goerli]: '0x0000000000000000000000000000000000000000',
  [CHAINS.Kovan]: '0x0000000000000000000000000000000000000000',
  [CHAINS.Kintsugi]: '0x0000000000000000000000000000000000000000',
};

export const getOracleAddress = (chainId: CHAINS): string => {
  return ORACLE_BY_NETWORK[chainId];
};

export type ContractOracle = typeof OracleAbi__factory;

export const getOracleContractFactory = (): ContractOracle => {
  return OracleAbi__factory;
};
