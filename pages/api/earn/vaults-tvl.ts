import { Cache, CacheClass } from 'memory-cache';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createPublicClient, http, fallback } from 'viem';
import { mainnet } from 'viem/chains';
import {
  wrapRequest as wrapNextRequest,
  cacheControl,
} from '@lidofinance/next-api-wrapper';
import { LidoSDKWrap } from '@lidofinance/lido-ethereum-sdk/wrap';

import { getExternalConfig } from 'utilsApi/get-external-config';

import LocalManifestRaw from 'IPFS.json' assert { type: 'json' };

import { config, secretConfig } from 'config';
import { API_ROUTES } from 'consts/api';
import {
  defaultErrorHandler,
  responseTimeMetric,
  rateLimit,
  httpMethodGuard,
  HttpMethod,
  cors,
  fetchWithCache,
} from 'utilsApi';
import Metrics from 'utilsApi/metrics';
import { CHAINS } from 'consts/chains';
import { Manifest } from 'config/external-config/types';

import {
  getGGVAccountantContract,
  getGGVLensContract,
  getGGVVaultContract,
} from 'features/earn/vault-ggv/contracts';
import {
  getSTGCollectorContract,
  getSTGVaultContract,
} from 'features/earn/vault-stg/contracts';
import { STG_COLLECTOR_CONFIG } from 'features/earn/vault-stg/consts';
import { STGCollectResponse } from 'features/earn/vault-stg/hooks/use-stg-collect';
import { getDVVVaultContract } from 'features/earn/vault-dvv/contracts';

export type VaultsTvlResponse = {
  data: Record<string, any>;
  meta: {
    resTimestamp: number;
  };
};

const DEFAULT_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

const LocalManifest = LocalManifestRaw as unknown as Manifest;
const vaultsFromLocalManifest =
  LocalManifest[CHAINS.Mainnet].config.earnVaults || [];

const caches: Record<string, CacheClass<string, any>> = {};
const cacheKeys: Record<string, string> = {};
const cacheTTL: Record<string, number> = {};

// initialize cache for each vault
vaultsFromLocalManifest.forEach((vault) => {
  caches[vault.name] = new Cache<string, any>();
  cacheKeys[vault.name] = `${vault.name}-tvl`;
  cacheTTL[vault.name] = DEFAULT_CACHE_TTL;
});

const fetchers: {
  [key: string]: () => Promise<{ tvlEthWei: string }>;
} = {
  dvv: async () => {
    const chain = mainnet;
    const publicClientMainnet = createPublicClient({
      chain,
      transport: fallback(secretConfig.rpcUrls_1.map((url) => http(url))),
    });

    const vault = getDVVVaultContract(publicClientMainnet);

    const tvlWsteth = await vault.read.totalAssets();

    const wrap = new LidoSDKWrap({
      chainId: chain.id,
      logMode: 'none',
      rpcProvider: publicClientMainnet,
    });

    const tvlSteth = await wrap.convertWstethToSteth(tvlWsteth);

    return {
      tvlEthWei: String(tvlSteth),
    };
  },
  ggv: async () => {
    const publicClientMainnet = createPublicClient({
      chain: mainnet,
      transport: fallback(secretConfig.rpcUrls_1.map((url) => http(url))),
    });

    const lens = getGGVLensContract(publicClientMainnet);
    const vault = getGGVVaultContract(publicClientMainnet);
    const accountant = getGGVAccountantContract(publicClientMainnet);

    const [_, tvlWETH] = await lens.read.totalAssets([
      vault.address,
      accountant.address,
    ]);

    return {
      tvlEthWei: String(tvlWETH),
    };
  },
  strategy: async () => {
    const publicClientMainnet = createPublicClient({
      chain: mainnet,
      transport: fallback(secretConfig.rpcUrls_1.map((url) => http(url))),
    });

    const collector = getSTGCollectorContract(publicClientMainnet);
    const vaultContract = getSTGVaultContract(publicClientMainnet);

    const collectorResponse: STGCollectResponse = await collector.read.collect([
      '0x0000000000000000000000000000000000000000', // account
      vaultContract.address, // vault
      STG_COLLECTOR_CONFIG, // config
    ]);

    const totalTvlWei = collectorResponse.totalBase;

    return {
      tvlEthWei: String(totalTvlWei),
    };
  },
};

const handler = async (_: NextApiRequest, res: NextApiResponse) => {
  try {
    const manifestConfig = await getExternalConfig();
    const vaultsFromConfig = manifestConfig?.config.earnVaults || [];
    const vaults = vaultsFromConfig.filter((v) => v.name in fetchers);

    const fetchPromises = vaults.map((vault) =>
      fetchWithCache({
        cacheKey: cacheKeys[vault.name],
        cacheTTL: cacheTTL[vault.name],
        cache: caches[vault.name],
        fetcher: fetchers[vault.name],
      }),
    );
    const settledPromises = await Promise.allSettled(fetchPromises);

    const response: VaultsTvlResponse = {
      data: {},
      meta: {
        resTimestamp: Math.floor(Date.now() / 1000),
      },
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

    res.json(response);
  } catch (error) {
    console.error('[earn-vaults-tvl] Failed to fetch:', error);
    res.status(500).json({ error: 'Internal Server Error' });
    return;
  }
};

export default wrapNextRequest([
  httpMethodGuard([HttpMethod.GET]),
  cors({ origin: ['*'], methods: [HttpMethod.GET] }),
  rateLimit,
  responseTimeMetric(Metrics.request.apiTimings, API_ROUTES.EARN_VAULTS_TVL),
  cacheControl({ headers: config.CACHE_DEFAULT_HEADERS }),
  defaultErrorHandler,
])(handler);
