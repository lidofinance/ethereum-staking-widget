import getConfig from 'next/config';
import { CHAINS } from 'utils/chains';

const { serverRuntimeConfig } = getConfig();
const { infuraApiKey, alchemyApiKey } = serverRuntimeConfig;

export const rpcUrls: Record<CHAINS, [string, ...string[]]> = {
  [CHAINS.Mainnet]: [
    `https://eth-mainnet.alchemyapi.io/v2/${alchemyApiKey}`,
    `https://mainnet.infura.io/v3/${infuraApiKey}`,
  ],
  [CHAINS.Goerli]: [
    `https://eth-goerli.alchemyapi.io/v2/${alchemyApiKey}`,
    `https://goerli.infura.io/v3/${infuraApiKey}`,
  ],
  [CHAINS.Zhejiang]: ['https://rpc.zhejiang.ethpandaops.io'],
};
