import { config } from 'config';
import { getManifestKey } from 'config/external-config';

import { fetchExternalManifest } from './fetch-external-manifest';

export const getExternalConfig = async () => {
  const { ___prefetch_manifest___ } = await fetchExternalManifest();
  const currentChain =
    config.defaultChain as keyof typeof ___prefetch_manifest___;

  const manifestConfig =
    ___prefetch_manifest___?.[
      getManifestKey(
        currentChain,
        config.manifestOverride,
      ) as keyof typeof ___prefetch_manifest___
    ];

  return manifestConfig;
};
