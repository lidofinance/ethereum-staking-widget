import { FastifyInstance } from 'fastify';
import { Cache, type CacheClass } from 'memory-cache';
import { isAddress } from 'viem';
import LocalManifestRaw from '../../../IPFS.json' assert { type: 'json' };
import { HttpMethod, httpMethodGuard } from './http-method-guard.js';

const IPFS_MANIFEST_URL =
  'https://raw.githubusercontent.com/lidofinance/ethereum-staking-widget/main/IPFS.json';

const DEFAULT_CACHE_TTL = 1000; // 1 second
const EXTERNAL_MANIFEST_TTL = 10 * 60 * 1000; // 10 minutes
const CHAIN_MAINNET = '1';

export const CACHE_VALIDATION_HEADERS =
  'public, max-age=30, stale-if-error=1200, stale-while-revalidate=30';

type ManifestChainConfig = {
  config?: {
    api?: {
      validation?: {
        version?: string;
      };
    };
  };
};

type Manifest = Record<string, ManifestChainConfig>;

class FetcherError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type ValidationResult =
  | {
      status: 200;
      data: unknown;
    }
  | {
      status: 400;
      data: { error: string; message: string };
    }
  | {
      status: 404;
      data?: undefined;
    }
  | {
      status: number;
      data?: { error: string };
    };

const LocalManifest = LocalManifestRaw as Manifest;
const externalConfigCache: CacheClass<string, ManifestChainConfig | undefined> =
  new Cache();
const validationResponseCache: CacheClass<string, unknown> = new Cache();
const validationAPIBasePath = process.env.VALIDATION_SERVICE_BASE_PATH;

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

const standardFetcher = async <T>(url: string, params?: RequestInit) => {
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-type': 'application/json' },
    ...params,
  });

  if (!response.ok) {
    let message = 'An error occurred while fetching the data';
    try {
      const error = await response.json();
      message = typeof error === 'string' ? error : JSON.stringify(error);
    } catch {
      // noop
    }
    throw new FetcherError(message, response.status);
  }

  return (await response.json()) as T;
};

const getExternalConfig = async (): Promise<
  ManifestChainConfig | undefined
> => {
  const cacheKey = 'external-config';
  const cached = externalConfigCache.get(cacheKey);
  if (cached) return cached;

  const defaultChain = String(process.env.DEFAULT_CHAIN || CHAIN_MAINNET);

  let manifest: Manifest | null = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const data = await fetchJson(IPFS_MANIFEST_URL);
      if (data && typeof data === 'object') {
        manifest = data as Manifest;
        break;
      }
    } catch (error) {
      console.error('[validation] Failed to fetch external manifest', error);
    }
  }

  const resolvedManifest: Manifest = manifest ?? LocalManifest;
  const config = resolvedManifest?.[defaultChain];
  externalConfigCache.put(cacheKey, config, EXTERNAL_MANIFEST_TTL);
  return config;
};

const getValidationVersion = async () => {
  const manifestConfig = await getExternalConfig();
  return manifestConfig?.config?.api?.validation?.version || '1';
};

const validateEthereumAddress = (address: unknown): string | null => {
  if (typeof address !== 'string' || !address) return null;
  if (!isAddress(address)) return null;

  return address.toLowerCase();
};

const getValidationResponse = async (
  address: unknown,
): Promise<ValidationResult> => {
  if (!validationAPIBasePath) {
    return {
      status: 404,
    };
  }

  const validatedAddress = validateEthereumAddress(address);
  if (!validatedAddress) {
    return {
      status: 400,
      data: {
        error: 'Invalid Ethereum address',
        message: 'Address must be a valid Ethereum address format',
      },
    };
  }

  const version = await getValidationVersion();
  const url = `${validationAPIBasePath}/v${version}/check/${validatedAddress}`;
  const cachedValue = validationResponseCache.get(url);
  if (cachedValue) {
    return { status: 200, data: cachedValue };
  }

  try {
    const data = await standardFetcher(url, {
      signal: AbortSignal.timeout(10_000),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    validationResponseCache.put(url, data, DEFAULT_CACHE_TTL);
    return { status: 200, data };
  } catch (error) {
    if (
      error instanceof FetcherError &&
      error.status >= 400 &&
      error.status < 500
    ) {
      return {
        status: error.status,
        data: { error: error.message },
      };
    }

    return {
      status: 500,
    };
  }
};

export const registerValidationRoute = (app: FastifyInstance) => {
  app.route({
    method: ['GET', 'OPTIONS'],
    url: '/api/validation',
    handler: async (request, reply) => {
      await reply.header('Access-Control-Allow-Origin', '*');
      await reply.header('Access-Control-Allow-Methods', 'GET');
      await reply.header('Access-Control-Allow-Headers', '*');
      await reply.header('Access-Control-Allow-Credentials', 'false');

      if (await httpMethodGuard([HttpMethod.GET])(request, reply)) {
        return;
      }

      await reply.header('Cache-Control', CACHE_VALIDATION_HEADERS);

      const result = await getValidationResponse(
        (request.query as Record<string, unknown>)?.address,
      );

      if (result.status === 200) {
        await reply.send(result.data);
        return;
      }

      if (result.status === 404) {
        await reply.code(404).send();
        return;
      }

      await reply.code(result.status).send(result.data ?? undefined);
    },
  });
};
