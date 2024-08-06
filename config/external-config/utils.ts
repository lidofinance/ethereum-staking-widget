import { useMemo } from 'react';
import type { Manifest, ManifestEntry } from './types';
import { getDexConfig } from 'features/withdrawals/request/withdrawal-rates';

import FallbackLocalManifest from 'IPFS.json' assert { type: 'json' };

// TODO: refactor on config expansion
export const isManifestEntryValid = (
  entry?: unknown,
): entry is ManifestEntry => {
  if (
    // entry = {}
    entry &&
    typeof entry === 'object' &&
    // entry.config = {}
    'config' in entry &&
    typeof entry.config === 'object' &&
    entry.config
  ) {
    const config = entry.config;
    if (
      'enabledWithdrawalDexes' in config &&
      Array.isArray(config.enabledWithdrawalDexes)
    ) {
      const enabledWithdrawalDexes = config.enabledWithdrawalDexes;
      return (
        new Set(enabledWithdrawalDexes).size === enabledWithdrawalDexes.length
      );
    }
    return false;
  }
  return false;
};

export const getBackwardCompatibleConfig = (
  config: ManifestEntry['config'],
): ManifestEntry['config'] => {
  return {
    enabledWithdrawalDexes: config.enabledWithdrawalDexes.filter(
      (dex) => !!getDexConfig(dex),
    ),
  };
};

export const isManifestValid = (
  manifest: unknown,
  chain: number,
): manifest is Manifest => {
  const stringChain = chain.toString();
  if (manifest && typeof manifest === 'object' && stringChain in manifest)
    return isManifestEntryValid(
      (manifest as Record<string, unknown>)[stringChain],
    );
  return false;
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
