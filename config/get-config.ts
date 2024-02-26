import { AddressZero } from '@ethersproject/constants';

import getConfigNext from 'next/config';
const { serverRuntimeConfig, publicRuntimeConfig } = getConfigNext();

import { default as dynamics } from './dynamics';
import * as cache from './groups/cache';
import * as estimate from './groups/estimate';
import * as ipfs from './groups/ipfs';
import * as locale from './groups/locale';
import * as stake from './groups/stake';
import * as withdrawalQueueEstimate from './groups/withdrawal-queue-estimate';

// TODO: type serverRuntimeConfig?
// type ConfigType = { isClientSide: boolean, isServerSide: boolean }
//   & typeof cache
//   & typeof estimate
//   & typeof ipfs
//   & typeof locale
//   & typeof rateLimit
//   & typeof rateLimit
//   & typeof stake
//   & typeof withdrawalQueueEstimate
//   & typeof dynamics;

export const getConfig = (): any => {
  const isClientSide = typeof window !== 'undefined';
  const isServerSide = typeof window === 'undefined';

  // TODO: another place
  const STAKE_FALLBACK_REFERRAL_ADDRESS = dynamics.ipfsMode
    ? ipfs.IPFS_REFERRAL_ADDRESS
    : AddressZero;

  // TODO: another place
  const BASE_PATH_ASSET = dynamics.ipfsMode
    ? '.'
    : serverRuntimeConfig.basePath || publicRuntimeConfig.basePath;

  return {
    isClientSide,
    isServerSide,

    ...cache,
    ...estimate,

    ...ipfs,
    ...locale,
    ...stake,
    ...withdrawalQueueEstimate,

    STAKE_FALLBACK_REFERRAL_ADDRESS,
    BASE_PATH_ASSET,

    // highest priority
    ...publicRuntimeConfig,
    ...(typeof window !== 'undefined' ? window.__env__ : dynamics),
    ...serverRuntimeConfig,
  };
};
