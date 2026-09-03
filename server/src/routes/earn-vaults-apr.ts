import type { FastifyPluginAsync } from 'fastify';
import type { Address } from 'viem';

// Framework-neutral repo-root modules — the SAME code the legacy
// `pages/api/earn/vaults-apr.ts` used (vault utils were de-coupled from
// browser code for this: see consts-data.ts / standardFetcher changes).
import { getGGVApy } from 'features/earn/vault-ggv/utils';
import { fetchDVVStatsApr } from 'features/earn/vault-dvv/utils';
import { fetchSTGStatsApr } from 'features/earn/vault-stg/utils';
import { GGV_STATS_ORIGIN } from 'features/earn/vault-ggv/consts-data';
import { DVV_STATS_ORIGIN } from 'features/earn/vault-dvv/consts-data';
import { STG_STATS_ORIGIN } from 'features/earn/vault-stg/consts-data';
import { getContractAddress } from 'config/networks/contract-address';
import { CHAINS } from 'consts/chains';

import {
  getExternalManifestConfig,
  getLocalManifestEarnVaults,
  type ManifestEarnVault,
} from '../utils/external-manifest.js';
import { createTtlCache, fetchWithCache } from '../utils/fetch-with-cache.js';
import {
  applyCacheControl,
  CACHE_DEFAULT_HEADERS,
} from '../utils/cache-control.js';
import { allowAnyOrigin } from '../utils/cors.js';
import metrics from '../metrics/index.js';

import type { VaultsAprResponse } from 'types/earn-api';
import { ROUTES } from '../consts.js';

/**
 * Earn vaults APR — full port of `pages/api/earn/vaults-apr.ts` (the
 * previous PoC served empty stubs here).
 *
 * Per-vault memory cache, TTL 1h. Vault list comes from the external
 * manifest (only vaults with a defined fetcher are computed);
 * GGV additionally reads its `apy.type` from the manifest.
 */

const DEFAULT_CACHE_TTL = 60 * 60 * 1000; // 1 hour

type AprResult = { apr: number };

const fetchers: Record<
  string,
  (vaultConfig: ManifestEarnVault) => Promise<AprResult>
> = {
  ggv: async () => {
    const ggvVaultAddress = getContractAddress(
      CHAINS.Mainnet,
      'ggvVault',
    ) as Address;

    const manifestConfig = await getExternalManifestConfig();
    const ggvApyType = manifestConfig?.earnVaults?.find(
      (vault) => vault.name === 'ggv',
    )?.apy?.type;

    return {
      apr: await getGGVApy(
        ggvVaultAddress,
        ggvApyType as Parameters<typeof getGGVApy>[1],
      ),
    };
  },
  dvv: async () => ({ apr: await fetchDVVStatsApr() }),
  strategy: async () => ({ apr: await fetchSTGStatsApr() }),
};

const fetchUrlsForMetrics: Record<string, string> = {
  ggv: GGV_STATS_ORIGIN,
  dvv: DVV_STATS_ORIGIN,
  strategy: STG_STATS_ORIGIN,
};

const caches: Record<string, ReturnType<typeof createTtlCache<AprResult>>> = {};
for (const vault of getLocalManifestEarnVaults()) {
  caches[vault.name] = createTtlCache<AprResult>();
}

export const earnVaultsAprRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get(ROUTES.api.earn.vaultsApr, async (req, reply) => {
    allowAnyOrigin(reply);
    try {
      const manifestConfig = await getExternalManifestConfig();
      const vaultsFromConfig = manifestConfig?.earnVaults ?? [];

      // allowing only vaults with defined fetchers
      const vaults = vaultsFromConfig.filter((vault) => vault.name in fetchers);

      const fetchPromises = vaults.map((vault) => {
        caches[vault.name] ??= createTtlCache<AprResult>();
        return fetchWithCache<AprResult>({
          cacheKey: `${vault.name}-apr`,
          cacheTTL: DEFAULT_CACHE_TTL,
          cache: caches[vault.name],
          fetcher: async () => {
            const end = metrics.request.apiTimingsExternal.startTimer({
              hostname: new URL(fetchUrlsForMetrics[vault.name]).hostname,
            });
            try {
              const result = await fetchers[vault.name](vault);
              end({ status: '2xx' });
              return result;
            } catch (err) {
              end({ status: '5xx' });
              throw err;
            }
          },
        });
      });

      const settledPromises = await Promise.allSettled(fetchPromises);

      const response: VaultsAprResponse = {
        data: { maxValue: 0 },
        meta: { resTimestamp: Math.floor(Date.now() / 1000) },
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

      applyCacheControl(reply, CACHE_DEFAULT_HEADERS);
      return response;
    } catch (error) {
      req.log.error({ err: error }, '[earn-vaults-apr] Failed to fetch');
      return reply.code(500).send({ error: 'Failed to fetch earn vaults apr' });
    }
  });
};
