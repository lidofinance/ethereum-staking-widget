import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

import { PROVIDER_MAX_BATCH, rpcProvidersUrls } from '../config.js';
import {
  isAllowedCallAddress,
  isAllowedLogsAddress,
} from '../data/rpc-allowlist.js';
import metrics from '../metrics/index.js';
import { collectRequestAddressMetric } from '../metrics/collect-request-address-metric.js';
import { ROUTES } from '../consts.js';

/**
 * JSON-RPC proxy — THE security-critical surface. Ported from
 * `pages/api/rpc.ts` (`@lidofinance/next-pages` `rpcFactory`).
 *
 * Defenses preserved verbatim (RFC §5.3 "must-not-lose"):
 *   - Method allowlist (ALLOWED_METHODS — identical 17 entries)
 *   - `eth_call` `to` must be in the per-chain contract allowlist
 *     (derived from `getContractAddress()` — all supported chains incl. L2s)
 *   - `eth_getLogs` `address` must be allowlisted AND non-empty
 *     (empty address would return all chain logs)
 *   - Batch size ≤ PROVIDER_MAX_BATCH (20 — config/groups/web3.ts; the
 *     PoC port drifted to 50)
 *   - `eth_getLogs` block range ≤ 20 000
 *   - Response size ≤ 1 MiB
 *   - Chain via `?chainId=`; only configured chains accepted
 *   - Upstream URLs from server-only env (failover; first available wins)
 *   - Upstream timeout 15s; upstream URLs never leave the process unmasked
 *     (satanizer hook in src/logger.ts)
 *
 * NO CORS here on purpose — the RPC proxy is same-origin only.
 */
const MAX_LOGS_RANGE = 20_000;
const MAX_RESPONSE_BYTES = 1_000_000;
const UPSTREAM_TIMEOUT_MS = 15_000;

const ALLOWED_METHODS = new Set<string>([
  'test',
  'eth_call',
  'eth_gasPrice',
  'eth_getCode',
  'eth_estimateGas',
  'eth_getBlockByNumber',
  'eth_feeHistory',
  'eth_maxPriorityFeePerGas',
  'eth_getBalance',
  'eth_blockNumber',
  'eth_getTransactionByHash',
  'eth_getTransactionReceipt',
  'eth_getTransactionCount',
  'eth_sendRawTransaction',
  'eth_getLogs',
  'eth_chainId',
  'net_version',
]);

const HEX_RE = /^0x[0-9a-fA-F]+$/;
const ADDR_RE = /^0x[a-fA-F0-9]{40}$/;

const jsonRpcCallSchema = z.object({
  jsonrpc: z.literal('2.0').optional(),
  id: z.union([z.string(), z.number(), z.null()]).optional(),
  method: z.string(),
  params: z.unknown().optional(),
});
type JsonRpcCall = z.infer<typeof jsonRpcCallSchema>;

const querySchema = z.object({
  chainId: z.coerce.number().int().positive(),
});

interface RpcError {
  code: number;
  message: string;
  data?: unknown;
}

interface RpcResponse {
  jsonrpc: '2.0';
  id: JsonRpcCall['id'];
  result?: unknown;
  error?: RpcError;
}

const rpcError = (
  id: JsonRpcCall['id'],
  code: number,
  message: string,
): RpcResponse => ({
  jsonrpc: '2.0',
  id: id ?? null,
  error: { code, message },
});

const validateCall = (call: JsonRpcCall, chainId: number): RpcError | null => {
  if (!ALLOWED_METHODS.has(call.method)) {
    return { code: -32601, message: `method ${call.method} not allowed` };
  }

  if (call.method === 'eth_call') {
    const params = call.params as unknown[] | undefined;
    const tx = params?.[0] as { to?: unknown } | undefined;
    const to = typeof tx?.to === 'string' ? tx.to : null;
    if (!to || !ADDR_RE.test(to)) {
      return { code: -32602, message: 'eth_call: invalid `to` address' };
    }
    if (!isAllowedCallAddress(chainId, to)) {
      return {
        code: -32602,
        message: `eth_call: address ${to} not in chain ${chainId} allowlist`,
      };
    }
  }

  if (call.method === 'eth_getLogs') {
    const params = call.params as unknown[] | undefined;
    const filter = params?.[0] as
      { address?: unknown; fromBlock?: unknown; toBlock?: unknown } | undefined;

    // `address` is required and must be allowlisted (single or array).
    const addresses = Array.isArray(filter?.address)
      ? (filter.address as unknown[])
      : filter?.address != null
        ? [filter.address]
        : [];

    if (addresses.length === 0) {
      return {
        code: -32602,
        message: 'eth_getLogs: empty `address` not allowed',
      };
    }
    for (const a of addresses) {
      if (typeof a !== 'string' || !ADDR_RE.test(a)) {
        return { code: -32602, message: 'eth_getLogs: invalid `address`' };
      }
      if (!isAllowedLogsAddress(chainId, a)) {
        return {
          code: -32602,
          message: `eth_getLogs: address ${a} not in chain ${chainId} allowlist`,
        };
      }
    }

    // Range cap.
    const from = parseBlockNumber(filter?.fromBlock);
    const to = parseBlockNumber(filter?.toBlock);
    if (from != null && to != null && to - from > MAX_LOGS_RANGE) {
      return {
        code: -32602,
        message: `eth_getLogs: block range ${to - from} exceeds max ${MAX_LOGS_RANGE}`,
      };
    }
  }

  return null;
};

