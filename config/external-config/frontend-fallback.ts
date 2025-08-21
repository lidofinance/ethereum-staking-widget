import { useMemo } from 'react';
import {
  Manifest,
  ManifestConfig,
  ManifestConfigPage,
  ManifestConfigPageList,
  ManifestEntry,
  isManifestValid,
} from 'config/external-config';
import { getDexConfig } from 'features/withdrawals/request/withdrawal-rates';
import { EARN_VAULTS } from 'features/earn/consts';

import FallbackLocalManifest from 'IPFS.json' assert { type: 'json' };

export const getBackwardCompatibleConfig = (
  config: ManifestEntry['config'],
  override: Partial<ManifestEntry['config']> = {},
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
    enabledWithdrawalDexes:
      override.enabledWithdrawalDexes ??
      config.enabledWithdrawalDexes?.filter((dex) => !!getDexConfig(dex)),
    featureFlags: { ...(config?.featureFlags ?? {}), ...override.featureFlags },
    multiChainBanner:
      override?.multiChainBanner ?? config?.multiChainBanner ?? [],
    earnVaults:
      override.earnVaults ??
      config.earnVaults?.filter((vault) => EARN_VAULTS.includes(vault.name)) ??
      [],
    pages: { ...pages, ...override.pages },
  };
};

export const getFallbackedManifestEntry = (
  prefetchedManifest: unknown,
  defaultChain: number,
): ManifestEntry => {
  const isValid = isManifestValid(prefetchedManifest, defaultChain);
  return isValid
    ? prefetchedManifest[defaultChain]
    : (FallbackLocalManifest as unknown as Manifest)[defaultChain];
};

export const useFallbackManifestEntry = (
  prefetchedManifest: unknown,
  defaultChain: number,
): ManifestEntry => {
  return useMemo(
    () => getFallbackedManifestEntry(prefetchedManifest, defaultChain),
    [prefetchedManifest, defaultChain],
  );
};
