import { config } from 'config';
import { getFallbackedManifestEntry } from 'config/external-config';

import { fetchExternalManifest } from './fetch-external-manifest';

export const getExternalConfig = async () => {
  const { ___prefetch_manifest___ } = await fetchExternalManifest();
  const manifestEntry = getFallbackedManifestEntry(
    ___prefetch_manifest___,
    config.defaultChain,
    config.manifestOverride,
  );
  const manifestConfig = manifestEntry.config;

  return manifestConfig;
};
