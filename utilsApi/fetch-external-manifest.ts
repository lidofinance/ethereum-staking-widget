import { promises as fs } from 'fs';
import { Cache } from 'memory-cache';
import getConfigNext from 'next/config';
import { REMOTE_CONFIG_MANIFEST_URL } from 'consts/external-links';
import { responseTimeExternalMetricWrapper } from './fetchApiWrapper';
import Metrics from 'utilsApi/metrics';
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

export type ManifestSource =
  'file' | 'remote' | 'last-known-good' | 'local-fallback';

// what the last fetchExternalManifest call actually served,
// exposed as the X-Manifest-Source header by api/config-manifest
let lastManifestSource: ManifestSource = 'local-fallback';

export const getLastManifestSource = (): ManifestSource => lastManifestSource;

const { serverRuntimeConfig } = getConfigNext();

// manifest file mounted into the container (e.g. k8s configmap);
// trim so a whitespace-only env behaves like an unset one, same as the startup check
const getConfigManifestPath = (): string | undefined =>
  (
    process.env.CONFIG_MANIFEST_PATH || serverRuntimeConfig.configManifestPath
  )?.trim() || undefined;

const cache = new Cache<
  typeof config.CACHE_EXTERNAL_CONFIG_KEY,
  ExternalConfigResult
>();

// served if the source degrades after boot (boot with a broken file is
// prevented by scripts/startup-checks/config-manifest.mjs)
let lastGoodManifest: ExternalConfigResult | null = null;

// pure loader: read + parse or throw
const readManifestFromFile = async (
  manifestPath: string,
): Promise<Manifest> => {
  const raw = await fs.readFile(manifestPath, 'utf-8');
  const parsing = ManifestSchema.safeParse(JSON.parse(raw));

  if (!parsing.success)
    throw new Error(`invalid config received: ${parsing.error?.message}`);

  console.info(
    `[fetchExternalManifest] loaded manifest file ${manifestPath} with ${
      Object.keys(parsing.data).length
    } entries`,
  );

  return parsing.data;
};

// pure loader: fetch with retries + parse or throw
const fetchManifestFromRemote = async (): Promise<Manifest> => {
  let lastError: unknown;
  for (let retries = 3; retries > 0; retries -= 1) {
    try {
      const data = await responseTimeExternalMetricWrapper({
        payload: REMOTE_CONFIG_MANIFEST_URL,
        request: () =>
          standardFetcher<unknown>(REMOTE_CONFIG_MANIFEST_URL, {
            headers: { Accept: 'application/json' },
          }),
      });
      const parsing = ManifestSchema.safeParse(data);
      if (!parsing.success) {
        throw new Error(`invalid config received: ${parsing.error?.message}`);
      }

      return parsing.data;
    } catch (error) {
      console.error('[fetchExternalManifest] fetch attempt failed', error);

      lastError = error;
    }
  }

  throw lastError;
};

export const fetchExternalManifest =
  async (): Promise<ExternalConfigResult> => {
    // for IPFS build we use local manifest
    // this allows local CID verification
    if (config.ipfsMode) {
      return { ___prefetch_manifest___: getLocalFallbackManifest() };
    }

    const cached = cache.get(config.CACHE_EXTERNAL_CONFIG_KEY);
    if (cached) return cached;

    // with CONFIG_MANIFEST_PATH the file is the source of truth, no remote fetch
    const manifestPath = getConfigManifestPath();
    try {
      const manifest = manifestPath
        ? await readManifestFromFile(manifestPath)
        : await fetchManifestFromRemote();

      const result = { ___prefetch_manifest___: manifest };
      lastGoodManifest = result;
      lastManifestSource = manifestPath ? 'file' : 'remote';
      cache.put(
        config.CACHE_EXTERNAL_CONFIG_KEY,
        result,
        manifestPath
          ? config.CACHE_EXTERNAL_CONFIG_FILE_TTL
          : config.CACHE_EXTERNAL_CONFIG_TTL,
      );
      return result;
    } catch (error) {
      console.error('[fetchExternalManifest] failed to load manifest', error);
      Metrics.request.configManifestLoadError
        .labels({ source: manifestPath ? 'file' : 'remote' })
        .inc(1);

      if (lastGoodManifest) {
        console.error(
          '[fetchExternalManifest] serving last known good manifest',
        );
        lastManifestSource = 'last-known-good';

        return lastGoodManifest;
      }

      lastManifestSource = 'local-fallback';

      return { ___prefetch_manifest___: getLocalFallbackManifest() };
    }
  };
