import { useMemo } from 'react';
import invariant from 'tiny-invariant';

import { ManifestSchema } from './validate';
import { getLocalFallbackManifest, getManifestKey } from './utils';
import type { ManifestConfig, ManifestEntry } from './types';

export const overrideManifestConfig = (
  config: ManifestEntry['config'],
  override: Partial<ManifestConfig> = {},
): ManifestEntry['config'] => {
  return {
    ...config,
    enabledWithdrawalDexes:
      override.enabledWithdrawalDexes ?? config.enabledWithdrawalDexes ?? [],
    featureFlags: { ...config.featureFlags, ...override.featureFlags },
    multiChainBanner: override.multiChainBanner ?? config.multiChainBanner,
    earnVaults: override.earnVaults ?? config.earnVaults,
    earnVaultsBanner: override.earnVaultsBanner ?? config.earnVaultsBanner,
    pages: { ...config.pages, ...override.pages },
    api: { ...config.api, ...override.api },
  };
};

export const getFallbackedManifestEntry = (
  prefetchedManifest: unknown,
  defaultChain: number,
  manifestOverride?: string,
): ManifestEntry => {
  const key = getManifestKey(defaultChain, manifestOverride);
  const parsing = ManifestSchema.safeParse(prefetchedManifest);

  if (parsing.success && parsing.data[key]) {
    return parsing.data[key];
  }

  const fallbackManifest = getLocalFallbackManifest();
  invariant(
    fallbackManifest[key],
    `Fallback manifest entry not found for key ${key}`,
  );

  return fallbackManifest[key];
};

export const useFallbackManifestEntry = (
  prefetchedManifest: unknown,
  defaultChain: number,
  manifestOverride?: string,
): ManifestEntry => {
  return useMemo(
    () =>
      getFallbackedManifestEntry(
        prefetchedManifest,
        defaultChain,
        manifestOverride,
      ),
    [prefetchedManifest, defaultChain, manifestOverride],
  );
};
