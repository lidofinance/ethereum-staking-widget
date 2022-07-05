import { CHAINS } from '@lido-sdk/constants';
import invariant from 'tiny-invariant';

export const getInfuraRPCUrl = (chainId: CHAINS, apiKey: string): string => {
  invariant(apiKey && typeof apiKey === 'string', 'API key should be a string');

  switch (chainId) {
    case CHAINS.Mainnet:
      return `https://mainnet.infura.io/v3/${apiKey}`;
    case CHAINS.Ropsten:
      return `https://ropsten.infura.io/v3/${apiKey}`;
    case CHAINS.Rinkeby:
      return `https://rinkeby.infura.io/v3/${apiKey}`;
    case CHAINS.Goerli:
      return `https://goerli.infura.io/v3/${apiKey}`;
    case CHAINS.Kovan:
      return `https://kovan.infura.io/v3/${apiKey}`;
    default:
      invariant(false, 'Chain is not supported');
  }
};

export const getAlchemyRPCUrl = (chainId: CHAINS, apiKey: string): string => {
  invariant(apiKey && typeof apiKey === 'string', 'API key should be a string');

  switch (chainId) {
    case CHAINS.Mainnet:
      return `https://eth-mainnet.alchemyapi.io/v2/${apiKey}`;
    case CHAINS.Ropsten:
      return `https://eth-ropsten.alchemyapi.io/v2/${apiKey}`;
    case CHAINS.Rinkeby:
      return `https://eth-rinkeby.alchemyapi.io/v2/${apiKey}`;
    case CHAINS.Goerli:
      return `https://eth-goerli.alchemyapi.io/v2/${apiKey}`;
    case CHAINS.Kovan:
      return `https://eth-kovan.alchemyapi.io/v2/${apiKey}`;
    default:
      invariant(false, 'Chain is not supported');
  }
};

export interface RPCProvidersKeys {
  infura?: string;
  alchemy?: string;
}

export const getRPCUrls = (
  chainId: CHAINS,
  keys: RPCProvidersKeys,
): string[] => {
  const urls = [];

  if (keys.infura) urls.push(getInfuraRPCUrl(chainId, keys.infura));
  if (keys.alchemy) urls.push(getAlchemyRPCUrl(chainId, keys.alchemy));

  return urls;
};
