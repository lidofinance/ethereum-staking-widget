import type { FastifyReply, FastifyRequest } from 'fastify';
import { LRUCache } from 'lru-cache';
import { parseEther } from 'viem';

import metrics from '../metrics/index.js';
import {
  CACHE_DEFAULT_ERROR_HEADERS,
  CACHE_ONE_INCH_RATE_KEY,
  CACHE_ONE_INCH_RATE_TTL,
} from './cache-control.js';

const ONE_INCH_FUSION_API_ENDPOINT = 'https://api.1inch.com/fusion';
const ONE_INCH_FUSION_QUOTE_ENDPOINT = `${ONE_INCH_FUSION_API_ENDPOINT}/quoter/v2.0/1/quote/receive/`;
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const TOKEN_MAP = {
  ETH: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
  WETH: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  STETH: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
  WSTETH: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0',
} as const;

const SWAP_TOKENS = ['ETH', 'STETH', 'WSTETH'] as const;
type SwapToken = (typeof SWAP_TOKENS)[number];

const DEFAULT_AMOUNT = parseEther('1');
const MIN_AMOUNT = parseEther('0.0003');
// High enough for real users, but rejects nonsensical quotes locally.
const MAX_AMOUNT = parseEther('1000000000');
const RATE_PRECISION = 1_000_000n;
const REQUEST_TIMEOUT_MS = 10_000;

export type OneInchRateResponse = {
  rate: number;
  toReceive: string;
  fromAmount: string;
};

type OneInchQuoteResponse = {
  toTokenAmount: string;
};

type OneInchRateHandlerOptions = {
  apiKey: string;
  fetcher?: typeof fetch;
  cache?: LRUCache<string, OneInchRateResponse>;
};

class RequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

class OneInchHttpError extends Error {
  constructor(readonly status: number) {
    super(`1inch quote request failed with status ${status}`);
  }
}

const getPublicError = (error: unknown) => {
  if (error instanceof RequestError) {
    return { status: error.status, message: error.message };
  }

  if (error instanceof OneInchHttpError) {
    // The request is valid, but 1inch cannot quote this amount.
    if (error.status === 400 || error.status === 422) {
      return {
        status: 422,
        message: '1inch cannot quote the requested amount',
      };
    }
    // A shared upstream limit means temporary service unavailability.
    if (error.status === 429) {
      return {
        status: 503,
        message: '1inch rate is temporarily unavailable',
      };
    }
  }

  if (error instanceof Error && error.name === 'TimeoutError') {
    return { status: 504, message: '1inch rate request timed out' };
  }

  // fallback error
  return { status: 502, message: 'Failed to fetch 1inch rate' };
};

type QueryValue = unknown;

const getQueryValue = (value: QueryValue, name: string) => {
  if (typeof value !== 'string' || !value) {
    throw new RequestError(`Invalid ${name}`, 422);
  }
  return value;
};

const parseToken = (value: QueryValue): SwapToken => {
  const token = getQueryValue(value, 'token').toUpperCase();
  if (!SWAP_TOKENS.some((allowedToken) => allowedToken === token)) {
    throw new RequestError(
      `token must be one of the following values: ${SWAP_TOKENS.join(', ')}`,
      422,
    );
  }
  return token as SwapToken;
};

const parseAmount = (value: QueryValue, token: SwapToken): bigint => {
  if (value === undefined) return DEFAULT_AMOUNT;
  if (token === 'ETH') {
    throw new RequestError('amount is not allowed with token ETH', 422);
  }

  const rawAmount = getQueryValue(value, 'amount');
  if (!/^\d+$/.test(rawAmount)) {
    throw new RequestError('Invalid amount', 422);
  }

  const amount = BigInt(rawAmount);
  if (amount === 0n) throw new RequestError('Amount must be positive', 422);
  if (amount < MIN_AMOUNT) throw new RequestError('Amount too small', 422);
  if (amount > MAX_AMOUNT) throw new RequestError('Amount too large', 422);
  return amount;
};

const isQuoteResponse = (value: unknown): value is OneInchQuoteResponse => {
  if (!value || typeof value !== 'object') return false;
  const { toTokenAmount } = value as Record<string, unknown>;
  return typeof toTokenAmount === 'string' && /^\d+$/.test(toTokenAmount);
};

const createQuoteUrl = (token: SwapToken, amount: bigint) => {
  // Fusion cannot quote native ETH as the source token, so ETH -> stETH is
  // represented as WETH -> stETH, matching the former eth-api implementation.
  const fromTokenAddress = token === 'ETH' ? TOKEN_MAP.WETH : TOKEN_MAP[token];
  const toTokenAddress = token === 'ETH' ? TOKEN_MAP.STETH : TOKEN_MAP.ETH;
  const params = new URLSearchParams({
    fromTokenAddress,
    toTokenAddress,
    amount: amount.toString(),
    walletAddress: ZERO_ADDRESS,
    source: 'sdk',
    surplus: 'true',
  });

  return `${ONE_INCH_FUSION_QUOTE_ENDPOINT}?${params}`;
};

const statusBucket = (status: number) => `${Math.floor(status / 100)}xx`;

const fetchQuote = async (
  fetcher: typeof fetch,
  apiKey: string,
  token: SwapToken,
  amount: bigint,
): Promise<OneInchQuoteResponse> => {
  const endUpstream = metrics.request.apiTimingsExternal.startTimer({
    hostname: new URL(ONE_INCH_FUSION_API_ENDPOINT).hostname,
    entity: 'one-inch',
  });
  let response: Response;
  try {
    response = await fetcher(createQuoteUrl(token, amount), {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    endUpstream({ status: '5xx' });
    throw error;
  }
  endUpstream({ status: statusBucket(response.status) });

  if (!response.ok) {
    throw new OneInchHttpError(response.status);
  }

  const quote: unknown = await response.json();
  if (!isQuoteResponse(quote)) {
    throw new Error('1inch quote response has an invalid shape');
  }
  return quote;
};

export const createOneInchRateHandler = ({
  apiKey,
  fetcher = fetch,
  cache = new LRUCache({
    max: 200,
    ttl: CACHE_ONE_INCH_RATE_TTL,
  }),
}: OneInchRateHandlerOptions) => {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const query = (req.query ?? {}) as Record<string, unknown>;
    try {
      const token = parseToken(query.token);
      const amount = parseAmount(query.amount, token);
      const cacheKey = `${CACHE_ONE_INCH_RATE_KEY}-${token}-${amount}`;
      const cached = cache.get(cacheKey);
      if (cached) {
        return reply.code(200).send(cached);
      }

      const quote = await fetchQuote(fetcher, apiKey, token, amount);
      const toAmount = BigInt(quote.toTokenAmount);
      const scaledRate = (toAmount * RATE_PRECISION) / amount;
      if (scaledRate > BigInt(Number.MAX_SAFE_INTEGER)) {
        throw new Error('1inch quote rate is out of range');
      }

      const result: OneInchRateResponse = {
        rate: Number(scaledRate) / Number(RATE_PRECISION),
        toReceive: quote.toTokenAmount,
        fromAmount: amount.toString(),
      };
      cache.set(cacheKey, result);
      return reply.code(200).send(result);
    } catch (error) {
      const { status, message } = getPublicError(error);
      if (status >= 500) req.log.error({ err: error }, '[one-inch-rate]');
      return reply
        .code(status)
        .header('cache-control', CACHE_DEFAULT_ERROR_HEADERS)
        .send({ message });
    }
  };
};
