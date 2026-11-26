// query-core disables refetchInterval when `window` is undefined (isServer);
// stub it before the module is evaluated so the browser code path runs
vi.hoisted(() => vi.stubGlobal('window', globalThis));

import { QueryClient, QueryObserver } from '@tanstack/react-query';

import {
  STRATEGY_LAZY,
  STRATEGY_MANIFEST,
} from 'consts/react-query-strategies';

const MINUTE = 60 * 1000;

// Mounts one query with the given strategy, lets `duration` pass and reports
// how many times the queryFn ran
const countFetches = async (strategy: object, duration: number) => {
  const queryFn = vi.fn(async () => 'manifest');
  const observer = new QueryObserver(new QueryClient(), {
    queryKey: ['external-config'],
    queryFn,
    ...strategy,
  });
  const unsubscribe = observer.subscribe(() => undefined);
  await vi.advanceTimersByTimeAsync(duration);
  unsubscribe();
  return queryFn.mock.calls.length;
};

// SW-ROUTE-ADMIT-01: a mounted manifest query must pick up remote changes on
// its own — going stale is not enough, only an interval refetches
describe('manifest query refetching', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());
  afterAll(() => vi.unstubAllGlobals());

  it('without an interval the query fetches once and never again', async () => {
    const { refetchInterval: _, ...staleOnly } = STRATEGY_LAZY;
    expect(await countFetches(staleOnly, 30 * MINUTE)).toBe(1);
  });

  it('STRATEGY_MANIFEST refetches on every interval tick', async () => {
    const { refetchInterval } = STRATEGY_MANIFEST;
    expect(await countFetches(STRATEGY_MANIFEST, 3 * refetchInterval)).toBe(4);
  });

  it('STRATEGY_MANIFEST polls faster than the lazy default', () => {
    expect(STRATEGY_MANIFEST.refetchInterval).toBeLessThan(
      STRATEGY_LAZY.refetchInterval,
    );
  });
});

describe('manifest query ordering', () => {
  const deferred = <T>() => {
    let resolve!: (value: T) => void;
    let reject!: (error: Error) => void;
    const promise = new Promise<T>((_resolve, _reject) => {
      resolve = _resolve;
      reject = _reject;
    });
    return { promise, resolve, reject };
  };

  const setup = () => {
    const calls: ReturnType<typeof deferred<string>>[] = [];
    const client = new QueryClient();
    const observer = new QueryObserver(client, {
      queryKey: ['external-config'],
      queryFn: () => {
        const call = deferred<string>();
        calls.push(call);
        return call.promise;
      },
      retry: false,
    });
    observer.subscribe(() => undefined);
    return { calls, observer, client };
  };

  it('shares one load between overlapping requests', async () => {
    const { calls, observer } = setup();
    await vi.waitFor(() => expect(calls).toHaveLength(1));
    void observer.refetch();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(calls).toHaveLength(1);
  });

  it('keeps the newest response when an older load settles later', async () => {
    const { calls, observer } = setup();
    await vi.waitFor(() => expect(calls).toHaveLength(1));
    calls[0].resolve('enabled');
    await vi.waitFor(() =>
      expect(observer.getCurrentResult().data).toBe('enabled'),
    );
    // a second refetch supersedes the pending one
    void observer.refetch();
    await vi.waitFor(() => expect(calls).toHaveLength(2));
    void observer.refetch();
    await vi.waitFor(() => expect(calls).toHaveLength(3));
    calls[2].resolve('suspended');
    await vi.waitFor(() =>
      expect(observer.getCurrentResult().data).toBe('suspended'),
    );
    calls[1].resolve('enabled');
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(observer.getCurrentResult().data).toBe('suspended');
  });

  it('keeps the last response when a later load fails', async () => {
    const { calls, observer } = setup();
    await vi.waitFor(() => expect(calls).toHaveLength(1));
    calls[0].resolve('suspended');
    await vi.waitFor(() =>
      expect(observer.getCurrentResult().data).toBe('suspended'),
    );
    void observer.refetch();
    await vi.waitFor(() => expect(calls).toHaveLength(2));
    calls[1].reject(new Error('network'));
    await vi.waitFor(() =>
      expect(observer.getCurrentResult().isError).toBe(true),
    );
    expect(observer.getCurrentResult().data).toBe('suspended');
  });
});
