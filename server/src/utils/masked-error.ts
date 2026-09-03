import { mask } from '../logger.js';

/**
 * `console.*` bypasses the pino logMethod hook, and satanizer can't traverse
 * an Error's non-enumerable message/stack — serialize first, then mask.
 * Every `console.error(..., error)` in server code must go through this
 * (viem errors embed the full RPC URL, API key included, in `message`).
 */
export const maskedError = (error: unknown): unknown =>
  mask(
    error instanceof Error
      ? { name: error.name, message: error.message, stack: error.stack }
      : error,
  );
