import { parseEther, parseUnits } from 'viem';

import { buildMainTokens } from '../main-tokens';
import { tokenToRow } from '../token-to-row';

const NONE = { eth: 0n, weth: 0n, usdc: 0n, usdt: 0n };

describe('buildMainTokens', () => {
  it('lists held tokens only', () => {
    expect(buildMainTokens(NONE, 2000)).toEqual([]);
    const tokens = buildMainTokens({ ...NONE, usdt: 1n }, 2000);
    expect(tokens.map((token) => token.symbol)).toEqual(['USDT']);
  });

  it('prices ETH and WETH by the ETH price, stablecoins 1:1', () => {
    const tokens = buildMainTokens(
      {
        eth: parseEther('1.5'),
        weth: parseEther('2'),
        usdc: parseUnits('10.5', 6),
        usdt: parseUnits('3', 6),
      },
      2000,
    );
    expect(
      tokens.map(({ symbol, amount, valueUsd }) => [symbol, amount, valueUsd]),
    ).toEqual([
      ['ETH', 1.5, 3000],
      ['WETH', 2, 4000],
      ['USDC', 10.5, 10.5],
      ['USDT', 3, 3],
    ]);
  });

  it('shows ETH without a value until its price is known', () => {
    const [eth, usdc] = buildMainTokens(
      { ...NONE, eth: parseEther('1'), usdc: parseUnits('5', 6) },
      undefined,
    );
    expect(eth.valueUsd).toBeNull();
    expect(usdc.valueUsd).toBe(5);
  });

  it('gives rows the app can show with its own icons', () => {
    const [eth, weth] = buildMainTokens(
      { ...NONE, eth: parseEther('1'), weth: parseEther('1') },
      2000,
    ).map(tokenToRow);
    expect(eth.iconToken).toBe('eth');
    expect(eth.amount).toBe(parseEther('1'));
    expect(eth.chains[0].address).toBeNull();
    expect(weth.iconToken).toBe('weth');
    expect(weth.chains[0].address).toBe(
      '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    );
  });
});
