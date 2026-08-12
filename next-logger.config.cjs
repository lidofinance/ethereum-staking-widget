// eslint-disable-next-line @typescript-eslint/no-var-requires
const pino = require('pino'); // It's ok that pino is transit dependency, it's required by next-logger
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { satanizer, commonPatterns } = require('@lidofinance/satanizer');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const loadEnvConfig = require('@next/env').loadEnvConfig;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { clampArgs } = require('./utilsApi/clamp-log-args.cjs');

// Must load env first
const projectDir = process.cwd();
loadEnvConfig(projectDir);

const RPC_URL_ENV_KEYS = [
  'EL_RPC_URLS_1',
  'EL_RPC_URLS_10',
  'EL_RPC_URLS_130',
  'EL_RPC_URLS_1301',
  'EL_RPC_URLS_17000',
  'EL_RPC_URLS_560048',
  'EL_RPC_URLS_11155111',
  'EL_RPC_URLS_11155420',
];

// Comma-split so each URL becomes its own pattern; otherwise satanizer only matches the full concatenation.
const rpcUrlPatterns = RPC_URL_ENV_KEYS.flatMap((key) =>
  (process.env[key] || '')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean),
);

const patterns = [...commonPatterns, ...rpcUrlPatterns].filter(Boolean);
const mask = satanizer(patterns);

const logger = (defaultConfig) =>
  pino({
    ...defaultConfig,
    formatters: {
      ...defaultConfig.formatters,
      level(label, _number) {
        return { level: label };
      },
    },
    hooks: {
      // Cap arguments before masking — masking cost grows faster than linearly
      // with payload size. See utilsApi/clamp-log-args.cjs for the limits.
      logMethod(inputArgs, method) {
        return method.apply(this, mask(clampArgs(inputArgs)));
      },
    },
  });

module.exports = {
  logger,
};
