import { FastifyInstance } from 'fastify';
import { Cache, type CacheClass } from 'memory-cache';
import { createPublicClient, fallback, http } from 'viem';
import { mainnet } from 'viem/chains';
import { LidoSDKWrap } from '@lidofinance/lido-ethereum-sdk/wrap';
import LocalManifestRaw from '../../../IPFS.json';
import MainnetConfigRaw from '../../../networks/mainnet.json';
import { HttpMethod, httpMethodGuard } from './http-method-guard.js';

// Inlined from consts/external-links.ts
const IPFS_MANIFEST_URL =
  'https://raw.githubusercontent.com/lidofinance/ethereum-staking-widget/main/IPFS.json';

// Inlined from consts/chains.ts
const CHAINS = {
  Mainnet: 1,
} as const;

// Inlined from networks/mainnet.json
const MAINNET_CONTRACTS = {
  ggvVault: '0xef417FCE1883c6653E7dC6AF7c6F85CCDE84Aa09',
  ggvAccountant: '0xc873F2b7b3BA0a7faA2B56e210E3B965f2b618f5',
  ggvLens: '0x5232bc0F5999f8dA604c42E1748A13a170F94A1B',
  dvvVault: '0x5E362eb2c0706Bd1d134689eC75176018385430B',
  stgVault: '0x277C6A642564A91ff78b008022D65683cEE5CCC5',
  stgCollector: '0x40DA86d29AF2fe980733bD54E364e7507505b41B',
} as const;

type ManifestChainConfig = {
  config?: {
    earnVaults?: EarnVaultConfigEntry[];
  };
};

type Manifest = Record<string, ManifestChainConfig>;
type NetworkConfig = { contracts?: Record<string, string> };

const LocalManifest = LocalManifestRaw as Manifest;
const MainnetConfig = MainnetConfigRaw as NetworkConfig;

// Inlined subset from IPFS.json (only what this file needs)
const LOCAL_MANIFEST: Manifest = {
  [CHAINS.Mainnet]: {
    config: {
      earnVaults: [{ name: 'strategy' }, { name: 'ggv' }, { name: 'dvv' }],
    },
  },
};

// Inlined from features/earn/vault-stg/consts.tsx
const STG_COLLECTOR_CONFIG = {
  baseAssetFallback: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  oracleUpdateInterval: 86400n,
  redeemHandlingInterval: 3600n,
} as const;

// Inlined types from config/external-config/types.ts
type EarnVaultConfigEntry = {
  name: string;
};

export type VaultsTvlResponse = {
  data: Record<string, any>;
  meta: {
    resTimestamp: number;
  };
};
const DEFAULT_CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const EXTERNAL_MANIFEST_TTL = 10 * 60 * 1000; // 10 minutes
const CHAIN_MAINNET = '1';

type CacheValue = {
  value: { tvlEthWei: string } | undefined;
  timestamp: number;
};

const caches: Record<string, CacheClass<string, CacheValue>> = {};
const cacheKeys: Record<string, string> = {};
const cacheTTL: Record<string, number> = {};

const vaultsFromLocalManifest =
  LocalManifest?.[CHAIN_MAINNET]?.config?.earnVaults || [];

vaultsFromLocalManifest.forEach((vault) => {
  caches[vault.name] = new Cache();
  cacheKeys[vault.name] = `${vault.name}-tvl`;
  cacheTTL[vault.name] = DEFAULT_CACHE_TTL;
});

const fetchWithCache = async ({
  cacheKey,
  cacheTTL,
  cache,
  fetcher,
}: {
  cacheKey: string;
  cacheTTL: number;
  cache: CacheClass<string, CacheValue>;
  fetcher: () => Promise<{ tvlEthWei: string } | undefined>;
}) => {
  const cached = cache.get(cacheKey);
  if (cached) return cached as CacheValue;

  const value = await fetcher();
  const payload = { value, timestamp: Date.now() };
  cache.put(cacheKey, payload, cacheTTL);
  return payload;
};

const externalConfigCache: CacheClass<string, Manifest | null> = new Cache();

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

