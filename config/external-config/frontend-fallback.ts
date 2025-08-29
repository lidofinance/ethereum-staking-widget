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
): ManifestEntry['config'] => {
  const pages = (Object.keys(config?.pages ?? {}) as ManifestConfigPage[])
    .filter((key) => ManifestConfigPageList.has(key))
    .reduce(
      (acc, key) => {
        if (acc) {
          acc[key] = { ...config.pages[key] };
        }

        return acc;
      },
      {} as ManifestConfig['pages'],
    );

  return {
    enabledWithdrawalDexes: config.enabledWithdrawalDexes?.filter(
      (dex) => !!getDexConfig(dex),
    ),
    featureFlags: { ...(config?.featureFlags ?? {}) },
    multiChainBanner: config?.multiChainBanner ?? [],
    earnVaults:
      config.earnVaults?.filter((vault) => EARN_VAULTS.includes(vault.name)) ??
      [],
    pages: { ...pages },
  };
};

export const overrideManifestConfig = (
  config: ManifestEntry['config'],
  override: Partial<ManifestEntry['config']> = {},
): ManifestEntry['config'] => {
  return {
    ...config,
    enabledWithdrawalDexes:
      override.enabledWithdrawalDexes ?? config.enabledWithdrawalDexes,
    featureFlags: { ...config.featureFlags, ...override.featureFlags },
    multiChainBanner: override.multiChainBanner ?? config.multiChainBanner,
    earnVaults: override.earnVaults ?? config.earnVaults,
    pages: { ...config.pages, ...override.pages },
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
