import { Cache, CacheClass } from 'memory-cache';
import {
  wrapRequest as wrapNextRequest,
  cacheControl,
} from '@lidofinance/next-api-wrapper';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { Address } from 'viem';

import { config } from 'config';
import { API_ROUTES } from 'consts/api';
import {
  defaultErrorHandler,
  responseTimeMetric,
  rateLimit,
  httpMethodGuard,
  HttpMethod,
  cors,
  fetchWithCache,
  responseTimeExternalMetricWrapper,
} from 'utilsApi';
import Metrics from 'utilsApi/metrics';
import { fetchSTGStatsApr } from 'features/earn/vault-stg/utils';
import { getGGVApy } from 'features/earn/vault-ggv/utils';
import { CHAINS } from 'consts/chains';
import {
  EarnVaultConfigEntry,
  VaultAPYType,
} from 'config/external-config/types';
import { getContractAddress } from 'config/networks/contract-address';
import { Manifest } from 'config/external-config';
import { getExternalConfig } from 'utilsApi/get-external-config';

import { fetchDVVStatsApr } from 'features/earn/vault-dvv/utils';
import { DVV_STATS_ORIGIN } from 'features/earn/vault-dvv/consts';
import { STG_STATS_ORIGIN } from 'features/earn/vault-stg/consts';
import { GGV_STATS_ORIGIN } from 'features/earn/vault-ggv/consts';

import LocalManifestRaw from 'IPFS.json';

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

const DEFAULT_CACHE_TTL = 60 * 60 * 1000; // 1 hour

const LocalManifest = LocalManifestRaw as unknown as Manifest;
const vaultsFromLocalManifest =
  LocalManifest[CHAINS.Mainnet].config.earnVaults || [];

const caches: Record<string, CacheClass<string, any>> = {};
const cacheKeys: Record<string, string> = {};
const cacheTTL: Record<string, number> = {};

// initialize cache for each vault
vaultsFromLocalManifest.forEach((vault) => {
  caches[vault.name] = new Cache<string, any>();
  cacheKeys[vault.name] = `${vault.name}-apr`;
  cacheTTL[vault.name] = DEFAULT_CACHE_TTL;
});

const fetchers: {
  [key: string]: (
    vaultConfig: EarnVaultConfigEntry,
  ) => Promise<{ apr: number }>;
} = {
  ggv: async () => {
    const ggvVaultAddress = getContractAddress(
      CHAINS.Mainnet,
      'ggvVault',
    ) as Address;

    const manifestConfig = await getExternalConfig();
    const vaultsFromConfig = manifestConfig?.config?.earnVaults || [];

    const ggvApyType = vaultsFromConfig.find((v) => v.name === 'ggv')?.apy
      ?.type as VaultAPYType;

    return { apr: await getGGVApy(ggvVaultAddress, ggvApyType) };
  },
  dvv: async () => ({ apr: await fetchDVVStatsApr() }),
  strategy: async () => ({ apr: await fetchSTGStatsApr() }),
};

const fetchUrlsForMetrics: Record<string, string> = {
  ggv: GGV_STATS_ORIGIN,
  dvv: DVV_STATS_ORIGIN,
  strategy: STG_STATS_ORIGIN,
};

const handler = async (_: NextApiRequest, res: NextApiResponse) => {
  try {
    const manifestConfig = await getExternalConfig();
    const vaultsFromConfig = manifestConfig?.config.earnVaults || [];

    // allowing only vaults with defined fetchers
    const vaults = vaultsFromConfig.filter((v) => v.name in fetchers);

    const fetchPromises = vaults.map((vault) =>
      fetchWithCache({
        cacheKey: cacheKeys[vault.name],
        cacheTTL: cacheTTL[vault.name],
        cache: caches[vault.name],
        fetcher: async () =>
          responseTimeExternalMetricWrapper({
            payload: fetchUrlsForMetrics[vault.name],
            request: () => fetchers[vault.name](vault as EarnVaultConfigEntry),
          }),
      }),
    );

    const settledPromises = await Promise.allSettled(fetchPromises);

    const response: VaultsAprResponse = {
      data: {
        maxValue: 0,
      },
      meta: {
        resTimestamp: Math.floor(Date.now() / 1000),
      },
    };

    settledPromises.forEach((promise, index) => {
      const name = vaults[index].name;
      if (promise.status === 'fulfilled') {
        const fetchedCachedResult = promise.value;
        const apr = fetchedCachedResult?.value.apr;
        if (apr && apr > response.data.maxValue) {
          response.data.maxValue = apr;
        }
        response.data[name] = {
          apr,
          timestamp: fetchedCachedResult?.timestamp,
        };
      }
    });

    res.json(response);
  } catch (error) {
    console.error('[earn-vaults-apr] Failed to fetch:', error);
    res.status(500).json({ error: 'Failed to fetch earn vaults apr' });
  }
};

export default wrapNextRequest([
  httpMethodGuard([HttpMethod.GET]),
  cors({ origin: ['*'], methods: [HttpMethod.GET] }),
  rateLimit,
  responseTimeMetric(Metrics.request.apiTimings, API_ROUTES.EARN_VAULTS_APR),
  cacheControl({ headers: config.CACHE_DEFAULT_HEADERS }),
  defaultErrorHandler,
])(handler);
