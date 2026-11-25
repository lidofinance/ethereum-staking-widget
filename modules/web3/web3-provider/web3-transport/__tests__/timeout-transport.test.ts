import { vi } from 'vitest';
import { custom, TimeoutError, type EIP1193Provider } from 'viem';
import { mainnet } from 'viem/chains';

import { timeoutTransport } from '../timeout-transport';

type RequestFn = (args: { method: string }) => Promise<unknown>;

const setup = (request: RequestFn) => {
  const instance = timeoutTransport(
    custom({ request } as EIP1193Provider),
    1_000,
  )({ chain: mainnet, retryCount: 0 });
  return () => instance.request({ method: 'eth_blockNumber' });
};

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('timeoutTransport', () => {
  it('passes an answer that comes in time', async () => {
    const request = setup(
      () => new Promise((resolve) => setTimeout(() => resolve('ok'), 999)),
    );

    const result = request();
    await vi.advanceTimersByTimeAsync(999);
    await expect(result).resolves.toBe('ok');
  });

  it('passes a rejection as is', async () => {
    const error = Object.assign(new Error('User rejected'), { code: 4001 });
    const request = setup(async () => {
      throw error;
    });

    await expect(request()).rejects.toMatchObject({ code: 4001 });
  });

  it('rejects a request that was not answered in time', async () => {
    const request = setup(() => new Promise(() => undefined));

    const result = request();
    const assertion = expect(result).rejects.toBeInstanceOf(TimeoutError);
    await vi.advanceTimersByTimeAsync(1_000);
    await assertion;
  });
});
