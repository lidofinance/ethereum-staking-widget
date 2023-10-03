import getConfig from 'next/config';
const { serverRuntimeConfig } = getConfig();
import dynamics from './dynamics';

// TODO: get from serverRuntimeConfig or?
const { basePath = '' } = serverRuntimeConfig;

export const BASE_PATH_ASSET = dynamics.ipfsMode ? '.' : basePath;
