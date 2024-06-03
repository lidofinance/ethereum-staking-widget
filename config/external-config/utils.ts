import { useMemo } from 'react';
import { getConfig } from '../get-config';
import type { Manifest, ManifestEntry } from './types';
import {
  type DexWithdrawalApi,
  getDexConfig,
} from 'features/withdrawals/request/withdrawal-rates';

const config = getConfig();

// TODO: refactor on config expansion
export const isManifestEntryValid = (
  entry?: unknown,
): entry is ManifestEntry => {
  if (
    entry &&
    typeof entry === 'object' &&
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
        (enabledWithdrawalDexes as string[]).every(
          (dex) => !!getDexConfig(dex as DexWithdrawalApi),
        ) &&
        new Set(enabledWithdrawalDexes).size === enabledWithdrawalDexes.length
      );
    }
    return false;
  }
  return false;
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
    return isValid ? prefetchedManifest[chain] : config.FALLBACK_MANIFEST_ENTRY;
  }, [prefetchedManifest, chain]);
};
