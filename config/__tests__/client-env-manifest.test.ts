import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import {
  buildAndSerializeClientEnv,
  parseClientEnv,
} from '../client-env-manifest';
import {
  WINDOW_ENV_LOADER,
  WINDOW_ENV_LOADER_CSP_HASH,
  WINDOW_ENV_PLACEHOLDER,
} from '../../scripts/vite/window-env-plugin';

/**
 * Tests the runtime-env DELIVERY MECHANISM, deliberately env-independent:
 * no test names a manifest entry, so adding or removing an env var never
 * touches this suite. The properties guarded here:
 *  - the wire format is the final serializable config shape (round-trip),
 *  - no env value can break out of the raw-text script element,
 *  - the fixed loader parses exactly what serializeClientEnv produces,
 *  - the loader's CSP hash tracks its content,
 *  - config invariants fail at the producer, not in browsers.
 *
 * Chain env vars (SUPPORTED_CHAINS/DEFAULT_CHAIN) appear by name only for
 * the invariant tests — they are core semantics, not "an env".
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

describe('buildClientEnv / serializeClientEnv', () => {
  it('produces a JSON-serializable final shape that round-trips losslessly', () => {
    const env = buildAndSerializeClientEnv({});
    const roundTripped = JSON.parse(buildAndSerializeClientEnv(env));
    for (const [key, value] of Object.entries(env)) {
      if (value !== undefined) {
        expect(roundTripped[key]).toEqual(value);
      }
    }
  });

  it('never emits a literal "<" — nothing can close the script element or arm SSI', () => {
    const { env } = hostileEnv();
    const serialized = buildAndSerializeClientEnv(env);
    expect(serialized).not.toContain('<');
    // and the escaping is lossless: hostile values survive the round-trip
    const values = JSON.stringify(JSON.parse(serialized));
    expect(values).toContain('alert(1)');
  });

  it('ships only transformed values — at least one read env var must not appear in the output', () => {
    // The generic form of "presence-style flags never leak their source
    // value" (e.g. an api-pod file path shipping as true/false): if every
    // env var this build READ also appeared verbatim in the payload, raw
    // values would be flowing through untransformed.
    const { env, accessed } = hostileEnv();
    const serialized = buildAndSerializeClientEnv(env);
    const leaked = [...accessed].filter((name) =>
      serialized.includes(`(${name})`),
    );
    expect(accessed.size).toBeGreaterThan(0);
    expect(leaked.length).toBeLessThan(accessed.size);
  });

  it('validates the pass-through on both ends with the same schema', () => {
    // producer output → wire → consumer: what buildClientEnv emits is
    // accepted verbatim by parseClientEnv after the JSON round-trip
    const produced = buildAndSerializeClientEnv(hostileEnv().env);
    const consumed = parseClientEnv(JSON.parse(produced));
    expect(consumed).toEqual(JSON.parse(JSON.stringify(produced)));
  });

  it('rejects injected payloads that are not the final shape', () => {
    // consumer guardrail: garbage or shape drift in the data element must
    // throw (fail closed), never propagate into the app
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
    const payload = serializeClientEnv(
      buildAndSerializeClientEnv(hostileEnv().env),
    );
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

  it('queries the same element id the placeholder declares', () => {
    expect(WINDOW_ENV_PLACEHOLDER).toContain('id="window-env"');
    expect(WINDOW_ENV_LOADER).toContain('getElementById("window-env")');
  });

  it('has its exact content hashed into both hardcoded CSP hash copies', () => {
    // The hash is hardcoded (the loader is a fixed constant) in two
    // places: the plugin export (→ IPFS CSP meta) and the nginx
    // entrypoint (→ web CSP header). This recomputation is the only
    // thing catching a loader edit that forgets either copy.
    const expected =
      'sha256-' +
      createHash('sha256').update(WINDOW_ENV_LOADER).digest('base64');
    expect(WINDOW_ENV_LOADER_CSP_HASH).toBe(expected);
    const entrypoint = readFileSync(
      fileURLToPath(
        new URL('../../infra/nginx/entrypoint.sh', import.meta.url),
      ),
      'utf8',
    );
    expect(entrypoint).toContain(`WINDOW_ENV_LOADER_HASH="${expected}"`);
  });
});
