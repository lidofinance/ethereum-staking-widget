import invariant from 'tiny-invariant';
import { wagmiChainMap } from 'modules/web3';

export enum ETHERSCAN_ENTITIES {
  TX = 'tx',
  TOKEN = 'token',
  ADDRESS = 'address',
}

export const getEtherscanLink = (
  chainId: number,
  hash: string,
  entity: ETHERSCAN_ENTITIES,
): string => {
  const wagmiChain = wagmiChainMap[chainId];
  invariant(wagmiChain, `chainId ${chainId} is unknown by wagmiChainMap`);
  return `${wagmiChain?.blockExplorers?.default?.url}/${entity}/${hash}`;
};

export const getEtherscanTxLink = (chainId: number, hash: string): string => {
  return getEtherscanLink(chainId, hash, ETHERSCAN_ENTITIES.TX);
};

export const getEtherscanTokenLink = (
  chainId: number,
  hash: string,
): string => {
  return getEtherscanLink(chainId, hash, ETHERSCAN_ENTITIES.TOKEN);
};

export const getEtherscanAddressLink = (
  chainId: number,
  hash: string,
): string => {
  return getEtherscanLink(chainId, hash, ETHERSCAN_ENTITIES.ADDRESS);
};
