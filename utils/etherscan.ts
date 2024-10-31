import { mainnet } from 'viem/chains';
import { wagmiChainMap } from 'modules/web3/web3-provider/web3-provider';

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
  const wagmiChain = wagmiChainMap[chainId] ?? mainnet;
  return wagmiChain?.blockExplorers?.default?.url
    ? `${wagmiChain.blockExplorers.default.url}/${entity}/${hash}`
    : // Most likely this fallback will never work
      `https://etherscan1.io/${entity}/${hash}`;
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
