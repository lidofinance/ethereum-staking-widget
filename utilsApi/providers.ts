import getConfig from 'next/config';
import { Providers } from 'backend-blocks/types';

const { serverRuntimeConfig } = getConfig();
const { infuraApiKey, alchemyApiKey } = serverRuntimeConfig;

export const providers: Providers = {
  1: [
    // Will produce network error
    `https://example.co`,
    // Will produce RPC error
    `https://mainnet.infura.io/v3/1111`,
    `https://mainnet.infura.io/v3/${infuraApiKey}`,
    `https://eth-mainnet.alchemyapi.io/v2/${alchemyApiKey}`,
  ],
  5: [
    // Will produce network error
    `https://example.co`,
    // Will produce RPC error
    `https://goerli.infura.io/v3/1111`,
    `https://goerli.infura.io/v3/${infuraApiKey}`,
    `https://eth-goerli.alchemyapi.io/v2/${alchemyApiKey}`,
  ],
};
