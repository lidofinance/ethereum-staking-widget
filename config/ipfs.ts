import getConfig from 'next/config';
import dynamics from './dynamics';

const { serverRuntimeConfig } = getConfig();
const { basePath = '' } = serverRuntimeConfig;

export const BASE_PATH_ASSET = dynamics.ipfsMode ? '.' : basePath;
export const IPFS_REFERRAL_ADDRESS =
  '0x74d6e4Fd83A0b5623BDE3B2dF9a9A7F31fE02325';
