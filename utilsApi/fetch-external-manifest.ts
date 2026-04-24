import { Cache } from 'memory-cache';
import { IPFS_MANIFEST_URL } from 'consts/external-links';
import { responseTimeExternalMetricWrapper } from './fetchApiWrapper';
import { standardFetcher } from 'utils/standardFetcher';

import { config } from 'config';

import {
  ManifestSchema,
  getLocalFallbackManifest,
} from 'config/external-config';
import type { Manifest } from 'config/external-config/types';

export type ExternalConfigResult = {
  ___prefetch_manifest___: Manifest;
};

const cache = new Cache<
  typeof config.CACHE_EXTERNAL_CONFIG_KEY,
  ExternalConfigResult
>();

export const fetchExternalManifest =
  async (): Promise<ExternalConfigResult> => {
    const cachedConfig = cache.get(config.CACHE_EXTERNAL_CONFIG_KEY);
    if (cachedConfig) return cachedConfig;

    // for IPFS build we use local manifest
    // this allows local CID verification
    if (config.ipfsMode) {
      return {
        ___prefetch_manifest___: getLocalFallbackManifest(),
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
        const parsing = ManifestSchema.safeParse(data);
        if (!parsing.success) {
          throw new Error(`invalid config received: ${parsing.error?.message}`);
        }

        const result = {
          ___prefetch_manifest___: parsing.data,
        };

        cache.put(
          config.CACHE_EXTERNAL_CONFIG_KEY,
          result,
          config.CACHE_EXTERNAL_CONFIG_TTL,
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
      ___prefetch_manifest___: getLocalFallbackManifest(),
    };
  };
