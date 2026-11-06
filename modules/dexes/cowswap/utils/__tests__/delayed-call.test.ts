import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createDelayedCall } from '../delayed-call';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('createDelayedCall', () => {
  it('runs the call after the delay', () => {
    const call = vi.fn();
    createDelayedCall(300).schedule(call);

    vi.advanceTimersByTime(299);
    expect(call).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(call).toHaveBeenCalledTimes(1);
  });

  it('drops a pending call on cancel', () => {
    const call = vi.fn();
    const delayed = createDelayedCall(300);
    delayed.schedule(call);
    delayed.cancel();

    vi.advanceTimersByTime(1000);
    expect(call).not.toHaveBeenCalled();
  });

  it('keeps only the last scheduled call', () => {
    const first = vi.fn();
    const second = vi.fn();
    const delayed = createDelayedCall(300);
    delayed.schedule(first);
    vi.advanceTimersByTime(200);
    delayed.schedule(second);

    vi.advanceTimersByTime(300);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('cancel after the call ran is a no-op', () => {
    const call = vi.fn();
    const delayed = createDelayedCall(300);
    delayed.schedule(call);
    vi.advanceTimersByTime(300);
    delayed.cancel();

    expect(call).toHaveBeenCalledTimes(1);
  });
});
