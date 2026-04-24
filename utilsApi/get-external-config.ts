import invariant from 'tiny-invariant';
import { config } from 'config';
import { getManifestKey } from 'config/external-config';

import { fetchExternalManifest } from './fetch-external-manifest';

export const getExternalConfig = async () => {
  const { ___prefetch_manifest___ } = await fetchExternalManifest();
  const key = getManifestKey(config.defaultChain, config.manifestOverride);
  const manifestConfig = ___prefetch_manifest___[key]?.config;

  invariant(
    manifestConfig,
    `[getExternalConfig] Manifest entry not found for key ${key}`,
  );

  return manifestConfig;
};
