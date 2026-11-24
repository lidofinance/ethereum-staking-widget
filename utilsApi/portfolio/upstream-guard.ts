import { LambdaHttpError } from './lambda-client';

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

export type BudgetWindow = 'minute' | 'hour' | 'day';
export type UpstreamRejectReason = BudgetWindow | 'paused' | 'disabled';
export type UpstreamCallResult = 'ok' | 'error' | 'quota';

export class UpstreamUnavailableError extends Error {
  constructor(readonly reason: string) {
    super(`Portfolio upstream unavailable: ${reason}`);
  }
}

// a pause shared by every guard that is given the same breaker
export type QuotaBreaker = { pausedUntil: number };

export const createQuotaBreaker = (): QuotaBreaker => ({ pausedUntil: 0 });

export type UpstreamGuardOptions = {
  maxCallsPerMinute: number;
  maxCallsPerHour?: number;
  maxCallsPerDay?: number;
  // HTTP 429: the request rate, shared by the whole API key
  breakerMs: number;
  breaker?: QuotaBreaker;
  // HTTP 402: the quota is used up; shared by the guards given this breaker
  quotaBreakerMs?: number;
  quotaBreaker?: QuotaBreaker;
  // kill switch: no upstream calls at all
  disabled?: boolean;
  onReject?: (reason: UpstreamRejectReason) => void;
  onResult?: (result: UpstreamCallResult) => void;
  now?: () => number;
};

export type UpstreamGuard = {
  run: <T>(call: () => Promise<T>) => Promise<T>;
};

const QUOTA_STATUS = 402;
const RATE_STATUS = 429;

export const isQuotaError = (error: unknown): boolean =>
  error instanceof LambdaHttpError &&
  (error.status === QUOTA_STATUS || error.status === RATE_STATUS);

// per-process caps on upstream calls; quota errors pause the calls
export const createUpstreamGuard = ({
  maxCallsPerMinute,
  maxCallsPerHour = Infinity,
  maxCallsPerDay = Infinity,
  breakerMs,
  breaker = createQuotaBreaker(),
  quotaBreakerMs = breakerMs,
  quotaBreaker = breaker,
  disabled = false,
  onReject,
  onResult,
  now = Date.now,
}: UpstreamGuardOptions): UpstreamGuard => {
  // widest first, so the reported window is the one that lasts longest
  const budgetWindows: {
    name: BudgetWindow;
    sizeMs: number;
    max: number;
    start: number;
    calls: number;
  }[] = [
    {
      name: 'day',
      sizeMs: DAY_MS,
      max: maxCallsPerDay,
      start: now(),
      calls: 0,
    },
    {
      name: 'hour',
      sizeMs: HOUR_MS,
      max: maxCallsPerHour,
      start: now(),
      calls: 0,
    },
    {
      name: 'minute',
      sizeMs: MINUTE_MS,
      max: maxCallsPerMinute,
      start: now(),
      calls: 0,
    },
  ];

  const reject = (reason: UpstreamRejectReason, message: string): never => {
    onReject?.(reason);
    throw new UpstreamUnavailableError(message);
  };

  return {
    run: async (upstreamCall) => {
      if (disabled) reject('disabled', 'disabled');

      const currentTime = now();
      if (
        currentTime < breaker.pausedUntil ||
        currentTime < quotaBreaker.pausedUntil
      ) {
        reject('paused', 'paused');
      }

      for (const budgetWindow of budgetWindows) {
        if (currentTime - budgetWindow.start >= budgetWindow.sizeMs) {
          budgetWindow.start = currentTime;
          budgetWindow.calls = 0;
        }
      }
      const exhaustedWindow = budgetWindows.find(
        (budgetWindow) => budgetWindow.calls >= budgetWindow.max,
      );
      if (exhaustedWindow) reject(exhaustedWindow.name, 'budget exceeded');
      for (const budgetWindow of budgetWindows) budgetWindow.calls += 1;

      try {
        const callResult = await upstreamCall();
        onResult?.('ok');
        return callResult;
      } catch (error) {
        const status = error instanceof LambdaHttpError ? error.status : null;
        if (status === RATE_STATUS) breaker.pausedUntil = now() + breakerMs;
        if (status === QUOTA_STATUS) {
          quotaBreaker.pausedUntil = now() + quotaBreakerMs;
        }
        onResult?.(isQuotaError(error) ? 'quota' : 'error');
        throw error;
      }
    },
  };
};
