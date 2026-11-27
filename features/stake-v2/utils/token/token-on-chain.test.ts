import { isSameTokenOnChain, keepOrFirst, tokenSymbol } from './token-on-chain';

const steth = { token: 'steth', chainId: 1 };
const wsteth = { token: 'wsteth', chainId: 1 };

describe('token on chain', () => {
  it('isSameTokenOnChain compares token and chain', () => {
    expect(isSameTokenOnChain(steth, { token: 'steth', chainId: 1 })).toBe(
      true,
    );
    expect(isSameTokenOnChain(steth, { token: 'steth', chainId: 10 })).toBe(
      false,
    );
  });

  it('keepOrFirst keeps a listed value as the same object', () => {
    const value = { ...wsteth };
    expect(keepOrFirst(value, [steth, wsteth])).toBe(value);
  });

  it('keepOrFirst falls back to the first, or the value for an empty list', () => {
    expect(keepOrFirst({ token: 'eth', chainId: 1 }, [steth])).toBe(steth);
    const value = { ...steth };
    expect(keepOrFirst(value, [])).toBe(value);
  });

  it('tokenSymbol maps ids to symbols', () => {
    expect(tokenSymbol('steth')).toBe('stETH');
    expect(tokenSymbol('unknown')).toBe('unknown');
  });
});