// Inlined from utilsApi/fetch-external-manifest.ts and utilsApi/get-external-config.ts
const getExternalConfig = async () => {
  const cacheKey = 'external-config';
  const cached = externalConfigCache.get(cacheKey);
  if (cached) return cached?.[CHAINS.Mainnet];

  let manifest: Manifest | null = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const data = await fetchJson(IPFS_MANIFEST_URL);
      if (data && typeof data === 'object') {
        manifest = data as Manifest;
        break;
      }
    } catch (error) {
      console.error(
        '[earn-vaults-tvl] Failed to fetch external manifest',
        error,
      );
    }
  }

  const resolvedManifest = manifest ?? LOCAL_MANIFEST;
  externalConfigCache.put(cacheKey, resolvedManifest, EXTERNAL_MANIFEST_TTL);
  return resolvedManifest?.[CHAINS.Mainnet];
};

// Inlined minimal ABIs from features/earn/vault-ggv/contracts/abi/lens-abi.ts
const GGV_LENS_ABI = [
  {
    inputs: [
      {
        internalType: 'contract BoringVault',
        name: 'boringVault',
        type: 'address',
      },
      {
        internalType: 'contract AccountantWithRateProviders',
        name: 'accountant',
        type: 'address',
      },
    ],
    name: 'totalAssets',
    outputs: [
      { internalType: 'contract ERC20', name: 'asset', type: 'address' },
      { internalType: 'uint256', name: 'assets', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// Inlined minimal ABI from features/earn/vault-dvv/contracts/abi/dvv-vault-abi.ts
const DVV_VAULT_ABI = [
  {
    inputs: [],
    name: 'totalAssets',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// Inlined minimal ABI from features/earn/vault-stg/contracts/abi/stg-collector.ts
const STG_COLLECTOR_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'account', type: 'address' },
      { internalType: 'contract Vault', name: 'vault', type: 'address' },
      {
        components: [
          {
            internalType: 'address',
            name: 'baseAssetFallback',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'oracleUpdateInterval',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'redeemHandlingInterval',
            type: 'uint256',
          },
        ],
        internalType: 'struct Collector.Config',
        name: 'config',
        type: 'tuple',
      },
    ],
    name: 'collect',
    outputs: [
      {
        components: [
          { internalType: 'address', name: 'vault', type: 'address' },
          { internalType: 'address', name: 'baseAsset', type: 'address' },
          { internalType: 'address[]', name: 'assets', type: 'address[]' },
          { internalType: 'uint8[]', name: 'assetDecimals', type: 'uint8[]' },
          { internalType: 'uint256[]', name: 'assetPrices', type: 'uint256[]' },
          {
            components: [
              { internalType: 'address', name: 'queue', type: 'address' },
              { internalType: 'address', name: 'asset', type: 'address' },
              { internalType: 'bool', name: 'isDepositQueue', type: 'bool' },
              { internalType: 'bool', name: 'isPausedQueue', type: 'bool' },
              { internalType: 'bool', name: 'isSignatureQueue', type: 'bool' },
              {
                internalType: 'uint256',
                name: 'pendingValue',
                type: 'uint256',
              },
              { internalType: 'uint256[]', name: 'values', type: 'uint256[]' },
            ],
            internalType: 'struct Collector.QueueInfo[]',
            name: 'queues',
            type: 'tuple[]',
          },
          { internalType: 'uint256', name: 'totalLP', type: 'uint256' },
          { internalType: 'uint256', name: 'limitLP', type: 'uint256' },
          { internalType: 'uint256', name: 'accountLP', type: 'uint256' },
          { internalType: 'uint256', name: 'totalBase', type: 'uint256' },
          { internalType: 'uint256', name: 'limitBase', type: 'uint256' },
          { internalType: 'uint256', name: 'accountBase', type: 'uint256' },
          { internalType: 'uint256', name: 'lpPriceBase', type: 'uint256' },
          { internalType: 'uint256', name: 'totalUSD', type: 'uint256' },
          { internalType: 'uint256', name: 'limitUSD', type: 'uint256' },
          { internalType: 'uint256', name: 'accountUSD', type: 'uint256' },
          { internalType: 'uint256', name: 'lpPriceUSD', type: 'uint256' },
          { internalType: 'uint256', name: 'blockNumber', type: 'uint256' },
          { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
        ],
        internalType: 'struct Collector.Response',
        name: 'r',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const parseList = (value: string | undefined) =>
  value
    ? value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

const getRpcUrls = () => {
  const urls = parseList(process.env.EL_RPC_URLS_1);
  if (urls.length === 0) {
    throw new Error('EL_RPC_URLS_1 is not set');
  }
  return urls;
};

const fetchers: {
  [key: string]: () => Promise<{ tvlEthWei: string }>;
} = {
  dvv: async () => {
    const publicClientMainnet = createPublicClient({
      chain: mainnet,
      transport: fallback(getRpcUrls().map((url) => http(url))),
    });

    const tvlWsteth = await publicClientMainnet.readContract({
      address: MAINNET_CONTRACTS.dvvVault,
      abi: DVV_VAULT_ABI,
      functionName: 'totalAssets',
    });

    const wrap = new LidoSDKWrap({
      chainId: mainnet.id,
      logMode: 'none',
      rpcProvider: publicClientMainnet,
    });

    const tvlSteth = await wrap.convertWstethToSteth(tvlWsteth as bigint);

    return {
      tvlEthWei: String(tvlSteth),
    };
  },
  ggv: async () => {
    const publicClientMainnet = createPublicClient({
      chain: mainnet,
      transport: fallback(getRpcUrls().map((url) => http(url))),
    });

    const [_, tvlWETH] = (await publicClientMainnet.readContract({
      address: MAINNET_CONTRACTS.ggvLens,
      abi: GGV_LENS_ABI,
      functionName: 'totalAssets',
      args: [MAINNET_CONTRACTS.ggvVault, MAINNET_CONTRACTS.ggvAccountant],
    })) as readonly [string, bigint];

    return {
      tvlEthWei: String(tvlWETH),
    };
  },
  strategy: async () => {
    const publicClientMainnet = createPublicClient({
      chain: mainnet,
      transport: fallback(getRpcUrls().map((url) => http(url))),
    });

    const collectorResponse = (await publicClientMainnet.readContract({
      address: MAINNET_CONTRACTS.stgCollector,
      abi: STG_COLLECTOR_ABI,
      functionName: 'collect',
      args: [
        '0x0000000000000000000000000000000000000000',
        MAINNET_CONTRACTS.stgVault,
        STG_COLLECTOR_CONFIG,
      ],
    })) as { totalBase: bigint };

    const totalTvlWei = collectorResponse.totalBase;

    return {
      tvlEthWei: String(totalTvlWei),
    };
  },
};

const getVaultsTvlResponse = async (): Promise<VaultsTvlResponse> => {
  const manifestConfig = await getExternalConfig();
  const vaultsFromConfig = manifestConfig?.config?.earnVaults || [];
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

  const response = {
    data: {} as Record<
      string,
      { tvlEthWei: string | undefined; timestamp: number | undefined }
    >,
    meta: {
      resTimestamp: Math.floor(Date.now() / 1000),
    },
  };

  settledPromises.forEach((promise, index) => {
    const name = vaults[index]?.name;
    if (promise.status === 'fulfilled' && name) {
      const fetchedCachedResult = promise.value;
      response.data[name] = {
        tvlEthWei: fetchedCachedResult?.value?.tvlEthWei,
        timestamp: fetchedCachedResult?.timestamp,
      };
    }
  });

  return response;
};

export const registerVaultTvlRoutes = (app: FastifyInstance) => {
  app.route({
    method: ['GET', 'OPTIONS'],
    url: '/api/earn/vaults-tvl',
    handler: async (request, reply) => {
      if (await httpMethodGuard([HttpMethod.GET])(request, reply)) {
        return;
      }

      try {
        const response = await getVaultsTvlResponse();
        await reply.send(response);
      } catch (error) {
        request.log.error({ error }, '[earn-vaults-tvl] Failed to fetch');
        await reply.code(500).send({ error: 'Internal Server Error' });
      }
    },
  });
};
