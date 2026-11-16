// GGV consts import SVG icons, which do not load in the test environment
vi.mock('assets/earn', () => ({ PartnerVedaIcon: () => null }));

import { getGGVAssetsOut, getGGVMinimumAssetsOut } from '../utils';

// Values from a mainnet fork run: the Teller paid exactly RATE wei of WETH
// for 1 GG and accepted MIN as minimumAssets
const RATE = 1012681482084742508n;
const MIN = 1011668800602657765n;
const ONE_GG = 10n ** 18n;

describe('getGGVAssetsOut', () => {
  it('pays the rate for one share', () => {
    expect(getGGVAssetsOut(ONE_GG, RATE, 18)).toBe(RATE);
  });

  it('scales linearly with the shares', () => {
    expect(getGGVAssetsOut(3n * ONE_GG, RATE, 18)).toBe(3n * RATE);
  });

  it('rounds down like the Teller mulDivDown', () => {
    // 1 wei of shares at a rate below 1:1 is worth less than 1 wei
    expect(getGGVAssetsOut(1n, 999_999_999_999_999_999n, 18)).toBe(0n);
    // 3 * 1.5e18 / 1e18 = 4.5 -> 4
    expect(getGGVAssetsOut(3n, 1_500_000_000_000_000_000n, 18)).toBe(4n);
  });

  it('uses the share decimals, not a fixed 18', () => {
    expect(getGGVAssetsOut(1_000_000n, RATE, 6)).toBe(RATE);
  });

  it('returns zero for zero shares', () => {
    expect(getGGVAssetsOut(0n, RATE, 18)).toBe(0n);
  });
});

describe('getGGVMinimumAssetsOut', () => {
  it('takes 10 bps off the preview', () => {
    expect(getGGVMinimumAssetsOut(RATE)).toBe(MIN);
    expect(getGGVMinimumAssetsOut(10_000n)).toBe(9_990n);
  });

  it('rounds down', () => {
    // 9999 * 9990 / 10000 = 9989.001 -> 9989
    expect(getGGVMinimumAssetsOut(9_999n)).toBe(9_989n);
  });

  it('stays below the preview, so a 1 wei rate drop does not revert', () => {
    expect(getGGVMinimumAssetsOut(RATE)).toBeLessThan(RATE - 1n);
  });

  it('returns zero for zero', () => {
    expect(getGGVMinimumAssetsOut(0n)).toBe(0n);
  });
});
