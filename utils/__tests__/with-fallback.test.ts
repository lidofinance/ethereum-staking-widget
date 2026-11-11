import { expectTypeOf, vi } from 'vitest';

import { withFallback } from '../with-fallback';

describe('withFallback', () => {
  it('resolves with the promise value', async () => {
    const onError = vi.fn();
    await expect(
      withFallback(Promise.resolve(1n), 0n, { onError }),
    ).resolves.toBe(1n);
    expect(onError).not.toHaveBeenCalled();
  });

  it('resolves with undefined by default on rejection', async () => {
    const result = withFallback(Promise.reject<bigint>(new Error('fail')));
    expectTypeOf(result).toEqualTypeOf<Promise<bigint | undefined>>();
    await expect(result).resolves.toBeUndefined();
  });

  it('resolves with the given fallback on rejection', async () => {
    const result = withFallback(
      Promise.reject<bigint>(new Error('fail')),
      null,
    );
    expectTypeOf(result).toEqualTypeOf<Promise<bigint | null>>();
    await expect(result).resolves.toBeNull();
  });

  it('takes the fallback type only from a passed fallback', () => {
    // @ts-expect-error an explicit fallback type needs the fallback itself
    void withFallback<bigint, bigint>(Promise.resolve(1n));
  });

  it('reports the error', async () => {
    const error = new Error('fail');
    const onError = vi.fn();
    await withFallback(Promise.reject(error), undefined, { onError });
    expect(onError).toHaveBeenCalledExactlyOnceWith(error);
  });
});
