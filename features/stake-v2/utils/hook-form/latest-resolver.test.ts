import { withLatestResult } from './latest-resolver';

const deferred = <T>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((_resolve) => {
    resolve = _resolve;
  });
  return { promise, resolve };
};

describe('withLatestResult', () => {
  it('a superseded call resolves with the newest result', async () => {
    const slow = deferred<string>();
    const fast = deferred<string>();
    const queue = [slow.promise, fast.promise];
    const run = withLatestResult(() => queue.shift() as Promise<string>);

    const first = run();
    const second = run();
    fast.resolve('new');
    slow.resolve('stale');

    await expect(first).resolves.toBe('new');
    await expect(second).resolves.toBe('new');
  });

  it('follows a chain of newer calls to the last one', async () => {
    const calls = [deferred<number>(), deferred<number>(), deferred<number>()];
    let index = 0;
    const run = withLatestResult(() => calls[index++].promise);

    const first = run();
    calls[0].resolve(0);
    const second = run();
    const third = run();
    calls[1].resolve(1);
    calls[2].resolve(2);

    await expect(first).resolves.toBe(2);
    await expect(second).resolves.toBe(2);
    await expect(third).resolves.toBe(2);
  });

  it('a lone call keeps its own result, sync or async', async () => {
    await expect(withLatestResult(() => 1)()).resolves.toBe(1);
    await expect(withLatestResult(async () => 2)()).resolves.toBe(2);
  });

  it('separate wrappers do not share the latest call', async () => {
    const a = withLatestResult(async () => 'a');
    const b = withLatestResult(async () => 'b');
    await expect(Promise.all([a(), b()])).resolves.toEqual(['a', 'b']);
  });

  it('passes the arguments through', async () => {
    const run = withLatestResult(async (x: number, y: number) => x + y);
    await expect(run(1, 2)).resolves.toBe(3);
  });
});
