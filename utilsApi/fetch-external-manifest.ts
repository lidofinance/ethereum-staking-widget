import { Cache } from 'memory-cache';
import { IPFS_MANIFEST_URL } from 'consts/external-links';
import { responseTimeExternalMetricWrapper } from './fetchApiWrapper';
import { standardFetcher } from 'utils/standardFetcher';

import { config } from 'config';
import { isManifestValid, type Manifest } from 'config/external-config';

import FallbackLocalManifest from 'IPFS.json';

export type ExternalConfigResult = {
  ___prefetch_manifest___: Manifest | null;
};

const cache = new Cache<
  typeof config.CACHE_EXTERNAL_CONFIG_KEY,
  ExternalConfigResult
>();

export const fetchExternalManifest = async () => {
  const cachedConfig = cache.get(config.CACHE_EXTERNAL_CONFIG_KEY);
  if (cachedConfig) return cachedConfig;

  // for IPFS build we use local manifest
  // this allows local CID verification
  if (config.ipfsMode) {
    return {
      ___prefetch_manifest___: FallbackLocalManifest,
    };
  }

  let retries = 3;
  while (retries > 0) {
    try {
      const data = await responseTimeExternalMetricWrapper({
        payload: IPFS_MANIFEST_URL,
        request: () =>
          standardFetcher<unknown>(IPFS_MANIFEST_URL, {
            headers: { Accept: 'application/json' },
          }),
      });
      if (
        !data ||
        typeof data !== 'object' ||
        !isManifestValid(data, config.defaultChain)
      ) {
        throw new Error(`invalid config received: ${data}`);
      }

      const result = {
        ___prefetch_manifest___: data,
      };

      cache.put(
        config.CACHE_EXTERNAL_CONFIG_KEY,
        result,
        config.CACHE_EXTERNAL_CONFIG_TTL,
      );

      console.debug(
        `[fetchExternalManifest] fetched external manifest`,
        result,
      );

      return result;
    } catch (error) {
      console.error(
        `[fetchExternalManifest] failed to fetch external manifest`,
        error,
      );
      retries -= 1;
    }
  }
  console.error(
    `[fetchExternalManifest] failed to fetch external manifest after retries`,
  );

  return {
    ___prefetch_manifest___: FallbackLocalManifest,
  };
};
