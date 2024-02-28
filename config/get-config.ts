import { getPreConfig } from './get-preconfig';
import * as cache from './groups/cache';
import * as estimate from './groups/estimate';
import * as ipfs from './groups/ipfs';
import * as locale from './groups/locale';
import * as stake from './groups/stake';
import * as withdrawalQueueEstimate from './groups/withdrawal-queue-estimate';

// TODO: type
// type ConfigType = { isClientSide: boolean, isServerSide: boolean }
//   & typeof cache
//   & typeof estimate
//   & typeof ipfs
//   & typeof locale
//   & typeof rateLimit
//   & typeof rateLimit
//   & typeof stake
//   & typeof withdrawalQueueEstimate;

export const getConfig = (): any => {
  const isClientSide = typeof window !== 'undefined';
  const isServerSide = typeof window === 'undefined';

  return {
    isClientSide,
    isServerSide,

    ...cache,
    ...estimate,

    ...ipfs,
    ...locale,
    ...stake,
    ...withdrawalQueueEstimate,

    // highest priority
    ...getPreConfig(),
  };
};
