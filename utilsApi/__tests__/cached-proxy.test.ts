import { buildParams } from '../cached-proxy-build-params';

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
    const out = buildParams(
      { a: '1', b: ['x', 'y'] as unknown as string },
      false,
      undefined,
    );
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
