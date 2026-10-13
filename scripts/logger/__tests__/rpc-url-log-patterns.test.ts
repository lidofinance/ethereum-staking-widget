import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { commonPatterns, satanizer } from '@lidofinance/satanizer';

// `createRequire` because the module is `.cjs` (next-logger preloads the logger
// config without a build step) and the project is `"type": "module"`.
const requireCjs = createRequire(import.meta.url);
const { getRpcUrlPatterns } = requireCjs('../rpc-url-log-patterns.cjs') as {
  getRpcUrlPatterns: (env?: Record<string, string | undefined>) => string[];
};

// Like the masking the logger does: the common patterns plus the RPC URLs
const maskWith = (env: Record<string, string | undefined>) =>
  satanizer([...commonPatterns, ...getRpcUrlPatterns(env)]);

// A key short enough to escape the generic 40+ character pattern
const KEY = 'k3y';
const BASE_URL = `https://base.example/v3/${KEY}`;
const LINEA_URL = `https://linea.example/?apiKey=${KEY}`;

describe('getRpcUrlPatterns', () => {
  it('covers every EL_RPC_URLS_<chainId> variable, whatever the chain', () => {
    const patterns = getRpcUrlPatterns({
      EL_RPC_URLS_1: 'https://eth.example/a',
      EL_RPC_URLS_8453: BASE_URL,
      EL_RPC_URLS_59144: LINEA_URL,
      EL_RPC_URLS_42161: ' https://arb.example/b , https://arb.example/c ',
    });

    expect(patterns).toEqual([
      'https://eth.example/a',
      BASE_URL,
      LINEA_URL,
      'https://arb.example/b',
      'https://arb.example/c',
    ]);
  });

  it('ignores unrelated and prefill variables', () => {
    const patterns = getRpcUrlPatterns({
      PREFILL_UNSAFE_EL_RPC_URLS_1: 'https://public.example',
      EL_RPC_URLS_: 'https://nochain.example',
      EL_RPC_URLS_1X: 'https://badchain.example',
      ONE_INCH_API_KEY: 'secret',
      EL_RPC_URLS_1: '',
      EL_RPC_URLS_10: undefined,
    });

    expect(patterns).toEqual([]);
  });

  it('covers every EL_RPC_URLS variable documented in .env.example', () => {
    const example = readFileSync(
      resolve(__dirname, '../../../.env.example'),
      'utf8',
    );
    const documented = example
      .split('\n')
      .map((line) => /^(EL_RPC_URLS_\d+)=/.exec(line)?.[1])
      .filter((key): key is string => !!key);
    expect(documented.length).toBeGreaterThan(0);

    const env = Object.fromEntries(
      documented.map((key) => [key, `https://${key}.example/v3/${KEY}`]),
    );

    expect(getRpcUrlPatterns(env)).toHaveLength(documented.length);
  });

  it('masks a short provider key in a viem-style error message', () => {
    const mask = maskWith({
      EL_RPC_URLS_8453: BASE_URL,
      EL_RPC_URLS_59144: LINEA_URL,
    });

    // viem strips basic auth only; a key in the path or query stays as is
    const masked = mask(
      `[checkRPC] [chainId=8453] Error checking RPC base.example: HTTP request failed.\n\nURL: ${BASE_URL}\nRequest body: {}` +
        `\n[checkRPC] [chainId=59144] The request took too long to respond.\n\nURL: ${LINEA_URL}`,
    );

    expect(masked).not.toContain(KEY);
    expect(masked).not.toContain(BASE_URL);
    expect(masked).not.toContain(LINEA_URL);
    expect(masked).toContain('[chainId=8453]');
  });

  it('leaves the same key unmasked when its chain is not configured', () => {
    // documents why the list must not be maintained by hand
    const mask = maskWith({ EL_RPC_URLS_1: 'https://eth.example/v3/other' });
    expect(mask(`URL: ${BASE_URL}`)).toContain(KEY);
  });
});
