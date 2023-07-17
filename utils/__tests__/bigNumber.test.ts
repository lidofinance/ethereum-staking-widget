import { BigNumber } from 'ethers';
import { bnMin } from '../bigNumber';

describe('bnMin', () => {
  it('returns the smaller BigNumber', () => {
    const a = BigNumber.from(100);
    const b = BigNumber.from(200);
    expect(bnMin(a, b)).toEqual(a);
  });

  it('returns the first BigNumber if both are equal', () => {
    const a = BigNumber.from(100);
    const b = BigNumber.from(100);
    expect(bnMin(a, b)).toEqual(a);
  });

  it('returns the second BigNumber if it is smaller', () => {
    const a = BigNumber.from(200);
    const b = BigNumber.from(100);
    expect(bnMin(a, b)).toEqual(b);
  });
});
