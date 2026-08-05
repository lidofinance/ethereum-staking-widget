import { buildParams } from '../cached-proxy.js';

describe('buildParams', () => {
  it('returns null when ignoreParams is true', () => {
    expect(buildParams({ a: '1', b: '2' }, true, undefined)).toBeNull();
  });

  it('returns null for an empty query', () => {
    expect(buildParams({}, false, undefined)).toBeNull();
  });

  it('includes all string params when no allow-list is set', () => {
    const out = buildParams({ a: '1', b: '2' }, false, undefined);
    expect(out).not.toBeNull();
    expect(out?.get('a')).toBe('1');
    expect(out?.get('b')).toBe('2');
  });

  it('filters out non-string values (eg. arrays)', () => {
    const out = buildParams({ a: '1', b: ['x', 'y'] }, false, undefined);
    expect(out).not.toBeNull();
    expect(out?.get('a')).toBe('1');
    expect(out?.has('b')).toBe(false);
  });

  it('drops query keys NOT on the allow-list', () => {
    const out = buildParams(
      { address: '0xabc', limit: '10', pad: 'junk', _: 'cache-buster' },
      false,
      ['address', 'limit'],
    );
    expect(out).not.toBeNull();
    expect(out?.get('address')).toBe('0xabc');
    expect(out?.get('limit')).toBe('10');
    expect(out?.has('pad')).toBe(false);
    expect(out?.has('_')).toBe(false);
  });

  it('returns null when all params are filtered out by the allow-list', () => {
    const out = buildParams({ pad1: 'a', pad2: 'b' }, false, ['address']);
    expect(out).toBeNull();
  });

  it('treats an empty allow-list as "filter everything out"', () => {
    const out = buildParams({ address: '0xabc', limit: '10' }, false, []);
    expect(out).toBeNull();
  });
});

describe('createCachedProxy upstream failure', () => {
  it('surfaces the undici cause code in the 502 body, without the URL', async () => {
    const { createCachedProxy } = await import('../cached-proxy.js');
    const Fastify = (await import('fastify')).default;

    const fetchMock = vi.fn().mockRejectedValue(
      Object.assign(new TypeError('fetch failed'), {
        cause: { code: 'ENOTFOUND' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const app = Fastify({ logger: false });
    const proxy = createCachedProxy({
      proxyUrl: 'https://dead-upstream.test/SECRET',
      cacheTTL: 1_000,
    });
    app.get('/p', async (req, reply) => proxy(req, reply));

    const res = await app.inject({ method: 'GET', url: '/p' });

    expect(res.statusCode).toBe(502);
    expect(res.json()).toEqual({
      error: 'upstream unreachable',
      code: 'ENOTFOUND',
    });
    expect(res.body).not.toContain('SECRET');
    await app.close();
  });
});
