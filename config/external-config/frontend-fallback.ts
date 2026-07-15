import { useMemo } from 'react';
import invariant from 'tiny-invariant';

import { ManifestSchema } from './validate';
import { getLocalFallbackManifest, getManifestKey } from './utils';
import type { ManifestConfig, ManifestEntry } from './types';

export const overrideManifestConfig = (
  config: ManifestConfig,
  override: Partial<ManifestConfig> = {},
): ManifestConfig => {
  return {
    ...config,
    withdrawalDex: { ...config.withdrawalDex, ...override.withdrawalDex },
    featureFlags: { ...config.featureFlags, ...override.featureFlags },
    multiChainBanner: override.multiChainBanner ?? config.multiChainBanner,
    earnVaults: override.earnVaults ?? config.earnVaults,
    earnVaultsBanner: override.earnVaultsBanner ?? config.earnVaultsBanner,
    earnVaultAllocationLabelAllowlist:
      override.earnVaultAllocationLabelAllowlist ??
      config.earnVaultAllocationLabelAllowlist,
    earnVaultAllocationHiddenIds:
      override.earnVaultAllocationHiddenIds ??
      config.earnVaultAllocationHiddenIds,
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
  const parseResult = ManifestSchema.safeParse(prefetchedManifest);
  const fallbackManifest = getLocalFallbackManifest();

  if (parseResult.success) {
    const entry = parseResult.data[key];
    if (entry) return entry;
  }

  const fallbackEntry = fallbackManifest[key];
  invariant(fallbackEntry, `Fallback manifest entry not found for key ${key}`);

  return fallbackEntry;
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
