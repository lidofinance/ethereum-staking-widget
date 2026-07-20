import { promises as fs } from 'fs';
import { Cache } from 'memory-cache';
import getConfigNext from 'next/config';
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

const { serverRuntimeConfig } = getConfigNext();

// manifest file mounted into the container (e.g. k8s configmap)
const getConfigManifestPath = (): string | undefined =>
  process.env.CONFIG_MANIFEST_PATH || serverRuntimeConfig.configManifestPath;

const cache = new Cache<
  typeof config.CACHE_EXTERNAL_CONFIG_KEY,
  ExternalConfigResult
>();

// served if the file degrades after boot (boot with a broken file is
// prevented by scripts/startup-checks/config-manifest.mjs)
let lastGoodFileManifest: ExternalConfigResult | null = null;

const readManifestFromFile = async (
  manifestPath: string,
): Promise<ExternalConfigResult> => {
  try {
    const raw = await fs.readFile(manifestPath, 'utf-8');
    const parsing = ManifestSchema.safeParse(JSON.parse(raw));
    if (!parsing.success) {
      throw new Error(`invalid config received: ${parsing.error?.message}`);
    }

    const result = {
      ___prefetch_manifest___: parsing.data,
    };

    lastGoodFileManifest = result;
    cache.put(
      config.CACHE_EXTERNAL_CONFIG_KEY,
      result,
      config.CACHE_EXTERNAL_CONFIG_FILE_TTL,
    );

    return result;
  } catch (error) {
    console.error(
      `[fetchExternalManifest] failed to read manifest file at ${manifestPath}`,
      error,
    );

    if (lastGoodFileManifest) {
      console.error(
        '[fetchExternalManifest] serving last known good file manifest',
      );
      return lastGoodFileManifest;
    }

    console.error(
      '[fetchExternalManifest] no last known good manifest, falling back to the local manifest',
    );
    return {
      ___prefetch_manifest___: getLocalFallbackManifest(),
    };
  }
};

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

    // with CONFIG_MANIFEST_PATH the file is the source of truth, no remote fetch
    const manifestPath = getConfigManifestPath();
    if (manifestPath) {
      return readManifestFromFile(manifestPath);
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
