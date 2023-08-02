import { encodeURLQuery } from '../encodeURLQuery';

describe('encodeURLQuery', () => {
  it('should encode query params correctly', () => {
    const params = {
      foo: 'bar',
      baz: 123,
      qux: '',
    };
    const expected = 'foo=bar&baz=123';
    const result = encodeURLQuery(params);
    expect(result).toEqual(expected);
  });

  it('should handle empty params object', () => {
    const params = {};
    const expected = '';
    const result = encodeURLQuery(params);
    expect(result).toEqual(expected);
  });
});
