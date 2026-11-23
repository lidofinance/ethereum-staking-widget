import { LambdaHttpError } from '../lambda-client';
import {
  UpstreamUnavailableError,
  createQuotaBreaker,
  createUpstreamGuard,
} from '../upstream-guard';

const ok = () => Promise.resolve('ok');

describe('createUpstreamGuard', () => {
  it('stops calls over the per-minute budget and resets next minute', async () => {
    let time = 0;
    const guard = createUpstreamGuard({
      maxCallsPerMinute: 2,
      breakerMs: 1000,
      now: () => time,
    });
    await guard.run(ok);
    await guard.run(ok);
    const call = vi.fn(ok);
    await expect(guard.run(call)).rejects.toThrow(UpstreamUnavailableError);
    expect(call).not.toHaveBeenCalled();

    time = 60_000;
    await expect(guard.run(ok)).resolves.toBe('ok');
  });

  it.each([402, 429])('pauses all calls after HTTP %s', async (status) => {
    let time = 0;
    const guard = createUpstreamGuard({
      maxCallsPerMinute: 100,
      breakerMs: 5000,
      now: () => time,
    });
    await expect(
      guard.run(() => Promise.reject(new LambdaHttpError(status))),
    ).rejects.toThrow(LambdaHttpError);

    const call = vi.fn(ok);
    await expect(guard.run(call)).rejects.toThrow(UpstreamUnavailableError);
    expect(call).not.toHaveBeenCalled();

    time = 5000;
    await expect(guard.run(ok)).resolves.toBe('ok');
  });

  it('does not pause on other errors', async () => {
    const guard = createUpstreamGuard({
      maxCallsPerMinute: 100,
      breakerMs: 5000,
    });
    await expect(
      guard.run(() => Promise.reject(new LambdaHttpError(500))),
    ).rejects.toThrow(LambdaHttpError);
    await expect(guard.run(ok)).resolves.toBe('ok');
  });

  it('pauses every guard sharing the breaker', async () => {
    const breaker = createQuotaBreaker();
    const positions = createUpstreamGuard({
      maxCallsPerMinute: 100,
      breakerMs: 5000,
      breaker,
    });
    const history = createUpstreamGuard({
      maxCallsPerMinute: 100,
      breakerMs: 5000,
      breaker,
    });
    await expect(
      positions.run(() => Promise.reject(new LambdaHttpError(402))),
    ).rejects.toThrow(LambdaHttpError);

    const call = vi.fn(ok);
    await expect(history.run(call)).rejects.toThrow(UpstreamUnavailableError);
    expect(call).not.toHaveBeenCalled();
  });

  it.each([
    ['hour', { maxCallsPerHour: 2 }, 60 * 60_000],
    ['day', { maxCallsPerDay: 2 }, 24 * 60 * 60_000],
  ] as const)(
    'stops calls over the per-%s budget until it ends',
    async (reason, limits, windowMs) => {
      let time = 0;
      const onReject = vi.fn();
      const guard = createUpstreamGuard({
        maxCallsPerMinute: 100,
        ...limits,
        breakerMs: 1000,
        onReject,
        now: () => time,
      });
      await guard.run(ok);
      // a new minute does not bring the wider budget back
      time = 2 * 60_000;
      await guard.run(ok);
      time = 4 * 60_000;
      const call = vi.fn(ok);
      await expect(guard.run(call)).rejects.toThrow(UpstreamUnavailableError);
      expect(call).not.toHaveBeenCalled();
      expect(onReject).toHaveBeenCalledExactlyOnceWith(reason);

      time = windowMs;
      await expect(guard.run(ok)).resolves.toBe('ok');
    },
  );

  it('makes no call when disabled', async () => {
    const onReject = vi.fn();
    const guard = createUpstreamGuard({
      maxCallsPerMinute: 100,
      breakerMs: 1000,
      disabled: true,
      onReject,
    });
    const call = vi.fn(ok);
    await expect(guard.run(call)).rejects.toThrow(UpstreamUnavailableError);
    expect(call).not.toHaveBeenCalled();
    expect(onReject).toHaveBeenCalledExactlyOnceWith('disabled');
  });

  it('pauses the whole key on 429, one quota category on 402', async () => {
    let time = 0;
    const breaker = createQuotaBreaker();
    const realtime = createQuotaBreaker();
    const historical = createQuotaBreaker();
    const make = (quotaBreaker: typeof breaker) =>
      createUpstreamGuard({
        maxCallsPerMinute: 100,
        breakerMs: 1000,
        breaker,
        quotaBreakerMs: 60_000,
        quotaBreaker,
        now: () => time,
      });
    const positions = make(realtime);
    const history = make(realtime);
    const rewards = make(historical);
    const fail = (status: number) => () =>
      Promise.reject(new LambdaHttpError(status));

    // the historical quota is used up: real-time calls go on
    await expect(rewards.run(fail(402))).rejects.toThrow(LambdaHttpError);
    await expect(rewards.run(ok)).rejects.toThrow(UpstreamUnavailableError);
    await expect(positions.run(ok)).resolves.toBe('ok');

    // the rate limit stops every category, but only briefly
    await expect(history.run(fail(429))).rejects.toThrow(LambdaHttpError);
    await expect(positions.run(ok)).rejects.toThrow(UpstreamUnavailableError);
    time = 1000;
    await expect(positions.run(ok)).resolves.toBe('ok');
    await expect(rewards.run(ok)).rejects.toThrow(UpstreamUnavailableError);

    time = 60_000;
    await expect(rewards.run(ok)).resolves.toBe('ok');
  });

  it('reports how each made call ended', async () => {
    const onResult = vi.fn();
    const guard = createUpstreamGuard({
      maxCallsPerMinute: 100,
      breakerMs: 0,
      onResult,
    });
    await guard.run(ok);
    await guard.run(() => Promise.reject(new Error('boom'))).catch(() => null);
    await guard
      .run(() => Promise.reject(new LambdaHttpError(402)))
      .catch(() => null);
    expect(onResult.mock.calls.map(([result]) => result)).toEqual([
      'ok',
      'error',
      'quota',
    ]);
  });
});
