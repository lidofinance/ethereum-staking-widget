import { getOwnProperty } from '../get-own-property';

describe('getOwnProperty', () => {
  const object = { known: 'value' };

  it('returns an own property', () => {
    expect(getOwnProperty(object, 'known')).toBe('value');
  });

  it.each([
    'constructor',
    'toString',
    'valueOf',
    'hasOwnProperty',
    '__proto__',
  ])('ignores inherited property %s', (key) => {
    expect(getOwnProperty(object, key)).toBeUndefined();
  });
});
