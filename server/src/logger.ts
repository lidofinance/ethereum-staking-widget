import { satanizer, commonPatterns } from '@lidofinance/satanizer';

import { config } from './config.js';
import { clampArgs } from './utils/clamp-log-args.js';

/**
 * Secret masking for pino logs — port of `next-logger.config.cjs`.
 *
 * Every URL in `EL_RPC_URLS_*` typically embeds a provider API key; if one
 * leaks into a log line (upstream error objects include the URL) it must be
 * masked. Comma-split so each URL becomes its own pattern; otherwise
 * satanizer only matches the full concatenation.
 *
 * Wired as a pino `logMethod` hook via Fastify's logger options. NB: the
 * hook does NOT cover `console.*` — those sites must mask explicitly via
 * `utils/masked-error.ts`.
 */
const RPC_URL_VALUES = [
  config.EL_RPC_URLS_1,
  config.EL_RPC_URLS_10,
  config.EL_RPC_URLS_130,
  config.EL_RPC_URLS_1301,
  config.EL_RPC_URLS_17000,
  config.EL_RPC_URLS_560048,
  config.EL_RPC_URLS_11155111,
  config.EL_RPC_URLS_11155420,
].flatMap((value) =>
  (value || '')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean),
);

const patterns = [...commonPatterns, ...RPC_URL_VALUES].filter(Boolean);
export const mask = satanizer(patterns);

export const loggerOptions = {
  level: config.NODE_ENV === 'production' ? 'info' : 'debug',
  redact: ['req.headers.authorization', 'req.headers.cookie'],
  formatters: {
    level(label: string) {
      return { level: label };
    },
  },
  hooks: {
    // Cap arguments before masking — masking cost grows faster than linearly
    // with payload size. See utils/clamp-log-args.ts for the limits.
    logMethod(
      this: unknown,
      inputArgs: unknown[],
      method: (...args: unknown[]) => void,
    ) {
      return method.apply(this, mask(clampArgs(inputArgs)));
    },
  },
};
