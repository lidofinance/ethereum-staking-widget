import { useMemo } from 'react';
import {
  Manifest,
  ManifestConfig,
  ManifestConfigPage,
  ManifestConfigPageList,
  ManifestEntry,
} from './types';
import { isManifestValid } from 'utils/validate-ipfs-json';
import { getDexConfig } from 'features/withdrawals/request/withdrawal-rates';

import FallbackLocalManifest from 'IPFS.json' assert { type: 'json' };

export const getBackwardCompatibleConfig = (
  config: ManifestEntry['config'],
): ManifestEntry['config'] => {
  let pages: ManifestConfig['pages'];
  const configPages = config.pages;
  if (configPages) {
    pages = (Object.keys(configPages) as ManifestConfigPage[])
      .filter((key) => ManifestConfigPageList.has(key))
      .reduce(
        (acc, key) => {
          if (acc) {
            acc[key] = { ...configPages[key] };
          }

          return acc;
        },
        {} as ManifestConfig['pages'],
      );
  }

  return {
    enabledWithdrawalDexes: config.enabledWithdrawalDexes.filter(
      (dex) => !!getDexConfig(dex),
    ),
    featureFlags: { ...(config.featureFlags ?? {}) },
    multiChainBanner: config.multiChainBanner ?? [],
    pages,
  };
};

export const useFallbackManifestEntry = (
  prefetchedManifest: unknown,
  chain: number,
): ManifestEntry => {
  return useMemo(() => {
    const isValid = isManifestValid(prefetchedManifest, chain);
    return isValid
      ? prefetchedManifest[chain]
      : (FallbackLocalManifest as unknown as Manifest)[chain];
  }, [prefetchedManifest, chain]);
};
