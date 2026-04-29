import { FastifyInstance } from 'fastify';
import { Cache, type CacheClass } from 'memory-cache';

import LocalManifestRaw from '../../../IPFS.json' assert { type: 'json' };
import MainnetConfigRaw from '../../../networks/mainnet.json' assert { type: 'json' };
import { HttpMethod, httpMethodGuard } from './http-method-guard.js';

const IPFS_MANIFEST_URL =
  'https://raw.githubusercontent.com/lidofinance/ethereum-staking-widget/main/IPFS.json';

const DEFAULT_CACHE_TTL = 60 * 60 * 1000; // 1 hour
const EXTERNAL_MANIFEST_TTL = 10 * 60 * 1000; // 10 minutes

const CHAIN_MAINNET = '1';

const STG_STATS_ORIGIN = 'https://points.mellow.finance';
const DVV_STATS_ORIGIN = 'https://points.mellow.finance';
const DVV_APR_ENDPOINT = `${DVV_STATS_ORIGIN}/v1/vaults`;
const GGV_STATS_ORIGIN = 'https://api.sevenseas.capital';

type EarnVaultConfigEntry = {
  name: string;
  apy?: {
    type?: string;
  };
};

type ManifestChainConfig = {
  config?: {
    earnVaults?: EarnVaultConfigEntry[];
  };
};

export type VaultsAprResponse = {
  data: {
    maxValue: number;
    [key: string]:
      | { apr: number | undefined; timestamp: number | undefined }
      | number;
  };
  meta: {
    resTimestamp: number;
  };
};

type Manifest = Record<string, ManifestChainConfig>;
type NetworkConfig = { contracts?: Record<string, string> };

const LocalManifest = LocalManifestRaw as Manifest;
const MainnetConfig = MainnetConfigRaw as NetworkConfig;

const ggvVaultAddress = MainnetConfig?.contracts?.ggvVault;
const stgVaultAddress = MainnetConfig?.contracts?.stgVault;

type CacheValue = {
  value: { apr: number | undefined } | undefined;
  timestamp: number;
};

const caches: Record<string, CacheClass<string, CacheValue>> = {};
const cacheKeys: Record<string, string> = {};
const cacheTTL: Record<string, number> = {};

const vaultsFromLocalManifest =
  LocalManifest?.[CHAIN_MAINNET]?.config?.earnVaults || [];

vaultsFromLocalManifest.forEach((vault) => {
  caches[vault.name] = new Cache();
  cacheKeys[vault.name] = `${vault.name}-apr`;
  cacheTTL[vault.name] = DEFAULT_CACHE_TTL;
});

const externalConfigCache: CacheClass<string, ManifestChainConfig | undefined> =
  new Cache();

const safeNumber = (value: unknown) => {
  const num = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(num) ? num : undefined;
};

