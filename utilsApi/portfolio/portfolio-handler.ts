import type { NextApiRequest, NextApiResponse } from 'next';
import { LRUCache } from 'lru-cache';
import { isAddress } from 'viem';
import { ZodError } from 'zod';

import { config } from 'config';

import { getClientIp } from '../client-request-headers';
import {
  POSITIONS_TTL_MS,
  REWARDS_TTL_MS,
  TRANSACTIONS_TTL_MS,
} from './cache-ttl';
import {
  ClientLimitError,
  type ClientLimiter,
  type ClientLimitScope,
} from './client-limit';
import { LambdaHttpError, type LambdaClient } from './lambda-client';
import { fetchPositions, type PositionsResult } from './positions';
import { fetchLidoRewards } from './rewards';
import { fetchTransactions, isValidCursor } from './transactions';
import { UpstreamUnavailableError, isQuotaError } from './upstream-guard';
import type {
  PortfolioPositionsResponse,
  PortfolioRewardsResponse,
  PortfolioTransactionsResponse,
} from './types';

const CACHE_MAX_ENTRIES = 1000;
const CACHE_MAX_BYTES = 32 * 1024 * 1024;
// failed addresses are not retried upstream for this long
const FAILURE_TTL_MS = 30 * 1000;
// how old an answer may be when served instead of an upstream failure
const SNAPSHOT_TTL_MS = 24 * 60 * 60 * 1000;
const SNAPSHOT_MAX_ENTRIES = 3 * CACHE_MAX_ENTRIES;
const SNAPSHOT_MAX_BYTES = 2 * CACHE_MAX_BYTES;
// browsers send this on requests from other sites; scripts and SSR send none
const CROSS_SITE = 'cross-site';

// upstreamNotCalled: the older answer stands in for a call that was never made
type UpstreamNotCalled = { upstreamNotCalled?: true };

type CachedPositions = PositionsResult & {
  updatedAt: number;
  stale?: true;
} & UpstreamNotCalled;

type Snapshot = (
  CachedPositions | PortfolioRewardsResponse | PortfolioTransactionsResponse
) &
  UpstreamNotCalled;

export type PortfolioService = {
  getPositions: (address: string) => Promise<CachedPositions>;
  getRewards: (
    address: string,
  ) => Promise<PortfolioRewardsResponse & UpstreamNotCalled>;
  getTransactions: (
    address: string,
    cursor: string | null,
  ) => Promise<PortfolioTransactionsResponse & UpstreamNotCalled>;
  // true when answering takes no upstream call
  isCached: (
    scope: ClientLimitScope,
    address: string,
    cursor?: string | null,
  ) => boolean;
};

class RequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

const ensureValue = <T>(value: T | undefined): T => {
  if (value === undefined) throw new Error('Portfolio cache returned nothing');
  return value;
};

const getTransactionsKey = (address: string, cursor?: string | null) =>
  `${address} ${cursor ?? ''}`;

