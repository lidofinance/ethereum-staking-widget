import { useMemo } from 'react';
import { Manifest, ManifestConfig, ManifestEntry } from './types';
import { getDexConfig } from 'features/withdrawals/request/withdrawal-rates';

import FallbackLocalManifest from 'IPFS.json' assert { type: 'json' };

const isEnabledDexesValid = (config: object) => {
  if (
    !(
      'enabledWithdrawalDexes' in config &&
      Array.isArray(config.enabledWithdrawalDexes)
    )
  )
    return false;

  const enabledWithdrawalDexes = config.enabledWithdrawalDexes;

  if (
    !enabledWithdrawalDexes.every(
      (dex) => typeof dex === 'string' && dex !== '',
    )
  )
    return false;

  return new Set(enabledWithdrawalDexes).size === enabledWithdrawalDexes.length;
};

const isMultiChainBannerValid = (config: object) => {
  // allow empty config
  if (!('multiChainBanner' in config) || !config.multiChainBanner) return true;

  if (!Array.isArray(config.multiChainBanner)) return false;

  const multiChainBanner = config.multiChainBanner;

  if (
    !multiChainBanner.every(
      (chainId) => typeof chainId === 'number' && chainId > 0,
    )
  )
    return false;

  return !(new Set(multiChainBanner).size !== multiChainBanner.length);
};

const isFeatureFlagsValid = (config: object) => {
  // allow empty config
  if (!('featureFlags' in config) || !config.featureFlags) return true;

  // only objects
  return !(typeof config.featureFlags !== 'object');
};

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

    return [isEnabledDexesValid, isMultiChainBannerValid, isFeatureFlagsValid]
      .map((validator) => validator(config))
      .every((isValid) => isValid);
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
    featureFlags: { ...(config.featureFlags ?? {}) },
    multiChainBanner: config.multiChainBanner ?? [],
    pages: config.pages ?? ({} as ManifestConfig['pages']),
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
