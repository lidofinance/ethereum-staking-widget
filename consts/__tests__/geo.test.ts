import { resolveGeoAvailability } from '../geo';

describe('resolveGeoAvailability', () => {
  it('passes through an explicit full', () => {
    expect(resolveGeoAvailability('full')).toBe('full');
  });

  it('passes through an explicit limited', () => {
    expect(resolveGeoAvailability('limited')).toBe('limited');
  });

  // fail-closed: everything that is not a literal `full` has to land on
  // `limited` — a request in flight, a failed one, a truncated body, a value
  // from a newer API version
  it.each([
    ['undefined', undefined],
    ['null', null],
    ['an unknown value', 'unrestricted'],
    ['a differently cased value', 'FULL'],
    ['a padded value', ' full '],
    ['a truthy non-string', 1],
    ['an object', { availability: 'full' }],
  ])('resolves %s to limited', (_label, value) => {
    expect(resolveGeoAvailability(value)).toBe('limited');
  });
});
