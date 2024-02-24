import { getOneConfig } from './one-config/utils';
const { ipfsMode, basePath = '' } = getOneConfig();

// TODO: move to OneConfig
export const BASE_PATH_ASSET = ipfsMode ? '.' : basePath;
// TODO: move to OneConfig
export const IPFS_REFERRAL_ADDRESS =
  '0x74d6e4Fd83A0b5623BDE3B2dF9a9A7F31fE02325';