// LRU fetch() joins concurrent requests for one address into one upstream call
// history and rewards have their own clients, so their own upstream budgets
export const createPortfolioService = (
  client: LambdaClient,
  historyClient: LambdaClient = client,
  rewardsClient: LambdaClient = client,
): PortfolioService => {
  const recentFailures = new LRUCache<string, true>({
    max: CACHE_MAX_ENTRIES,
    ttl: FAILURE_TTL_MS,
  });

  const withFailureCache =
    <T>(scope: string, load: (address: string) => Promise<T>) =>
    async (address: string): Promise<T> => {
      const failureKey = `${scope}:${address}`;
      if (recentFailures.has(failureKey))
        throw new UpstreamUnavailableError('recent failure');
      try {
        return await load(address);
      } catch (error) {
        // budget and quota pauses are not this address's fault
        if (!(error instanceof UpstreamUnavailableError || isQuotaError(error)))
          recentFailures.set(failureKey, true);
        throw error;
      }
    };

  const snapshots = new LRUCache<string, Snapshot>({
    max: SNAPSHOT_MAX_ENTRIES,
    maxSize: SNAPSHOT_MAX_BYTES,
    sizeCalculation: (value) => JSON.stringify(value).length || 1,
    ttl: SNAPSHOT_TTL_MS,
  });

  // an upstream failure is answered with the last good answer, marked stale
  const withSnapshot =
    <T extends Snapshot>(
      scope: string,
      load: (cacheKey: string) => Promise<T>,
    ) =>
    async (cacheKey: string): Promise<T> => {
      const snapshotKey = `${scope}:${cacheKey}`;
      try {
        const freshAnswer = await load(cacheKey);
        // a cache hit is the object already kept
        if (snapshots.peek(snapshotKey) !== freshAnswer)
          snapshots.set(snapshotKey, freshAnswer);
        return freshAnswer;
      } catch (error) {
        const snapshot = snapshots.get(snapshotKey) as T | undefined;
        if (!snapshot) throw error;
        return {
          ...snapshot,
          stale: true,
          ...(error instanceof UpstreamUnavailableError
            ? { upstreamNotCalled: true }
            : {}),
        };
      }
    };

  const positionsCache = new LRUCache<string, CachedPositions>({
    max: CACHE_MAX_ENTRIES,
    maxSize: CACHE_MAX_BYTES,
    sizeCalculation: (value) => JSON.stringify(value).length || 1,
    ttl: POSITIONS_TTL_MS,
    ttlAutopurge: true,
    fetchMethod: async (address) => ({
      ...(await fetchPositions(client, address)),
      updatedAt: Date.now(),
    }),
  });

  const getPositions = withFailureCache('positions', async (address) =>
    ensureValue(await positionsCache.fetch(address)),
  );

  const rewardsCache = new LRUCache<string, PortfolioRewardsResponse>({
    max: CACHE_MAX_ENTRIES,
    ttl: REWARDS_TTL_MS,
    ttlAutopurge: true,
    fetchMethod: async (address, _stale, { options }) => {
      const { tokens } = await getPositions(address);
      const lidoRewards = await fetchLidoRewards(
        rewardsClient,
        address,
        tokens,
      );
      // a wallet that just staked should not wait hours for its rewards
      if (lidoRewards.length === 0) options.ttl = POSITIONS_TTL_MS;
      return { rewards: lidoRewards, updatedAt: Date.now() };
    },
  });

  // key: address, then the page cursor after a space
  const transactionsCache = new LRUCache<string, PortfolioTransactionsResponse>(
    {
      max: CACHE_MAX_ENTRIES,
      maxSize: CACHE_MAX_BYTES,
      sizeCalculation: (value) => JSON.stringify(value).length || 1,
      ttl: TRANSACTIONS_TTL_MS,
      ttlAutopurge: true,
      fetchMethod: async (transactionsKey) => {
        const [address, cursor] = transactionsKey.split(' ');
        return fetchTransactions(historyClient, address, cursor || null);
      },
    },
  );

  const getRewards = withFailureCache('rewards', async (address) =>
    ensureValue(await rewardsCache.fetch(address)),
  );
  const getTransactions = withFailureCache(
    'transactions',
    async (transactionsKey) =>
      ensureValue(await transactionsCache.fetch(transactionsKey)),
  );

  return {
    getPositions: withSnapshot('positions', getPositions),
    getRewards: withSnapshot('rewards', getRewards),
    getTransactions: (address, cursor) =>
      withSnapshot(
        'transactions',
        getTransactions,
      )(getTransactionsKey(address, cursor)),
    isCached: (scope, address, cursor) => {
      if (scope === 'positions') return positionsCache.has(address);
      if (scope === 'rewards') return rewardsCache.has(address);
      return transactionsCache.has(getTransactionsKey(address, cursor));
    },
  };
};

const parseAddress = (value: string | string[] | undefined): string => {
  if (typeof value !== 'string' || !isAddress(value, { strict: false })) {
    throw new RequestError('Invalid address', 422);
  }
  return value.toLowerCase();
};

const parseCursor = (value: string | string[] | undefined): string | null => {
  if (value === undefined || value === '') return null;
  if (typeof value !== 'string' || !isValidCursor(value)) {
    throw new RequestError('Invalid cursor', 422);
  }
  return value;
};

const getPublicError = (error: unknown) => {
  if (error instanceof RequestError) {
    return { status: error.status, message: error.message };
  }
  if (error instanceof ClientLimitError) {
    return { status: 429, message: 'Too many portfolio requests' };
  }
  if (error instanceof UpstreamUnavailableError || isQuotaError(error)) {
    return {
      status: 503,
      message: 'Portfolio data is temporarily unavailable',
    };
  }
  if (error instanceof Error && error.name === 'TimeoutError') {
    return { status: 504, message: 'Portfolio data request timed out' };
  }
  if (error instanceof ZodError) {
    return { status: 502, message: 'Unexpected portfolio data format' };
  }
  return { status: 502, message: 'Failed to fetch portfolio data' };
};

