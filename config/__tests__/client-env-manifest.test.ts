import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import {
  buildAndSerializeClientEnv,
  parseClientEnv,
} from '../client-env-manifest';
import { WINDOW_ENV_LOADER_CSP_HASH } from '../../scripts/vite/window-env-plugin';
import { parseHtml } from '../../scripts/vite/parse-html';

const repoFile = (rel: string) =>
  readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8');

// The loader's source of truth is the inline script in index.html.
const WINDOW_ENV_LOADER =
  parseHtml(repoFile('../../index.html'))
    .querySelectorAll('script')
    .map((el) => el.innerHTML)
    .find((code) => code.startsWith('window.__env__=')) ?? '<loader missing>';

/**
 * Tests the runtime-env DELIVERY MECHANISM, deliberately env-independent:
 * no test names a manifest entry, so adding or removing an env var never
 * touches this suite. Chain env vars (SUPPORTED_CHAINS/DEFAULT_CHAIN)
 * appear by name only for the invariant tests — core semantics, not "an
 * env".
 */

// A value that tries every escape route at once: closing the script
// element, arming an SSI directive, and the config-string metacharacters
// of the former delivery mechanisms.
const HOSTILE =
  'x</script><script>alert(1)</script><!--#exec cmd="id"-->$\'\\|&';

const SANE_CHAINS = { DEFAULT_CHAIN: '1', SUPPORTED_CHAINS: '1' };

/** Every env var reads as HOSTILE (except explicit overrides), and reads
 * are recorded — lets tests iterate the manifest without knowing it. */
const hostileEnv = (overrides: Record<string, string> = SANE_CHAINS) => {
  const accessed = new Set<string>();
  const env: Record<string, string> = new Proxy(overrides, {
    get: (target, prop) => {
      if (typeof prop !== 'string') return undefined;
      accessed.add(prop);
      return target[prop] ?? `${HOSTILE}(${prop})`;
    },
  });
  return { env, accessed };
};

describe('buildAndSerializeClientEnv / parseClientEnv', () => {
  it('produces wire JSON the consumer guardrail accepts — both ends, same schema', () => {
    for (const env of [{}, hostileEnv().env]) {
      const wire = buildAndSerializeClientEnv(env);
      const parsed = parseClientEnv(JSON.parse(wire));
      expect(parsed).toEqual(JSON.parse(wire));
    }
  });

  it('never emits a literal "<" — nothing can close the script element or arm SSI', () => {
    const wire = buildAndSerializeClientEnv(hostileEnv().env);
    expect(wire).not.toContain('<');
    // and the escaping is lossless: hostile values survive the round-trip
    expect(JSON.stringify(JSON.parse(wire))).toContain('alert(1)');
  });

  it('ships only transformed values — at least one read env var must not appear in the output', () => {
    // The generic form of "presence-style flags never leak their source
    // value" (e.g. an api-pod file path shipping as true/false).
    const { env, accessed } = hostileEnv();
    const wire = buildAndSerializeClientEnv(env);
    const leaked = [...accessed].filter((name) => wire.includes(`(${name})`));
    expect(accessed.size).toBeGreaterThan(0);
    expect(leaked.length).toBeLessThan(accessed.size);
  });

  it('rejects injected payloads that are not the final shape', () => {
    expect(() => parseClientEnv('garbage')).toThrow();
    expect(() => parseClientEnv({})).toThrow();
    const valid = JSON.parse(buildAndSerializeClientEnv({}));
    expect(() =>
      parseClientEnv({ ...valid, supportedChains: 'not-a-list' }),
    ).toThrow();
    // config invariants hold on the consumer side too
    expect(() =>
      parseClientEnv({ ...valid, defaultChain: 1, supportedChains: [1, 1] }),
    ).toThrow(/duplicates/);
  });

  it('rejects duplicated supportedChains at the producer', () => {
    expect(() =>
      buildAndSerializeClientEnv({
        DEFAULT_CHAIN: '1',
        SUPPORTED_CHAINS: '1,1',
      }),
    ).toThrow(/duplicates/);
  });

  it('rejects a defaultChain that is not the first supported chain', () => {
    expect(() =>
      buildAndSerializeClientEnv({
        DEFAULT_CHAIN: '5',
        SUPPORTED_CHAINS: '1,5',
      }),
    ).toThrow(/first element/);
  });
});

describe('window-env loader contract', () => {
  it('parses the serialized payload from the data element into window.__env__', () => {
    const payload = buildAndSerializeClientEnv(hostileEnv().env);
    const window: { __env__?: unknown } = {};
    const document = {
      getElementById: (id: string) =>
        id === 'window-env' ? { textContent: `\n  ${payload}\n` } : null,
    };
    // executing our own fixed loader constant IS the point of this test
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    new Function('window', 'document', WINDOW_ENV_LOADER)(window, document);
    expect(window.__env__).toEqual(JSON.parse(payload));
  });

  it('queries the same element id the data element declares', () => {
    expect(WINDOW_ENV_LOADER).toContain('getElementById("window-env")');
    expect(repoFile('../../index.html')).toContain('id="window-env"');
  });

  it('has its exact content hashed into both hardcoded CSP hash copies', () => {
    // Loader lives inline in index.html; its hash is hardcoded in the
    // plugin (→ IPFS CSP meta) and the nginx entrypoint (→ web CSP
    // header). This recomputation is the only thing catching a loader
    // edit — or an index.html reformat — that forgets either copy.
    const expected =
      'sha256-' +
      createHash('sha256').update(WINDOW_ENV_LOADER).digest('base64');
    expect(WINDOW_ENV_LOADER_CSP_HASH).toBe(expected);
    expect(repoFile('../../infra/nginx/entrypoint.sh')).toContain(
      `WINDOW_ENV_LOADER_HASH="${expected}"`,
    );
  });
});