const fetchJson = async (url: string, options?: RequestInit) => {
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    ...(options ?? {}),
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status}`);
  }
  return res.json();
};

const fetchWithCache = async ({
  cacheKey,
  cacheTTL,
  cache,
  fetcher,
}: {
  cacheKey: string;
  cacheTTL: number;
  cache: CacheClass<string, CacheValue>;
  fetcher: () => Promise<{ apr: number | undefined } | undefined>;
}) => {
  const cached = cache.get(cacheKey);
  if (cached) return cached as CacheValue;

  const value = await fetcher();
  const payload = { value, timestamp: Date.now() };
  cache.put(cacheKey, payload, cacheTTL);
  return payload;
};

const getExternalConfig = async (): Promise<
  ManifestChainConfig | undefined
> => {
  const cacheKey = 'external-config';
  const cached = externalConfigCache.get(cacheKey);
  if (cached) return cached;

  const defaultChain = String(process.env.DEFAULT_CHAIN || CHAIN_MAINNET);

  let manifest = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const data = await fetchJson(IPFS_MANIFEST_URL);
      if (data && typeof data === 'object') {
        manifest = data as Manifest;
        break;
      }
    } catch (error) {
      console.error(
        '[earn-vaults-apr] Failed to fetch external manifest',
        error,
      );
    }
  }

  const resolvedManifest: Manifest = manifest ?? LocalManifest;
  const config = resolvedManifest?.[defaultChain];
  externalConfigCache.put(cacheKey, config, EXTERNAL_MANIFEST_TTL);
  return config;
};

const fetchSTGStatsApr = async () => {
  if (!stgVaultAddress) return undefined;
  const url = `${STG_STATS_ORIGIN}/v1/chain/${CHAIN_MAINNET}/core-vaults/${stgVaultAddress}/data`;
  const data = await fetchJson(url);
  return safeNumber((data as { apy?: unknown })?.apy);
};

const fetchDVVStatsApr = async () => {
  const data = await fetchJson(DVV_APR_ENDPOINT);
  const dvstETHVault = Array.isArray(data)
    ? (data as Array<{ id?: string; apr?: unknown }>).find(
        (vault) => vault?.id === 'ethereum-dvsteth',
      )
    : null;
  return safeNumber(dvstETHVault?.apr);
};

const fetchDailyGGVApy = async (vault: string) => {
  const weekAgo = Math.floor(Date.now() / 1000 - 7 * 24 * 60 * 60);
  const url = `${GGV_STATS_ORIGIN}/dailyData/ethereum/${vault}/${weekAgo}/latest`;

  const data = await fetchJson(url);
  const response = Array.isArray((data as { Response?: unknown }).Response)
    ? (data as { Response: Array<{ daily_apy?: unknown }> }).Response
    : [];
  const latest = response[0];

  if (!latest) {
    throw new Error('[GGV-APY] No data found');
  }

  const sum = response.reduce(
    (acc, curr) => acc + (safeNumber(curr?.daily_apy) || 0),
    0,
  );
  const average = response.length > 0 ? sum / response.length : 0;

  return { daily: safeNumber(latest?.daily_apy), average };
};

const fetchWeeklyGGVApy = async (vault: string) => {
  const url = `${GGV_STATS_ORIGIN}/performance/ethereum/${vault}?aggregation_period=7`;
  const data = await fetchJson(url);
  const apy = safeNumber(
    (data as { Response?: { apy?: unknown } })?.Response?.apy,
  );
  return apy == null ? undefined : apy * 100;
};

const getGGVApy = async (vault: string | undefined, ggvAPYType?: string) => {
  if (!vault) return undefined;
  switch (ggvAPYType) {
    case 'weekly':
      return await fetchWeeklyGGVApy(vault);
    case 'weekly_moving_average': {
      const apy = await fetchDailyGGVApy(vault);
      return safeNumber(apy?.average);
    }
    default: {
      const apy = await fetchDailyGGVApy(vault);
      return safeNumber(apy?.daily);
    }
  }
};

export const registerVaultAPRRoute = (app: FastifyInstance) => {
  app.route({
    method: ['GET', 'OPTIONS'],
    url: '/api/earn/vaults-apr',
    handler: async (request, reply) => {
      if (await httpMethodGuard([HttpMethod.GET])(request, reply)) {
        return;
      }

      try {
        const response = await getVaultsAprResponse();
        await reply.send(response);
      } catch (error) {
        request.log.error({ error }, '[earn-vaults-apr] Failed to fetch');
        await reply
          .code(500)
          .send({ error: 'Failed to fetch earn vaults apr' });
      }
    },
  });

  const getVaultsAprResponse = async (): Promise<VaultsAprResponse> => {
    const manifestConfig = await getExternalConfig();
    const vaultsFromConfig = manifestConfig?.config?.earnVaults || [];

    const vaults = vaultsFromConfig.filter(
      (vault) =>
        vault?.name === 'ggv' ||
        vault?.name === 'dvv' ||
        vault?.name === 'strategy',
    );

    const fetchers: Record<
      string,
      (
        vaultConfig: EarnVaultConfigEntry,
      ) => Promise<{ apr: number | undefined }>
    > = {
      ggv: async (vaultConfig) => ({
        apr: await getGGVApy(ggvVaultAddress, vaultConfig?.apy?.type),
      }),
      dvv: async () => ({ apr: await fetchDVVStatsApr() }),
      strategy: async () => ({ apr: await fetchSTGStatsApr() }),
    };

    const fetchPromises = vaults.map((vault) =>
      fetchWithCache({
        cacheKey: cacheKeys[vault.name] ?? `${vault.name}-apr`,
        cacheTTL: cacheTTL[vault.name] ?? DEFAULT_CACHE_TTL,
        cache: caches[vault.name] ?? new Cache(),
        fetcher: async () => fetchers[vault.name]?.(vault),
      }),
    );

    const settledPromises = await Promise.allSettled(fetchPromises);

    type VaultsAprData = {
      maxValue: number;
    } & Record<
      string,
      { apr: number | undefined; timestamp: number | undefined } | number
    >;

    const response: { data: VaultsAprData; meta: { resTimestamp: number } } = {
      data: {
        maxValue: 0,
      },
      meta: {
        resTimestamp: Math.floor(Date.now() / 1000),
      },
    };

    settledPromises.forEach((promise, index) => {
      const name = vaults[index]?.name;
      if (promise.status === 'fulfilled' && name) {
        const fetchedCachedResult = promise.value;
        const apr = fetchedCachedResult?.value?.apr;
        if (apr && apr > response.data.maxValue) {
          response.data.maxValue = apr;
        }
        response.data[name] = {
          apr,
          timestamp: fetchedCachedResult?.timestamp,
        };
      }
    });

    return response;
  };
};
