import { toAprRange } from '../apr-range';

describe('toAprRange', () => {
  it('is null when no rate is known', () => {
    expect(toAprRange([])).toBeNull();
    expect(toAprRange([undefined, undefined])).toBeNull();
  });

  it('spans the known rates, skipping unknown ones', () => {
    expect(toAprRange([2.7, undefined, 2.3, 2.5])).toEqual({
      min: 2.3,
      max: 2.7,
    });
  });

  it('is a point for one known rate, zero included', () => {
    expect(toAprRange([undefined, 3.1])).toEqual({ min: 3.1, max: 3.1 });
    expect(toAprRange([0])).toEqual({ min: 0, max: 0 });
  });
});
