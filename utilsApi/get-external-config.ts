import {
  getConfiguredManifestKey,
  getFallbackedManifestEntry,
} from 'config/external-config';

import { fetchExternalManifest } from './fetch-external-manifest';

export const getExternalConfig = async () => {
  const { ___prefetch_manifest___ } = await fetchExternalManifest();
  const manifestEntry = getFallbackedManifestEntry(
    ___prefetch_manifest___,
    getConfiguredManifestKey(),
  );
  const manifestConfig = manifestEntry.config;

  return manifestConfig;
};
