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