// no raw messages: fetch errors may echo request headers
const describeError = (error: unknown) => {
  if (error instanceof LambdaHttpError) return `HTTP ${error.status}`;
  if (error instanceof UpstreamUnavailableError) return error.message;
  return error instanceof Error ? error.name : 'Unknown error';
};

export type PortfolioHandlerOptions = {
  limiter?: ClientLimiter;
  onStale?: (scope: ClientLimitScope) => void;
};

type PortfolioRoute<T> = {
  scope: ClientLimitScope;
  // another upstream call an uncached answer makes on its way
  dependsOn?: ClientLimitScope;
  logTag: string;
  getCursor?: (req: NextApiRequest) => string | null;
  load: (address: string, cursor: string | null) => Promise<T>;
};

const createHandler =
  <T extends { stale?: true }>(
    service: PortfolioService,
    {
      scope,
      dependsOn,
      logTag,
      getCursor,
      load,
    }: PortfolioRoute<T & UpstreamNotCalled>,
    { limiter, onStale }: PortfolioHandlerOptions = {},
  ) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      if (req.headers['sec-fetch-site'] === CROSS_SITE) {
        throw new RequestError('Cross-site requests are not allowed', 403);
      }
      const address = parseAddress(req.query.address);
      const cursor = getCursor?.(req) ?? null;
      const clientIp = getClientIp(req);
      const isUpstreamCallNeeded = !service.isCached(scope, address, cursor);
      const uncountUpstreamCall = limiter?.countRequest(
        clientIp,
        address,
        scope,
        isUpstreamCallNeeded,
      );
      if (
        dependsOn &&
        isUpstreamCallNeeded &&
        !service.isCached(dependsOn, address)
      ) {
        try {
          // never uncounted: that call is made before this scope can stop
          limiter?.countRequest(clientIp, address, dependsOn, true);
        } catch (error) {
          uncountUpstreamCall?.();
          throw error;
        }
      }
      const { upstreamNotCalled, ...answer } = await load(
        address,
        cursor,
      ).catch((error: unknown) => {
        // budget, pause or kill switch: no upstream call was made
        if (error instanceof UpstreamUnavailableError) uncountUpstreamCall?.();
        throw error;
      });
      if (upstreamNotCalled) uncountUpstreamCall?.();
      if (answer.stale) {
        onStale?.(scope);
        // a shared cache must not keep an old answer past the outage
        res.setHeader('Cache-Control', config.CACHE_DEFAULT_ERROR_HEADERS);
      }
      res.status(200).json(answer);
    } catch (error) {
      const { status, message } = getPublicError(error);
      // budget, pause and kill switch stops are counted in metrics instead
      if (status >= 500 && !(error instanceof UpstreamUnavailableError)) {
        console.error(`[${logTag}]`, describeError(error));
      }
      if (error instanceof ClientLimitError) {
        res.setHeader('Retry-After', String(error.retryAfterSec));
      }
      res.setHeader('Cache-Control', config.CACHE_DEFAULT_ERROR_HEADERS);
      res.status(status).json({ message });
    }
  };

export const createPortfolioPositionsHandler = (
  service: PortfolioService,
  options?: PortfolioHandlerOptions,
) =>
  createHandler<PortfolioPositionsResponse>(
    service,
    {
      scope: 'positions',
      logTag: 'portfolio-positions',
      load: async (address) => {
        const { tokens, dataIncomplete, updatedAt, stale, upstreamNotCalled } =
          await service.getPositions(address);
        return {
          // pnl keys stay on the server
          tokens: tokens.map(({ pnl: _pnl, ...token }) => token),
          dataIncomplete,
          updatedAt,
          ...(stale ? { stale } : {}),
          ...(upstreamNotCalled ? { upstreamNotCalled } : {}),
        };
      },
    },
    options,
  );

export const createPortfolioRewardsHandler = (
  service: PortfolioService,
  options?: PortfolioHandlerOptions,
) =>
  createHandler<PortfolioRewardsResponse>(
    service,
    {
      scope: 'rewards',
      dependsOn: 'positions',
      logTag: 'portfolio-rewards',
      load: (address) => service.getRewards(address),
    },
    options,
  );

export const createPortfolioTransactionsHandler = (
  service: PortfolioService,
  options?: PortfolioHandlerOptions,
) =>
  createHandler<PortfolioTransactionsResponse>(
    service,
    {
      scope: 'history',
      logTag: 'portfolio-transactions',
      getCursor: (req) => parseCursor(req.query.cursor),
      load: (address, cursor) => service.getTransactions(address, cursor),
    },
    options,
  );
