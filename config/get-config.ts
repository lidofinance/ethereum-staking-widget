import { KNOWN_CHAIN_IDS } from './chains';
import { getPreConfig, PreConfigType } from './get-preconfig';
import * as cache from './groups/cache';
import * as ipfs from './groups/ipfs';
import * as locale from './groups/locale';
import * as stake from './groups/stake';
import * as web3 from './groups/web3';
import * as withdrawalQueueEstimate from './groups/withdrawal-queue-estimate';

export type ConfigType = typeof cache &
  typeof ipfs &
  typeof web3 &
  typeof locale &
  typeof stake &
  typeof withdrawalQueueEstimate &
  PreConfigType;

export const getConfig = (): ConfigType => {
  const preConfig = getPreConfig();
  return {
    ...cache,
    ...web3,
    ...ipfs,
    ...locale,
    ...stake,
    ...withdrawalQueueEstimate,

    // highest priority
    ...preConfig,
    supportedChains: preConfig.supportedChains.filter((id) =>
      KNOWN_CHAIN_IDS.has(id),
    ),
  };
};

export const config = getConfig();
