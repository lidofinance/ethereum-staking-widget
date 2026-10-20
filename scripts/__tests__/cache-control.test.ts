import type { ServerResponse } from 'node:http';

import {
  CACHE_CONTROL_HEADER,
  CACHE_CONTROL_VALUE,
  overrideCacheControl,
} from '../cache-control.mjs';

// Response directives a cache acts on: RFC 9111 §5.2.2 plus RFC 5861.
// A misspelled directive (`s-max-age`) is silently ignored by every cache, and
// the e2e header test pins whatever this constant says, so spelling is checked
// here against the registry rather than against itself.
const KNOWN_DIRECTIVES = new Set([
  'public',
  'private',
  'no-cache',
  'no-store',
  'no-transform',
  'must-revalidate',
  'proxy-revalidate',
  'must-understand',
  'immutable',
  'max-age',
  's-maxage',
  'stale-while-revalidate',
  'stale-if-error',
]);

const VALUED_DIRECTIVES = new Set([
  'max-age',
  's-maxage',
  'stale-while-revalidate',
  'stale-if-error',
]);

const parseDirectives = (value: string) =>
  value.split(',').map((part) => {
    const [name, argument] = part.trim().split('=');
    return { name, argument };
  });

describe('page Cache-Control policy', () => {
  const directives = parseDirectives(CACHE_CONTROL_VALUE);

  it.each(directives)('uses a registered directive: $name', ({ name }) => {
    expect(KNOWN_DIRECTIVES.has(name)).toBe(true);
  });

  it.each(directives)(
    'gives $name a well-formed value',
    ({ name, argument }) => {
      if (VALUED_DIRECTIVES.has(name)) {
        expect(argument).toMatch(/^\d+$/);
      } else {
        expect(argument).toBeUndefined();
      }
    },
  );

  it('keeps the shared-cache lifetime that Cloudflare honours', () => {
    expect(directives.map((d) => d.name)).toContain('s-maxage');
  });

  it('names the override header in lowercase, as server.mjs compares it', () => {
    expect(CACHE_CONTROL_HEADER).toBe(CACHE_CONTROL_HEADER.toLowerCase());
  });
});

// The slice of ServerResponse the hook touches
class FakeResponse {
  headers = new Map<string, string>();
  setHeader(name: string, value: string) {
    this.headers.set(name.toLowerCase(), value);
    return this;
  }
}

const hooked = () => {
  const res = new FakeResponse();
  overrideCacheControl(res as unknown as ServerResponse);
  return res;
};

describe('overrideCacheControl', () => {
  it('promotes the override header to Cache-Control', () => {
    const res = hooked();
    res.setHeader(CACHE_CONTROL_HEADER, CACHE_CONTROL_VALUE);
    expect(res.headers.get('cache-control')).toBe(CACHE_CONTROL_VALUE);
    expect(res.headers.has(CACHE_CONTROL_HEADER)).toBe(false);
  });

  it('drops the Cache-Control Next sets after the override', () => {
    const res = hooked();
    res.setHeader(CACHE_CONTROL_HEADER, CACHE_CONTROL_VALUE);
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    expect(res.headers.get('cache-control')).toBe(CACHE_CONTROL_VALUE);
  });

  it('leaves Cache-Control alone on a response without the override', () => {
    const res = hooked();
    res.setHeader('Cache-Control', 'no-store');
    expect(res.headers.get('cache-control')).toBe('no-store');
  });

  it('passes other headers through', () => {
    const res = hooked();
    res.setHeader('ETag', '"abc"');
    expect(res.headers.get('etag')).toBe('"abc"');
  });
});