const parseBlockNumber = (value: unknown): number | null => {
  if (typeof value !== 'string') return null;
  if (!HEX_RE.test(value)) return null;
  return parseInt(value, 16);
};

const proxyToUpstream = async (
  urls: readonly string[],
  chainId: number,
  body: unknown,
  log: { warn: (obj: object, msg: string) => void },
): Promise<{ data: unknown } | { error: RpcError }> => {
  let lastErr: unknown = null;
  for (const url of urls) {
    const endUpstream = metrics.request.apiTimingsExternal.startTimer({
      hostname: safeHostname(url),
      entity: 'rpc',
    });
    try {
      const res = await fetch(url, {
        method: 'POST',
        signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      const raw = await res.text();
      endUpstream({ status: statusBucket(res.status) });
      if (raw.length > MAX_RESPONSE_BYTES) {
        return {
          error: {
            code: -32603,
            message: `upstream response too large (${raw.length} bytes)`,
          },
        };
      }
      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        return {
          error: { code: -32603, message: 'upstream returned non-JSON' },
        };
      }
      if (!res.ok) {
        // `url` may embed a provider API key — masked by the satanizer
        // logger hook, but keep it out of the message anyway.
        log.warn({ chainId, status: res.status, url }, 'rpc: upstream non-2xx');
        lastErr = `HTTP ${res.status}`;
        continue; // try next URL
      }
      return { data: parsed };
    } catch (err) {
      endUpstream({ status: '5xx' });
      lastErr = err;
      // Try next URL.
    }
  }
  return {
    error: {
      code: -32603,
      message: `all upstreams failed: ${String(lastErr)}`,
    },
  };
};

const safeHostname = (url: string): string => {
  try {
    return new URL(url).hostname;
  } catch {
    return 'invalid-url';
  }
};

const statusBucket = (status: number): string => {
  return `${Math.min(Math.max(Math.floor(status / 100), 1), 5)}xx`;
};

// Cap the request body below the server's 1 MiB default, sized off the largest
// batches this app actually sends. Withdrawal reads pass request-id arrays, and
// the transport packs up to PROVIDER_MAX_BATCH calls per POST:
//   getClaimableEther, MAX_SHOWN_REQUEST_PER_TYPE (1024) x 2 arrays  128kb
//   findCheckpointHints, 1024 ids                                     64kb
//   getWithdrawalStatus, STATUS_BATCH_SIZE (500) ids                  32kb
//   claimWithdrawals, MAX_REQUESTS_COUNT (256)                        32kb
// Two large reads in one batch window reach ~193kb, ~225kb with a claim gas
// estimate alongside. 512kb keeps ~2.3x headroom — re-measure before lowering.
const MAX_BODY_BYTES = 512 * 1024;

export const rpcRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post(
    ROUTES.api.rpc,
    { bodyLimit: MAX_BODY_BYTES },
    async (req, reply) => {
      // 1. Validate chain selection.
      const q = querySchema.safeParse(req.query);
      if (!q.success) {
        return reply.code(400).send({
          error: 'missing or invalid chainId query parameter',
        });
      }
      const chainId = q.data.chainId;
      const urls = rpcProvidersUrls[chainId];
      if (!urls || urls.length === 0) {
        return reply.code(400).send({
          error: `chain ${chainId} not configured`,
        });
      }

      // 2. Parse body (single call or batch).
      const body = req.body;
      if (body == null || typeof body !== 'object') {
        return reply.code(400).send({ error: 'invalid JSON-RPC body' });
      }
      const isBatch = Array.isArray(body);
      const calls = isBatch ? body : [body];

      // 3. Batch size cap.
      if (calls.length > PROVIDER_MAX_BATCH) {
        return reply.code(400).send({
          error: `batch size ${calls.length} exceeds max ${PROVIDER_MAX_BATCH}`,
        });
      }
      if (calls.length === 0) {
        return reply.code(400).send({ error: 'empty batch' });
      }

      // 4. eth_call address/method metrics (fire-and-forget, never throws).
      collectRequestAddressMetric({
        calls,
        chainId,
        metrics: metrics.request.ethCallToAddress,
      });

      // 5. Parse + validate each call.
      const validated: JsonRpcCall[] = [];
      const validationErrors: RpcResponse[] = [];
      for (const raw of calls) {
        const parsed = jsonRpcCallSchema.safeParse(raw);
        if (!parsed.success) {
          validationErrors.push(
            rpcError(
              (raw as { id?: JsonRpcCall['id'] })?.id,
              -32600,
              'invalid JSON-RPC envelope',
            ),
          );
          continue;
        }
        const callError = validateCall(parsed.data, chainId);
        if (callError) {
          validationErrors.push({
            jsonrpc: '2.0',
            id: parsed.data.id ?? null,
            error: callError,
          });
          continue;
        }
        validated.push(parsed.data);
      }

      // 6. If anything failed validation, short-circuit — do not call
      //    upstream. Matches the Next.js handler: a single bad call in a
      //    batch fails the whole batch (defensive default — avoids any
      //    partial forwarding of unvalidated calls).
      if (validationErrors.length > 0) {
        return reply.send(isBatch ? validationErrors : validationErrors[0]);
      }

      // 7. Forward to upstream with failover.
      const proxied = await proxyToUpstream(
        urls,
        chainId,
        isBatch ? validated : validated[0],
        req.log,
      );
      if ('error' in proxied) {
        // Wrap in JSON-RPC error shape so clients parse it.
        return reply.send(
          rpcError(null, proxied.error.code, proxied.error.message),
        );
      }

      return reply.type('application/json').send(proxied.data);
    },
  );
};
