import type { NextApiRequest, NextApiResponse } from 'next';

import { config, secretConfig } from 'config';

import Metrics from '../metrics';
import { createClientLimiter, type ClientLimitScope } from './client-limit';
import { parseDisabledScopes } from './kill-switch';
import { createLambdaClient } from './lambda-client';
import { CLIENT_LIMITS, UPSTREAM_BUDGETS } from './limits';
import { createStethRewardsFetcher } from './steth-rewards';
import { createQuotaBreaker, createUpstreamGuard } from './upstream-guard';
import {
  createPortfolioPositionsHandler,
  createPortfolioRewardsHandler,
  createPortfolioService,
  createPortfolioTransactionsHandler,
  type PortfolioHandlerOptions,
} from './portfolio-handler';

const notConfigured = (_: NextApiRequest, res: NextApiResponse) => {
  res.setHeader('Cache-Control', config.CACHE_DEFAULT_ERROR_HEADERS);
  res.status(404).end();
};

// HTTP 429 is the request rate: a short pause for the whole key
const RATE_PAUSE_MS = 60 * 1000;
// HTTP 402 is a used-up quota: it stays used up, so the pause is long
const QUOTA_PAUSE_MS = 10 * 60 * 1000;

// a control character would make fetch echo the key in its error
const isValidApiKey = (candidate: string | undefined): candidate is string =>
  !!candidate &&
  [...candidate].every((character) => {
    const charCode = character.charCodeAt(0);
    return charCode > 0x1f && charCode !== 0x7f;
  });

const apiKey = secretConfig.p2pLambdaAPIKey;
if (apiKey && !isValidApiKey(apiKey)) {
  console.warn('[portfolio] P2P_LAMBDA_API_KEY is malformed, API disabled');
}

const disabledScopes = parseDisabledScopes(secretConfig.p2pLambdaDisabled);
if (!disabledScopes.isValid) {
  console.warn('[portfolio] P2P_LAMBDA_DISABLED is malformed, API disabled');
}

const metrics = Metrics.request;
// the request rate and the quota are both shared by every kind of call
const rateBreaker = createQuotaBreaker();
const quotaBreaker = createQuotaBreaker();

// one service per process, so the routes share caches, budgets and pauses
const createClient = (validApiKey: string, scope: ClientLimitScope) =>
  createLambdaClient({
    apiKey: validApiKey,
    guard: createUpstreamGuard({
      ...UPSTREAM_BUDGETS[scope],
      breakerMs: RATE_PAUSE_MS,
      breaker: rateBreaker,
      quotaBreakerMs: QUOTA_PAUSE_MS,
      quotaBreaker,
      disabled: disabledScopes.scopes.has(scope),
      onReject: (reason) =>
        metrics.portfolioUpstreamRejected.labels(scope, reason).inc(),
      onResult: (callResult) =>
        metrics.portfolioUpstreamCalls.labels(scope, callResult).inc(),
    }),
  });

const service = isValidApiKey(apiKey)
  ? createPortfolioService(
      createClient(apiKey, 'positions'),
      createClient(apiKey, 'history'),
      createClient(apiKey, 'rewards'),
      {
        fetchStethRewards: secretConfig.rewardsBackendAPI
          ? createStethRewardsFetcher({
              backendUrl: secretConfig.rewardsBackendAPI,
            })
          : undefined,
      },
    )
  : null;

const handlerOptions: PortfolioHandlerOptions = {
  limiter: createClientLimiter({
    limits: CLIENT_LIMITS,
    onLimit: (limit) => metrics.portfolioClientLimited.labels(limit).inc(),
  }),
  onStale: (scope) => metrics.portfolioStaleServed.labels(scope).inc(),
};

export const portfolioPositionsHandler = service
  ? createPortfolioPositionsHandler(service, handlerOptions)
  : notConfigured;

export const portfolioRewardsHandler = service
  ? createPortfolioRewardsHandler(service, handlerOptions)
  : notConfigured;

export const portfolioTransactionsHandler = service
  ? createPortfolioTransactionsHandler(service, handlerOptions)
  : notConfigured;
