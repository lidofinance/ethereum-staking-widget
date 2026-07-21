import FallbackLocalManifest from 'IPFS.json';

import metrics from '../metrics/index.js';
import { config } from '../config.js';

/**
 * Server-side read of the external IPFS manifest — port of
 * `utilsApi/fetch-external-manifest.ts` + `utilsApi/get-external-config.ts`.
 *
 * Source of truth: `IPFS.json` on the repo's `main` branch (same constant
 * as `consts/external-links.ts` `IPFS_MANIFEST_URL`). The previous PoC port
 * drifted here: it treated `MANIFEST_OVERRIDE` as a fetch URL, while in the
 * widget it is a manifest KEY SUFFIX (`<defaultChain>-<override>`).
 *
 * Behavior preserved:
 * - full manifest cached 10 minutes (CACHE_EXTERNAL_CONFIG_TTL)
 * - 3 fetch retries, external-timing metric per attempt
 * - entry looked up by `getManifestKey(defaultChain, manifestOverride)`
 *
 * The schema here is intentionally loose (`config` block passed through as
 * received) — full Zod validation of the manifest lives with the frontend;
 * the server only reads `api.validation.version` and `earnVaults`.
 */
const GITHUB_RAW_MAIN_PATH =
  'https://raw.githubusercontent.com/lidofinance/ethereum-staking-widget/main';
export const IPFS_MANIFEST_URL = `${GITHUB_RAW_MAIN_PATH}/IPFS.json`;

const TTL_MS = 10 * 60 * 1000; // CACHE_EXTERNAL_CONFIG_TTL = 10m
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
  [key: string]: unknown;
}

type Manifest = Record<string, { config?: ManifestEntryConfig } | undefined>;

export const getManifestKey = (
  defaultChain: number,
  manifestOverride?: string,
): string =>
  `${defaultChain}` +
  (typeof manifestOverride === 'string' ? `-${manifestOverride}` : '');

let cache: { value: Manifest; at: number } | null = null;

const fetchManifest = async (): Promise<Manifest | null> => {
  for (let attempt = 0; attempt < RETRIES; attempt += 1) {
    const end = metrics.request.apiTimingsExternal.startTimer({
      hostname: new URL(IPFS_MANIFEST_URL).hostname,
    });
    try {
      const res = await fetch(IPFS_MANIFEST_URL, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        headers: { accept: 'application/json' },
      });
      end({ status: res.ok ? '2xx' : `${Math.floor(res.status / 100)}xx` });
      if (!res.ok) throw new Error(`manifest HTTP ${res.status}`);
      const data = (await res.json()) as unknown;
      if (data === null || typeof data !== 'object' || Array.isArray(data)) {
        throw new Error('manifest is not an object');
      }
      return data as Manifest;
    } catch (err) {
      end({ status: '5xx' });

      console.error(
        `[fetchExternalManifest] attempt ${attempt + 1}/${RETRIES} failed:`,
        err,
      );
    }
  }
  return null;
};

export const getExternalManifestConfig =
  async (): Promise<ManifestEntryConfig | null> => {
    const now = Date.now();
    if (!cache || now - cache.at >= TTL_MS) {
      const fetched = await fetchManifest();
      if (fetched) {
        cache = { value: fetched, at: now };
      } else if (!cache) {
        // Nothing fetched, nothing cached — fall back to the manifest bundled
        // with the build (same behavior as legacy fetchExternalManifest).
        cache = { value: FallbackLocalManifest as unknown as Manifest, at: 0 };
      }
      // fetch failed but a (possibly stale/local) cache exists — serve it
    }

    const key = getManifestKey(config.DEFAULT_CHAIN, config.MANIFEST_OVERRIDE);
    return cache.value[key]?.config ?? null;
  };

/** The vault list bundled with the build — used to pre-create caches. */
export const getLocalManifestEarnVaults = (): ManifestEarnVault[] => {
  const local = FallbackLocalManifest as unknown as Manifest;
  const key = getManifestKey(config.DEFAULT_CHAIN, config.MANIFEST_OVERRIDE);
  return local[key]?.config?.earnVaults ?? local['1']?.config?.earnVaults ?? [];
};
