import maskString from '@darkobits/mask-string';

const anyHex = new RegExp('0x[a-fA-F0-9]+', 'ig');
const anyEnsAddress = new RegExp('[a-zA-Z.]+\\.eth', 'ig');

enum LEVEL {
  error = 'error',
  warn = 'warn',
  info = 'info',
  debug = 'debug',
}

const stringify = (data: unknown) =>
  data instanceof Error
    ? // extract Error's non-enumerable props before stringifying
      JSON.stringify({
        message: data.message,
        stack: data.stack,
      })
    : JSON.stringify(data);

export const serverLoggerFactory = (secrets: Array<RegExp | string>) => {
  const patterns = [...secrets, anyHex, anyEnsAddress].filter(Boolean);
  const mask = (message: string): string => maskString(patterns, message);

  const log =
    (level: LEVEL) =>
    (...output: unknown[]): void => {
      try {
        console[level](...output.map(stringify).map(mask));
      } catch {
        console.warn('Failed to sanitize output');
      }
    };
  return process.env.NODE_ENV === 'production'
    ? {
        error: log(LEVEL.error),
        warn: log(LEVEL.warn),
        info: log(LEVEL.info),
        debug: log(LEVEL.debug),
        log: log(LEVEL.debug),
      }
    : console;
};
