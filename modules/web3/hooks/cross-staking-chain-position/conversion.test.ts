import { parseEther } from 'viem';

import { convertToEth } from './conversion';

const CHAIN_ID = 1;
const rates = { stethPerWsteth: parseEther('1.2') };

describe('convertToEth', () => {
  it('keeps ETH as is', () => {
    expect(convertToEth('eth', parseEther('2'), rates, CHAIN_ID)).toBe(
      parseEther('2'),
    );
  });

  it('treats WETH and stETH as 1:1 with ETH', () => {
    expect(convertToEth('weth', parseEther('3'), {}, CHAIN_ID)).toBe(
      parseEther('3'),
    );
    expect(convertToEth('steth', parseEther('3'), {}, CHAIN_ID)).toBe(
      parseEther('3'),
    );
  });

  it('converts wstETH through stETH with the rate', () => {
    expect(convertToEth('wsteth', parseEther('10'), rates, CHAIN_ID)).toBe(
      parseEther('12'),
    );
  });

  it('returns undefined for wstETH when the rate is missing', () => {
    expect(
      convertToEth('wsteth', parseEther('10'), {}, CHAIN_ID),
    ).toBeUndefined();
  });

  it('values a zero balance at zero, even without the rate', () => {
    expect(convertToEth('wsteth', 0n, rates, CHAIN_ID)).toBe(0n);
    expect(convertToEth('wsteth', 0n, {}, CHAIN_ID)).toBe(0n);
  });
});
