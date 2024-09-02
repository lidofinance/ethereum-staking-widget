import type { ManifestConfig, ManifestEntry } from 'config/external-config';

export const DEFAULT_REVALIDATION = 60 * 15; // 15 minutes
export const ERROR_REVALIDATION_SECONDS = 60; // 1 minute

export const FALLBACK_CONFIG: ManifestConfig = {
  enabledWithdrawalDexes: [],
};

export const FALLBACK_MANIFEST_ENTRY: ManifestEntry = {
  cid: undefined,
  ens: undefined,
  leastSafeVersion: undefined,
  config: FALLBACK_CONFIG,
};
