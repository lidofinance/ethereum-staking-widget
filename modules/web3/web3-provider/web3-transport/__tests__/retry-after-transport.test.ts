import { vi } from 'vitest';
import {
  createTransport,
  fallback,
  HttpRequestError,
  type EIP1193RequestFn,
  type Transport,
} from 'viem';
import type { Chain } from 'viem';
import { mainnet, optimism } from 'viem/chains';

import {
  RetryAfterActiveError,
  retryAfterTransport,
} from '../retry-after-transport';

type RequestFn = (args: { method: string }) => Promise<unknown>;

const URL_A = 'https://rpc-a.test/v1';
const URL_B = 'https://rpc-b.test/v1';

// a transport that exposes its url the way viem's `http` does
const urlTransport =
  (request: RequestFn, url: string = URL_A): Transport =>
  () =>
    createTransport(
      {
        key: 'test',
        name: 'test',
        request: request as EIP1193RequestFn,
        retryCount: 0,
        type: 'http',
      },
      { url },
    );

const rateLimited = (retryAfter?: string, url = URL_A) =>
  new HttpRequestError({
    status: 429,
    url,
    headers: new Headers(retryAfter ? { 'Retry-After': retryAfter } : {}),
  });

const setup = () => {
  const backendMock = vi.fn<RequestFn>(async () => 'backend');
  const publicMock = vi.fn<RequestFn>(async () => 'public');
  const instance = fallback(
    [retryAfterTransport(urlTransport(backendMock)), urlTransport(publicMock)],
    { retryCount: 0 },
  )({ chain: mainnet });
  const request = () => instance.request({ method: 'eth_blockNumber' });
  return { backendMock, publicMock, request };
};

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('retryAfterTransport', () => {
  it('skips the transport until Retry-After is over', async () => {
    const { backendMock, publicMock, request } = setup();
    backendMock.mockRejectedValueOnce(rateLimited('30'));

    await expect(request()).resolves.toBe('public');
    await expect(request()).resolves.toBe('public');
    vi.advanceTimersByTime(29_000);
    await expect(request()).resolves.toBe('public');
    // only the request that got the 429 reached the benched RPC
    expect(backendMock).toHaveBeenCalledTimes(1);
    expect(publicMock).toHaveBeenCalledTimes(3);

    vi.advanceTimersByTime(1_000);
    await expect(request()).resolves.toBe('backend');
    expect(backendMock).toHaveBeenCalledTimes(2);
  });

  it('fails fast with its own error while benched', async () => {
    const backendMock = vi.fn<RequestFn>();
    const error = rateLimited('30');
    backendMock.mockRejectedValueOnce(error);
    const instance = retryAfterTransport(urlTransport(backendMock))({
      chain: mainnet,
      retryCount: 0,
    });

    await expect(instance.request({ method: 'eth_blockNumber' })).rejects.toBe(
      error,
    );
    await expect(
      instance.request({ method: 'eth_blockNumber' }),
    ).rejects.toBeInstanceOf(RetryAfterActiveError);
    expect(backendMock).toHaveBeenCalledTimes(1);
  });

  it('accepts an HTTP date', async () => {
    const { backendMock, request } = setup();
    backendMock.mockRejectedValueOnce(
      rateLimited(new Date(Date.now() + 10_000).toUTCString()),
    );

    await request();
    await request();
    expect(backendMock).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(10_000);
    await request();
    expect(backendMock).toHaveBeenCalledTimes(2);
  });

  it('caps an excessive Retry-After', async () => {
    const { backendMock, request } = setup();
    backendMock.mockRejectedValueOnce(rateLimited('86400'));

    await request();
    vi.advanceTimersByTime(2 * 60 * 1000);
    await request();
    expect(backendMock).toHaveBeenCalledTimes(2);
  });

  it.each([
    ['no header', rateLimited()],
    ['a malformed header', rateLimited('soon')],
    ['a fractional delay', rateLimited('1.5')],
    ['a duplicated header', rateLimited('120, 120')],
    ['a loose date', rateLimited('2099-01-01')],
    ['a non-HTTP error', new Error('backend down')],
  ])('keeps the transport in play on %s', async (_, error) => {
    const { backendMock, request } = setup();
    backendMock.mockRejectedValueOnce(error);

    await expect(request()).resolves.toBe('public');
    await expect(request()).resolves.toBe('backend');
    expect(backendMock).toHaveBeenCalledTimes(2);
  });

  it('never shortens a bench with a later, shorter delay', async () => {
    const { backendMock, request } = setup();
    let rejectFirst!: (error: Error) => void;
    backendMock
      .mockImplementationOnce(
        () => new Promise((_, reject) => (rejectFirst = reject)),
      )
      .mockRejectedValueOnce(rateLimited('60'));

    // the first request is still in flight when the second one gets benched
    const first = request();
    await request();
    rejectFirst(rateLimited('1'));
    await first;

    vi.advanceTimersByTime(59_000);
    await request();
    expect(backendMock).toHaveBeenCalledTimes(2);
  });

  it('benches only the host that sent the header', async () => {
    const requestMock = vi.fn<RequestFn>(async () => 'ok');
    // one wrapper over a transport that resolves to a host per chain
    const wrapped = retryAfterTransport(({ chain }) =>
      urlTransport(
        requestMock,
        chain?.id === mainnet.id ? URL_A : URL_B,
      )({
        chain,
      }),
    );
    const request = (chain: Chain) =>
      wrapped({ chain, retryCount: 0 }).request({ method: 'eth_blockNumber' });

    requestMock.mockRejectedValueOnce(rateLimited('30', URL_A));
    await expect(request(mainnet)).rejects.toBeInstanceOf(HttpRequestError);

    await expect(request(mainnet)).rejects.toBeInstanceOf(
      RetryAfterActiveError,
    );
    await expect(request(optimism)).resolves.toBe('ok');
  });

  it('shares a bench between urls of one host', async () => {
    const requestMock = vi.fn<RequestFn>(async () => 'ok');
    const wrapped = retryAfterTransport(({ chain }) =>
      urlTransport(
        requestMock,
        `https://widget.test/api/rpc?chainId=${chain?.id}`,
      )({ chain }),
    );
    const request = (chain: Chain) =>
      wrapped({ chain, retryCount: 0 }).request({ method: 'eth_blockNumber' });

    requestMock.mockRejectedValueOnce(
      rateLimited('30', 'https://widget.test/api/rpc?chainId=1'),
    );
    await expect(request(mainnet)).rejects.toBeInstanceOf(HttpRequestError);

    await expect(request(optimism)).rejects.toBeInstanceOf(
      RetryAfterActiveError,
    );
    expect(requestMock).toHaveBeenCalledTimes(1);
  });
});
