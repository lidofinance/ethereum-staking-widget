import getConfig from 'next/config';
const { serverRuntimeConfig } = getConfig();
import dynamics from './dynamics';

// TODO: https://github.com/search?q=repo%3Alidofinance%2Flido-anchor-widget+IPFS_MODE&type=code
const { basePath = '' } = serverRuntimeConfig;

export const BASE_PATH_ASSET = dynamics.ipfsMode ? '.' : basePath;
