import Fastify from 'fastify';

/**
 * Integration tests for THE security-critical surface (see rpc.ts header):
 * method allowlist, eth_call/eth_getLogs address allowlists, batch cap,
 * log-range cap, response-size cap, whole-batch short-circuit, failover.
 * The real allowlist module is used on purpose — it is part of the surface.
 */

vi.mock('../../config.js', () => ({
  config: { NODE_ENV: 'test' },
  PROVIDER_MAX_BATCH: 20,
  rpcProvidersUrls: {
    1: ['https://rpc-primary.test/KEY', 'https://rpc-fallback.test/KEY'],
  },
}));

const { startTimerMock } = vi.hoisted(() => ({
  startTimerMock: vi.fn(() => vi.fn()),
}));
vi.mock('../../metrics/index.js', () => ({
  default: {
    request: {
      apiTimingsExternal: { startTimer: startTimerMock },
      ethCallToAddress: { labels: vi.fn(() => ({ inc: vi.fn() })) },
    },
  },
}));

import { rpcRoute } from '../rpc.js';
import { allowlists } from '../../data/rpc-allowlist.js';

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

const upstreamResponse = (data: unknown, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  text: async () => JSON.stringify(data),
});

const ALLOWED_CALL_ADDRESS = [...(allowlists[1]?.call ?? [])][0];
const ALLOWED_LOGS_ADDRESS = [...(allowlists[1]?.logs ?? [])][0];
const FORBIDDEN_ADDRESS = '0x000000000000000000000000000000000000dead';

const buildApp = async () => {
  const app = Fastify({ logger: false });
  await app.register(rpcRoute);
  return app;
};

const rpcCall = (method: string, params?: unknown, id = 1) => ({
  jsonrpc: '2.0',
  id,
  method,
  params,
});

describe('/api/rpc', () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = await buildApp();
  });

  afterEach(async () => {
    await app.close();
  });

  it('has non-empty allowlists for mainnet (test precondition)', () => {
    expect(ALLOWED_CALL_ADDRESS).toBeTruthy();
    expect(ALLOWED_LOGS_ADDRESS).toBeTruthy();
  });

  it('answers wrong methods with 404', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/rpc?chainId=1' });
    expect(res.statusCode).toBe(404);
  });

  it('rejects a missing/invalid chainId with 400', async () => {
    for (const url of ['/api/rpc', '/api/rpc?chainId=abc']) {
      const res = await app.inject({
        method: 'POST',
        url,
        payload: rpcCall('eth_blockNumber'),
      });
      expect(res.statusCode).toBe(400);
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects an unconfigured chain with 400', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/rpc?chainId=999',
      payload: rpcCall('eth_blockNumber'),
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toContain('not configured');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects batches over PROVIDER_MAX_BATCH and empty batches', async () => {
    const over = await app.inject({
      method: 'POST',
      url: '/api/rpc?chainId=1',
      payload: Array.from({ length: 21 }, (_, i) =>
        rpcCall('eth_blockNumber', undefined, i),
      ),
    });
    expect(over.statusCode).toBe(400);
    expect(over.json().error).toContain('exceeds max 20');

    const empty = await app.inject({
      method: 'POST',
      url: '/api/rpc?chainId=1',
      payload: [],
    });
    expect(empty.statusCode).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects non-allowlisted methods without calling upstream', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/rpc?chainId=1',
      payload: rpcCall('eth_syncing'),
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().error.code).toBe(-32601);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects eth_call to a non-allowlisted address', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/rpc?chainId=1',
      payload: rpcCall('eth_call', [{ to: FORBIDDEN_ADDRESS }, 'latest']),
    });
    expect(res.json().error.code).toBe(-32602);
    expect(res.json().error.message).toContain('allowlist');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects eth_call with a malformed `to`', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/rpc?chainId=1',
      payload: rpcCall('eth_call', [{ to: 'not-an-address' }, 'latest']),
    });
    expect(res.json().error.code).toBe(-32602);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('forwards eth_call to an allowlisted address (any casing)', async () => {
    fetchMock.mockResolvedValue(
      upstreamResponse({ jsonrpc: '2.0', id: 1, result: '0x1' }),
    );
    const res = await app.inject({
      method: 'POST',
      url: '/api/rpc?chainId=1',
      payload: rpcCall('eth_call', [
        { to: ALLOWED_CALL_ADDRESS.toUpperCase().replace('0X', '0x') },
        'latest',
      ]),
    });
    expect(res.json().result).toBe('0x1');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe('https://rpc-primary.test/KEY');
  });

  it('rejects eth_getLogs without an address (would return all chain logs)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/rpc?chainId=1',
      payload: rpcCall('eth_getLogs', [{ fromBlock: '0x1', toBlock: '0x2' }]),
    });
    expect(res.json().error.code).toBe(-32602);
    expect(res.json().error.message).toContain('empty `address`');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects eth_getLogs for a non-allowlisted address (incl. inside an array)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/rpc?chainId=1',
      payload: rpcCall('eth_getLogs', [
        { address: [ALLOWED_LOGS_ADDRESS, FORBIDDEN_ADDRESS] },
      ]),
    });
    expect(res.json().error.code).toBe(-32602);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects eth_getLogs block ranges over 20 000', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/rpc?chainId=1',
      payload: rpcCall('eth_getLogs', [
        {
          address: ALLOWED_LOGS_ADDRESS,
          fromBlock: '0x0',
          toBlock: '0x4e21', // 20 001
        },
      ]),
    });
    expect(res.json().error.code).toBe(-32602);
    expect(res.json().error.message).toContain('exceeds max 20000');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('short-circuits the WHOLE batch when one call fails validation', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/rpc?chainId=1',
      payload: [
        rpcCall('eth_blockNumber', undefined, 1),
        rpcCall('eth_call', [{ to: FORBIDDEN_ADDRESS }], 2),
      ],
    });
    const body = res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body[0].error.code).toBe(-32602);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('fails over to the next upstream URL', async () => {
    fetchMock.mockRejectedValueOnce(new Error('ECONNREFUSED'));
    fetchMock.mockResolvedValue(
      upstreamResponse({ jsonrpc: '2.0', id: 1, result: '0x10' }),
    );
    const res = await app.inject({
      method: 'POST',
      url: '/api/rpc?chainId=1',
      payload: rpcCall('eth_blockNumber'),
    });
    expect(res.json().result).toBe('0x10');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][0]).toBe('https://rpc-fallback.test/KEY');
  });

  it('caps upstream responses at 1 MiB', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => 'x'.repeat(1_000_001),
    });
    const res = await app.inject({
      method: 'POST',
      url: '/api/rpc?chainId=1',
      payload: rpcCall('eth_blockNumber'),
    });
    expect(res.json().error.code).toBe(-32603);
    expect(res.json().error.message).toContain('too large');
  });

  it('rejects non-JSON upstream responses', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => '<html>gateway error</html>',
    });
    const res = await app.inject({
      method: 'POST',
      url: '/api/rpc?chainId=1',
      payload: rpcCall('eth_blockNumber'),
    });
    expect(res.json().error.code).toBe(-32603);
    expect(res.json().error.message).toContain('non-JSON');
  });

  it('reports a JSON-RPC error when all upstreams fail, without leaking URLs', async () => {
    fetchMock.mockRejectedValue(new Error('ECONNREFUSED'));
    const res = await app.inject({
      method: 'POST',
      url: '/api/rpc?chainId=1',
      payload: rpcCall('eth_blockNumber'),
    });
    const body = res.json();
    expect(body.error.code).toBe(-32603);
    expect(JSON.stringify(body)).not.toContain('rpc-primary.test');
  });
});
