import type { FastifyPluginAsync } from 'fastify';
import { createPublicClient, fallback, http, type PublicClient } from 'viem';
import { mainnet } from 'viem/chains';
import { LidoSDKWrap } from '@lidofinance/lido-ethereum-sdk/wrap';

// Framework-neutral repo-root modules — same contract getters the legacy
// `pages/api/earn/vaults-tvl.ts` used.
import {
  getGGVAccountantContract,
  getGGVLensContract,
  getGGVVaultContract,
} from 'features/earn/vault-ggv/contracts';
import {
  getSTGCollectorContract,
  getSTGVaultContract,
} from 'features/earn/vault-stg/contracts';
import { STG_COLLECTOR_CONFIG } from 'features/earn/vault-stg/consts-data';
import { getDVVVaultContract } from 'features/earn/vault-dvv/contracts';

import { rpcProviders } from '../config.js';
import {
  getExternalManifestConfig,
  getLocalManifestEarnVaults,
} from '../utils/external-manifest.js';
import { createTtlCache, fetchWithCache } from '../utils/fetch-with-cache.js';
import {
  applyCacheControl,
  CACHE_DEFAULT_HEADERS,
} from '../utils/cache-control.js';
import { allowAnyOrigin } from '../utils/cors.js';
import { methodNotAllowed } from '../utils/method-guard.js';

import type { VaultsTvlResponse } from 'types/earn-api';

/**
 * Earn vaults TVL — full port of `pages/api/earn/vaults-tvl.ts` (the
 * previous PoC served empty stubs here). All reads are on-chain viem calls
 * over the Mainnet RPC list from server env.
 *
 * Per-vault memory cache, TTL 10 minutes.
 */

const DEFAULT_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

type TvlResult = { tvlEthWei: string };

// The collector.read.collect tuple is large; the route only consumes
// `totalBase`. Local structural type instead of importing the wagmi-coupled
// hook type (`features/earn/vault-stg/hooks/use-stg-collect`).
type STGCollectResponse = { totalBase: bigint };

const mainnetClient = (): PublicClient => {
  const urls = rpcProviders[mainnet.id] ?? [];
  if (urls.length === 0) {
    throw new Error(
      `EL_RPC_URLS_1 is not configured — cannot compute on-chain TVL`,
    );
  }
  return createPublicClient({
    chain: mainnet,
    transport: fallback(urls.map((url) => http(url))),
  });
};

const fetchers: Record<string, () => Promise<TvlResult>> = {
  dvv: async () => {
    const publicClientMainnet = mainnetClient();
    const vault = getDVVVaultContract(publicClientMainnet);

    const tvlWsteth = await vault.read.totalAssets();

    const wrap = new LidoSDKWrap({
      chainId: mainnet.id,
      logMode: 'none',
      rpcProvider: publicClientMainnet,
    });

    const tvlSteth = await wrap.convertWstethToSteth(tvlWsteth);

    return { tvlEthWei: String(tvlSteth) };
  },
  ggv: async () => {
    const publicClientMainnet = mainnetClient();

    const lens = getGGVLensContract(publicClientMainnet);
    const vault = getGGVVaultContract(publicClientMainnet);
    const accountant = getGGVAccountantContract(publicClientMainnet);

    const [, tvlWETH] = await lens.read.totalAssets([
      vault.address,
      accountant.address,
    ]);

    return { tvlEthWei: String(tvlWETH) };
  },
  strategy: async () => {
    const publicClientMainnet = mainnetClient();

    const collector = getSTGCollectorContract(publicClientMainnet);
    const vaultContract = getSTGVaultContract(publicClientMainnet);

    const collectorResponse: STGCollectResponse = await collector.read.collect([
      '0x0000000000000000000000000000000000000000', // account
      vaultContract.address, // vault
      STG_COLLECTOR_CONFIG, // config
    ]);

    return { tvlEthWei: String(collectorResponse.totalBase) };
  },
};

const caches: Record<string, ReturnType<typeof createTtlCache<TvlResult>>> = {};
for (const vault of getLocalManifestEarnVaults()) {
  caches[vault.name] = createTtlCache<TvlResult>();
}

export const earnVaultsTvlRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get('/api/earn/vaults-tvl', async (req, reply) => {
    allowAnyOrigin(reply);
    try {
      const manifestConfig = await getExternalManifestConfig();
      const vaultsFromConfig = manifestConfig?.earnVaults ?? [];
      const vaults = vaultsFromConfig.filter((vault) => vault.name in fetchers);

      const fetchPromises = vaults.map((vault) => {
        caches[vault.name] ??= createTtlCache<TvlResult>();
        return fetchWithCache<TvlResult>({
          cacheKey: `${vault.name}-tvl`,
          cacheTTL: DEFAULT_CACHE_TTL,
          cache: caches[vault.name],
          fetcher: fetchers[vault.name],
        });
      });
      const settledPromises = await Promise.allSettled(fetchPromises);

      const response: VaultsTvlResponse = {
        data: {},
        meta: { resTimestamp: Math.floor(Date.now() / 1000) },
      };

      settledPromises.forEach((promise, index) => {
        const name = vaults[index].name;
        if (promise.status === 'fulfilled') {
          const fetchedCachedResult = promise.value;
          response.data[name] = {
            tvlEthWei: fetchedCachedResult?.value.tvlEthWei,
            timestamp: fetchedCachedResult?.timestamp,
          };
        }
      });

      applyCacheControl(reply, CACHE_DEFAULT_HEADERS);
      return response;
    } catch (error) {
      req.log.error({ err: error }, '[earn-vaults-tvl] Failed to fetch');
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  });

  methodNotAllowed(fastify, '/api/earn/vaults-tvl', ['GET']);
};
