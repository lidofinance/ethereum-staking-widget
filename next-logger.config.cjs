// eslint-disable-next-line @typescript-eslint/no-var-requires
const pino = require('pino'); // optional peer of next-logger, so a direct dependency here
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { satanizer, commonPatterns } = require('@lidofinance/satanizer');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const loadEnvConfig = require('@next/env').loadEnvConfig;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { clampArgs } = require('./scripts/logger/clamp-log-args.cjs');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { getRpcUrlPatterns } = require('./scripts/logger/rpc-url-log-patterns.cjs');

// Must load env first
const projectDir = process.cwd();
loadEnvConfig(projectDir);

const rpcUrlPatterns = getRpcUrlPatterns();

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
      // with payload size. See scripts/logger/clamp-log-args.cjs for the limits.
      logMethod(inputArgs, method) {
        return method.apply(this, mask(clampArgs(inputArgs)));
      },
    },
  });

module.exports = {
  logger,
};
