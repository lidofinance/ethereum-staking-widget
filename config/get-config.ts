import { getPreConfig, PreConfigType } from './get-preconfig';
import * as cache from './groups/cache';
import * as estimate from './groups/estimate';
import * as ipfs from './groups/ipfs';
import * as locale from './groups/locale';
import * as stake from './groups/stake';
import * as withdrawalQueueEstimate from './groups/withdrawal-queue-estimate';

export type ConfigType = {
  isClientSide: boolean;
  isServerSide: boolean;
} & typeof cache &
  typeof estimate &
  typeof ipfs &
  typeof locale &
  typeof stake &
  typeof withdrawalQueueEstimate &
  PreConfigType;

export const getConfig = (): ConfigType => {
  return {
    isClientSide: typeof window !== 'undefined',
    isServerSide: typeof window === 'undefined',

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

export const config = getConfig();
