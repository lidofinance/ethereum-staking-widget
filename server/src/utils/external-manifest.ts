import { promises as fs } from 'node:fs';

import FallbackLocalManifest from 'REMOTE_CONFIG_MANIFEST.json';

import metrics from '../metrics/index.js';
import { config } from '../config.js';
import { maskedError } from './masked-error.js';

/**
 * Server-side read of the external config manifest — port of
 * `utilsApi/fetch-external-manifest.ts` + `utilsApi/get-external-config.ts`.
 *
 * Two source modes (parity with develop's config-manifest feature):
 * - `CONFIG_MANIFEST_PATH` set → the mounted file (k8s configmap) is the
 *   source of truth; no remote fetch. Short TTL: cheap re-read, fast
 *   configmap propagation.
 * - unset → remote fetch from the repo's `main` branch (same constant as
 *   `consts/external-links.ts` `REMOTE_CONFIG_MANIFEST_URL`), 3 retries.
 *
 * Failure never caches: a broken source is retried on the next call, and
 * the last known good manifest (if any) is served meanwhile — boot with a
 * broken file is prevented by `scripts/startup-checks/config-manifest.mjs`.
 * With no last-good the manifest bundled into the build is served.
 *
 * `MANIFEST_OVERRIDE` is a manifest KEY SUFFIX (`<defaultChain>-<override>`),
 * not a fetch URL (the previous PoC port drifted here).
 *
 * The schema here is intentionally loose (`config` block passed through as
 * received) — full Zod validation of the manifest lives with the frontend;
 * the server only reads `api.validation.version`, `earnVaults` and `geo`.
 */
const GITHUB_RAW_MAIN_PATH =
  'https://raw.githubusercontent.com/lidofinance/ethereum-staking-widget/main';
// TODO: switch to REMOTE_CONFIG_MANIFEST.json once the config-manifest
// feature reaches main; until then the new file does not exist on main and
// the fetch would 404 (same TODO as consts/external-links.ts).
export const REMOTE_CONFIG_MANIFEST_URL = `${GITHUB_RAW_MAIN_PATH}/IPFS.json`;

const REMOTE_TTL_MS = 10 * 60 * 1000; // CACHE_EXTERNAL_CONFIG_TTL = 10m
const FILE_TTL_MS = 60 * 1000; // CACHE_EXTERNAL_CONFIG_FILE_TTL = 1m
const FETCH_TIMEOUT_MS = 5_000;
const RETRIES = 3;

export interface ManifestEarnVault {
  name: string;
  apy?: { type?: string };
  [key: string]: unknown;
}

export interface ManifestEntryConfig {
  api?: { validation?: { version?: string } };
  earnVaults?: ManifestEarnVault[];
  // untrusted as received; routes/geo.ts narrows it defensively
  geo?: unknown;
  [key: string]: unknown;
}

export interface ManifestEntry {
  config?: ManifestEntryConfig;
  leastSafeVersion?: string;
  [key: string]: unknown;
}

type Manifest = Record<string, ManifestEntry | undefined>;

export type ManifestSource =
  'file' | 'remote' | 'last-known-good' | 'local-fallback';

// what the last fetchExternalManifest call actually served,
// exposed as the X-Manifest-Source header by /api/config-manifest
let lastManifestSource: ManifestSource = 'local-fallback';

export const getLastManifestSource = (): ManifestSource => lastManifestSource;

export const getManifestKey = (
  defaultChain: number,
  manifestOverride?: string,
): string =>
  `${defaultChain}` +
  (typeof manifestOverride === 'string' ? `-${manifestOverride}` : '');

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

let cache: { value: Manifest; at: number; ttl: number } | null = null;

// served if the source degrades after boot
let lastGoodManifest: Manifest | null = null;

// pure loader: read + parse or throw
const readManifestFromFile = async (
  manifestPath: string,
): Promise<Manifest> => {
  const raw = await fs.readFile(manifestPath, 'utf-8');
  const data = JSON.parse(raw) as unknown;
  if (!isPlainObject(data)) {
    throw new Error('manifest is not an object');
  }

  console.info(
    `[fetchExternalManifest] loaded manifest file ${manifestPath} with ${
      Object.keys(data).length
    } entries`,
  );

  return data as Manifest;
};

// pure loader: fetch with retries + parse or throw
const fetchManifestFromRemote = async (): Promise<Manifest> => {
  let lastError: unknown;
  for (let attempt = 0; attempt < RETRIES; attempt += 1) {
    const end = metrics.request.apiTimingsExternal.startTimer({
      hostname: new URL(REMOTE_CONFIG_MANIFEST_URL).hostname,
    });
    // single observation per attempt: prom-client's startTimer() closure
    // observes on EVERY call, so end() must fire exactly once
    let status = '5xx';
    try {
      const res = await fetch(REMOTE_CONFIG_MANIFEST_URL, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        headers: { accept: 'application/json' },
      });
      status = res.ok ? '2xx' : `${Math.floor(res.status / 100)}xx`;
      if (!res.ok) throw new Error(`manifest HTTP ${res.status}`);
      const data = (await res.json()) as unknown;
      if (!isPlainObject(data)) {
        throw new Error('manifest is not an object');
      }
      return data as Manifest;
    } catch (err) {
      console.error(
        `[fetchExternalManifest] attempt ${attempt + 1}/${RETRIES} failed:`,
        maskedError(err),
      );
      lastError = err;
    } finally {
      end({ status });
    }
  }
  throw lastError;
};

export const fetchExternalManifest = async (): Promise<Manifest> => {
  const now = Date.now();
  if (cache && now - cache.at < cache.ttl) return cache.value;

  // with CONFIG_MANIFEST_PATH the file is the source of truth, no remote fetch
  const manifestPath = config.CONFIG_MANIFEST_PATH;
  try {
    const manifest = manifestPath
      ? await readManifestFromFile(manifestPath)
      : await fetchManifestFromRemote();

    lastGoodManifest = manifest;
    lastManifestSource = manifestPath ? 'file' : 'remote';
    cache = {
      value: manifest,
      at: now,
      ttl: manifestPath ? FILE_TTL_MS : REMOTE_TTL_MS,
    };
    return manifest;
  } catch (error) {
    console.error(
      '[fetchExternalManifest] failed to load manifest',
      maskedError(error),
    );
    metrics.request.configManifestLoadError
      .labels({ source: manifestPath ? 'file' : 'remote' })
      .inc(1);

    if (lastGoodManifest) {
      console.error('[fetchExternalManifest] serving last known good manifest');
      lastManifestSource = 'last-known-good';
      return lastGoodManifest;
    }

    lastManifestSource = 'local-fallback';
    return FallbackLocalManifest;
  }
};

export const getExternalManifestConfig =
  async (): Promise<ManifestEntryConfig | null> => {
    const manifest = await fetchExternalManifest();
    const key = getManifestKey(config.DEFAULT_CHAIN, config.MANIFEST_OVERRIDE);
    return manifest[key]?.config ?? null;
  };

/** The vault list bundled with the build — used to pre-create caches. */
export const getLocalManifestEarnVaults = (): ManifestEarnVault[] => {
  const local = FallbackLocalManifest as unknown as Manifest;
  const key = getManifestKey(config.DEFAULT_CHAIN, config.MANIFEST_OVERRIDE);
  return local[key]?.config?.earnVaults ?? local['1']?.config?.earnVaults ?? [];
};
