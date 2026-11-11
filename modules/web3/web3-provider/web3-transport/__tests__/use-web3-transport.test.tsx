import { vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Chain, EIP1193Provider } from 'viem';
import { mainnet, optimism } from 'viem/chains';
import type { Connection } from 'wagmi';
// test-only import of wagmi's own pinned dependency, see the note in
// runtime-mutable-transport.test.ts
// eslint-disable-next-line import/no-extraneous-dependencies
import { extractRpcUrls } from '@wagmi/core';

import { useWeb3Transport } from '../use-web3-transport';
import { getConnectionProvider } from '../get-connection-provider';

// Black-box tests of the transport stack the app actually runs: the hook is
// rendered as is, the wallet is an EIP-1193 mock and the HTTP tiers are real
// viem `http` transports over a stubbed `fetch`. Nothing here knows how the
// stack is composed inside, so the suite must stay green through a rewrite
// that keeps the behaviour: tier order, single pass, batching, Retry-After.

vi.mock('../get-connection-provider', () => ({
  getConnectionProvider: vi.fn(),
}));

// a short batch window keeps the suite fast, the batching itself stays on
vi.mock('config', () => ({
  config: { PROVIDER_BATCH_TIME: 5, PROVIDER_MAX_BATCH: 20 },
}));

const getConnectionProviderMock = vi.mocked(getConnectionProvider);

type RpcCall = { id: number; method: string; params?: unknown[] };
// `reply` answers in the shape of the request: an array for a batch, a single
// object otherwise, so only the batching tests depend on batching
type RpcReply = (items: Array<Record<string, unknown>>) => Response;
type RpcHandler = (
  calls: RpcCall[],
  reply: RpcReply,
) => Response | Promise<Response>;
type WalletRequest = (args: {
  method: string;
  params?: unknown;
}) => Promise<unknown>;

const CHAINS = [mainnet, optimism] as Chain[];
const PUBLIC_URL: Record<number, string> = {
  [mainnet.id]: mainnet.rpcUrls.default.http[0],
  [optimism.id]: optimism.rpcUrls.default.http[0],
};

const json = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });

// HTTP tier behaviours
const serves =
  (result: unknown): RpcHandler =>
  (calls, reply) =>
    reply(calls.map(({ id }) => ({ jsonrpc: '2.0', id, result })));
const failsWithStatus =
  (status: number, headers?: Record<string, string>): RpcHandler =>
  () =>
    json({ error: 'failed' }, { status, headers });
const failsWithRpcError =
  (code: number, message: string): RpcHandler =>
  (calls, reply) =>
    reply(
      calls.map(({ id }) => ({ jsonrpc: '2.0', id, error: { code, message } })),
    );
const failsOnNetwork: RpcHandler = () => {
  throw new TypeError('Failed to fetch');
};

const rpcError = (code: number, message: string) =>
  Object.assign(new Error(message), { code });

const makeConnection = (chainId: number) =>
  ({
    accounts: ['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'],
    chainId,
    connector: { uid: 'wallet' },
  }) as unknown as Connection;

// a distinct backend origin per test: nothing a test leaves behind about a
// host (e.g. a Retry-After bench) can reach the next one
let testId = 0;

