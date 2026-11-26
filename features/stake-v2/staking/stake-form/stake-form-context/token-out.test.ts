import { adjustTokenOut, getTokenOutList } from './token-out';
import type { StakeTokenOutValue } from './types';

const steth = (chainId: number): StakeTokenOutValue => ({
  token: 'steth',
  chainId,
});
const wsteth = (chainId: number): StakeTokenOutValue => ({
  token: 'wsteth',
  chainId,
});

const available = [steth(1), wsteth(1), wsteth(10)];

describe('getTokenOutList', () => {
  it('keeps the tokens on the tokenIn chain, stETH first', () => {
    expect(
      getTokenOutList({ token: 'eth', chainId: 1 }, [wsteth(1), steth(1)]),
    ).toEqual([steth(1), wsteth(1)]);
  });

  it('only wstETH on a fast stake L2', () => {
    expect(getTokenOutList({ token: 'weth', chainId: 10 }, available)).toEqual([
      wsteth(10),
    ]);
  });

  it('nothing on a chain staking does not cover', () => {
    expect(getTokenOutList({ token: 'eth', chainId: 8453 }, available)).toEqual(
      [],
    );
  });
});

describe('adjustTokenOut', () => {
  it('keeps a listed tokenOut as the same object', () => {
    const tokenOut = wsteth(1);
    expect(adjustTokenOut(tokenOut, [steth(1), wsteth(1)])).toBe(tokenOut);
  });

  it('picks the first of the list otherwise', () => {
    expect(adjustTokenOut(steth(1), [wsteth(10)])).toEqual(wsteth(10));
  });

  it('keeps tokenOut when the list is empty', () => {
    const tokenOut = steth(1);
    expect(adjustTokenOut(tokenOut, [])).toBe(tokenOut);
  });
});
