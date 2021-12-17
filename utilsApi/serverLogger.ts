import { createLogger, transports, format } from 'winston';

const { json, prettyPrint, timestamp, errors, combine } = format;

const formatErrorStack = format((info) => {
  if (info instanceof Error) {
    return {
      ...info,
      stack: info.stack,
    };
  }
  return info;
});

export const serverLogger = createLogger({
  defaultMeta: {
    service: 'ethereum-staking-widget',
  },
  format: combine(
    json(),
    errors({
      stack: true,
    }),
    formatErrorStack(),
    timestamp(),
    prettyPrint(),
  ),
  transports: [new transports.Console()],
});