const setup = () => {
  const origin = `https://widget-${++testId}.test`;
  const backendUrl: Record<number, string> = {
    [mainnet.id]: `${origin}/api/rpc?chainId=${mainnet.id}`,
    [optimism.id]: `${origin}/api/rpc?chainId=${optimism.id}`,
  };

  const handlers = new Map<string, RpcHandler>();
  // every POST that reached the network, in order
  const posts: Array<{ url: string; calls: RpcCall[] }> = [];
  // tiers in the order they were asked, wallet included
  const order: string[] = [];

  const tierOf = (url: string) =>
    Object.values(backendUrl).includes(url) ? 'backend' : 'public';

  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();
      const body = JSON.parse(init?.body as string) as RpcCall | RpcCall[];
      const calls = Array.isArray(body) ? body : [body];
      posts.push({ url, calls });
      order.push(tierOf(url));
      const handler = handlers.get(url);
      if (!handler) throw new Error(`unexpected fetch to ${url}`);
      return handler(calls, (items) =>
        json(Array.isArray(body) ? items : items[0]),
      );
    }),
  );

  const walletRequest = vi.fn<WalletRequest>(async () => 'wallet');
  const wallet = {
    request: (args: Parameters<WalletRequest>[0]) => {
      order.push('wallet');
      return walletRequest(args);
    },
  } as unknown as EIP1193Provider;
  getConnectionProviderMock.mockResolvedValue(wallet);

  let hook!: ReturnType<typeof useWeb3Transport>;
  const Probe = () => {
    hook = useWeb3Transport(CHAINS, backendUrl);
    return null;
  };
  renderToStaticMarkup(<Probe />);

  const instanceOf = (chain: Chain = mainnet) =>
    hook.transportMap[chain.id]({ chain });
  const request = (method = 'eth_blockNumber', chain: Chain = mainnet) =>
    instanceOf(chain).request({ method });

  const postsTo = (url: string) => posts.filter((post) => post.url === url);

  return {
    backend: (handler: RpcHandler, chain: Chain = mainnet) =>
      handlers.set(backendUrl[chain.id], handler),
    public: (handler: RpcHandler, chain: Chain = mainnet) =>
      handlers.set(PUBLIC_URL[chain.id], handler),
    connect: (chain: Chain = mainnet) =>
      hook.onActiveConnection(makeConnection(chain.id)),
    disconnect: () => hook.onActiveConnection(null),
    backendPosts: (chain: Chain = mainnet) => postsTo(backendUrl[chain.id]),
    publicPosts: (chain: Chain = mainnet) => postsTo(PUBLIC_URL[chain.id]),
    backendUrl,
    walletRequest,
    instanceOf,
    request,
    order,
    posts,
  };
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('useWeb3Transport', () => {
  describe('without a wallet', () => {
    it('serves from the backend RPC and leaves the public RPC alone', async () => {
      const t = setup();
      t.backend(serves('backend'));

      await expect(t.request()).resolves.toBe('backend');
      expect(t.order).toEqual(['backend']);
    });

    it.each([
      ['an HTTP error', failsWithStatus(500)],
      ['a rate limit', failsWithStatus(429)],
      ['a network failure', failsOnNetwork],
      ['a JSON-RPC error', failsWithRpcError(-32005, 'limit exceeded')],
    ])('falls through to the public RPC on %s', async (_, failure) => {
      const t = setup();
      t.backend(failure);
      t.public(serves('public'));

      await expect(t.request()).resolves.toBe('public');
      expect(t.order).toEqual(['backend', 'public']);
    });

    it('rejects after a single pass when every tier fails', async () => {
      const t = setup();
      t.backend(failsWithStatus(500));
      t.public(failsWithStatus(503));

      await expect(t.request()).rejects.toThrow();
      // no transport-level retries: each tier is asked exactly once
      expect(t.order).toEqual(['backend', 'public']);
    });

    it('routes each chain to its own RPCs', async () => {
      const t = setup();
      t.backend(serves('mainnet'), mainnet);
      t.backend(serves('optimism'), optimism);

      await expect(t.request('eth_blockNumber', mainnet)).resolves.toBe(
        'mainnet',
      );
      await expect(t.request('eth_blockNumber', optimism)).resolves.toBe(
        'optimism',
      );
      expect(t.backendPosts(mainnet)).toHaveLength(1);
      expect(t.backendPosts(optimism)).toHaveLength(1);
    });
  });

  describe('with a wallet', () => {
    it('serves from the wallet without touching the network', async () => {
      const t = setup();
      await t.connect();

      await expect(t.request()).resolves.toBe('wallet');
      expect(t.order).toEqual(['wallet']);
      expect(t.walletRequest).toHaveBeenCalledWith({
        method: 'eth_blockNumber',
        params: undefined,
      });
    });

    it('falls through wallet, backend and public in that order', async () => {
      const t = setup();
      await t.connect();
      t.walletRequest.mockRejectedValue(rpcError(-32005, 'rate limited'));
      t.backend(failsWithStatus(429));
      t.public(serves('public'));

      await expect(t.request()).resolves.toBe('public');
      expect(t.order).toEqual(['wallet', 'backend', 'public']);
    });

    it('stops at the backend when it can serve', async () => {
      const t = setup();
      await t.connect();
      t.walletRequest.mockRejectedValue(new Error('wallet unavailable'));
      t.backend(serves('backend'));

      await expect(t.request()).resolves.toBe('backend');
      expect(t.order).toEqual(['wallet', 'backend']);
    });

    it('rejects after a single pass when every tier fails', async () => {
      const t = setup();
      await t.connect();
      t.walletRequest.mockRejectedValue(new Error('wallet unavailable'));
      t.backend(failsWithStatus(500));
      t.public(failsWithStatus(503));

      await expect(t.request()).rejects.toThrow();
      expect(t.order).toEqual(['wallet', 'backend', 'public']);
    });

    // an answer from the chain or the user is final: asking another RPC
    // would not change it
    it.each([
      ['an execution revert', rpcError(3, 'execution reverted: paused')],
      ['a user rejection', rpcError(4001, 'User rejected the request.')],
    ])('does not fall through on %s', async (_, error) => {
      const t = setup();
      await t.connect();
      t.walletRequest.mockRejectedValue(error);
      t.backend(serves('backend'));

      await expect(t.request('eth_call')).rejects.toThrow();
      expect(t.order).toEqual(['wallet']);
    });

    it('uses the wallet only for the chain it is connected to', async () => {
      const t = setup();
      await t.connect(mainnet);
      t.backend(serves('backend'), optimism);

      await expect(t.request('eth_blockNumber', optimism)).resolves.toBe(
        'backend',
      );
      expect(t.walletRequest).not.toHaveBeenCalled();
    });

    it('follows the wallet to another chain', async () => {
      const t = setup();
      await t.connect(mainnet);
      await t.connect(optimism);
      t.backend(serves('backend'), mainnet);

      await expect(t.request('eth_blockNumber', optimism)).resolves.toBe(
        'wallet',
      );
      await expect(t.request('eth_blockNumber', mainnet)).resolves.toBe(
        'backend',
      );
    });

    it('goes back to the HTTP tiers after a disconnect', async () => {
      const t = setup();
      await t.connect();
      await t.disconnect();
      t.backend(serves('backend'));

      await expect(t.request()).resolves.toBe('backend');
      expect(t.walletRequest).not.toHaveBeenCalled();
    });

    it('keeps the HTTP tiers when the connection has no usable provider', async () => {
      const t = setup();
      getConnectionProviderMock.mockResolvedValue(null);
      await t.connect();
      t.backend(serves('backend'));

      await expect(t.request()).resolves.toBe('backend');
      expect(t.walletRequest).not.toHaveBeenCalled();
    });
  });

  describe('request guards', () => {
    it.each(['eth_sendTransaction', 'personal_sign', 'eth_newFilter'])(
      'never sends %s to any tier',
      async (method) => {
        const t = setup();
        await t.connect();
        t.backend(serves('backend'));

        await expect(t.request(method)).rejects.toThrow();
        expect(t.order).toEqual([]);
      },
    );

    it('rejects eth_getLogs without an address before any tier', async () => {
      const t = setup();
      t.backend(serves([]));

      await expect(
        t.instanceOf().request({ method: 'eth_getLogs', params: [{}] }),
      ).rejects.toThrow();
      expect(t.order).toEqual([]);
    });
  });

  describe('batching', () => {
    it('packs concurrent HTTP requests into one POST', async () => {
      const t = setup();
      t.backend((calls, reply) =>
        reply(
          calls.map(({ id, method }) => ({
            jsonrpc: '2.0',
            id,
            result: method,
          })),
        ),
      );

      await expect(
        Promise.all([
          t.request('eth_blockNumber'),
          t.request('eth_gasPrice'),
          t.request('eth_chainId'),
        ]),
      ).resolves.toEqual(['eth_blockNumber', 'eth_gasPrice', 'eth_chainId']);
      expect(t.backendPosts()).toHaveLength(1);
      expect(t.backendPosts()[0].calls.map((call) => call.method)).toEqual([
        'eth_blockNumber',
        'eth_gasPrice',
        'eth_chainId',
      ]);
    });

    it('falls a failed batch through to the public RPC as one batch', async () => {
      const t = setup();
      t.backend(failsWithStatus(429));
      t.public(serves('public'));

      await expect(
        Promise.all([t.request('eth_blockNumber'), t.request('eth_gasPrice')]),
      ).resolves.toEqual(['public', 'public']);
      expect(t.backendPosts()).toHaveLength(1);
      expect(t.publicPosts()).toHaveLength(1);
    });
  });

  describe('Retry-After', () => {
    it('skips the backend until the delay is over, then returns to it', async () => {
      // only the clock is faked, the batch window still runs on real timers
      vi.useFakeTimers({ toFake: ['Date'] });
      const t = setup();
      t.backend(failsWithStatus(429, { 'Retry-After': '30' }));
      t.public(serves('public'));

      // the request that gets the 429 is served by the public RPC
      await expect(t.request()).resolves.toBe('public');
      expect(t.order).toEqual(['backend', 'public']);

      // while benched the backend is not asked at all
      vi.advanceTimersByTime(29_000);
      await expect(t.request()).resolves.toBe('public');
      expect(t.backendPosts()).toHaveLength(1);
      expect(t.publicPosts()).toHaveLength(2);

      // once the delay is over it is first in line again
      vi.advanceTimersByTime(1_000);
      t.backend(serves('backend'));
      await expect(t.request()).resolves.toBe('backend');
      expect(t.backendPosts()).toHaveLength(2);
      expect(t.publicPosts()).toHaveLength(2);
    });

    it('keeps the wallet first while the backend is benched', async () => {
      vi.useFakeTimers({ toFake: ['Date'] });
      const t = setup();
      t.backend(failsWithStatus(429, { 'Retry-After': '30' }));
      t.public(serves('public'));
      await t.request();

      await t.connect();
      await expect(t.request()).resolves.toBe('wallet');

      t.walletRequest.mockRejectedValue(new Error('wallet unavailable'));
      await expect(t.request()).resolves.toBe('public');
      expect(t.backendPosts()).toHaveLength(1);
    });

    it('does not bench the backend on a 429 without the header', async () => {
      const t = setup();
      t.backend(failsWithStatus(429));
      t.public(serves('public'));

      await t.request();
      await t.request();
      expect(t.backendPosts()).toHaveLength(2);
    });
  });

  describe('WalletConnect contract', () => {
    // WC connectors read RPC urls off the transport, the backend must be first
    it('exposes the backend and public RPC urls in tier order', () => {
      const t = setup();

      expect(
        extractRpcUrls({
          chain: mainnet,
          transports: { [mainnet.id]: (p) => t.instanceOf(p.chain) },
        }),
      ).toEqual([t.backendUrl[mainnet.id], mainnet.rpcUrls.default.http[0]]);
    });

    it('does not expose the wallet transport', async () => {
      const t = setup();
      await t.connect();

      expect(
        extractRpcUrls({
          chain: mainnet,
          transports: { [mainnet.id]: (p) => t.instanceOf(p.chain) },
        }),
      ).toHaveLength(2);
    });
  });
});
