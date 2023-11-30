import getConfig from 'next/config';
import dynamics from './dynamics';

const { serverRuntimeConfig } = getConfig();
const { basePath = '' } = serverRuntimeConfig;

export const BASE_PATH_ASSET = dynamics.ipfsMode ? '.' : basePath;
