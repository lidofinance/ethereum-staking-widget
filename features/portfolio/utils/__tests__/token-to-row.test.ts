import type { PortfolioToken } from 'utilsApi/portfolio/types';

import {
  getVerifiedIconToken,
  isLidoApiToken,
  toIconToken,
  tokenToRow,
} from '../token-to-row';

const USDC = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';

const token = (overrides: Partial<PortfolioToken> = {}): PortfolioToken => ({
  id: 'id-1',
  chainId: 1,
  chainSlug: 'ethereum',
  chainName: 'Ethereum',
  address: USDC,
  isNative: false,
  symbol: 'USDC',
  name: 'USD Coin',
  decimals: 6,
  amountRaw: '2500000',
  amount: 2.5,
  priceUsd: 1,
  valueUsd: 2.5,
  isLido: false,
  ...overrides,
});

describe('toIconToken', () => {
  it('matches known tokens case-insensitively', () => {
    expect(toIconToken('stETH')).toBe('steth');
    expect(toIconToken('USDe')).toBe('usde');
  });

  it('has no icon for unknown tokens and unstETH', () => {
    expect(toIconToken('UNI')).toBeUndefined();
    expect(toIconToken('unstETH')).toBeUndefined();
  });
});

describe('tokenToRow', () => {
  it('carries the operation types of a tokenless row', () => {
    const activityTypes: ('withdrawalRequest' | 'withdrawalClaim')[] = [
      'withdrawalRequest',
      'withdrawalClaim',
    ];
    expect(
      tokenToRow({ ...token(), address: null, activityTypes }).activityTypes,
    ).toEqual(activityTypes);
    expect(tokenToRow(token())).not.toHaveProperty('activityTypes');
  });

  it('maps an API token to a table row', () => {
    expect(tokenToRow(token())).toEqual({
      key: 'id-1',
      symbol: 'USDC',
      name: 'USD Coin',
      iconToken: 'usdc',
      amount: 2_500_000n,
      decimals: 6,
      valueUsd: 2.5,
      apr: null,
      rewardsUsd: null,
      rewardsAmount: null,
      rewardsSymbol: null,
      chains: [
        {
          slug: 'ethereum',
          name: 'Ethereum',
          address: USDC,
          isNative: false,
          amount: 2_500_000n,
          decimals: 6,
          amountFloat: 2.5,
          valueUsd: 2.5,
        },
      ],
    });
  });

  it('has no amount without decimals or with a bad raw amount', () => {
    expect(tokenToRow(token({ decimals: null })).amount).toBeNull();
    expect(tokenToRow(token({ amountRaw: '' })).amount).toBeNull();
    expect(tokenToRow(token({ amountRaw: '1.5' })).amount).toBeNull();
  });
});

describe('getVerifiedIconToken', () => {
  it('gives the icon to the known contract', () => {
    expect(
      getVerifiedIconToken({
        symbol: 'USDC',
        chainId: 1,
        address: USDC,
        isNative: false,
      }),
    ).toBe('usdc');
  });

  it('gives no icon to a token that only copies the symbol', () => {
    expect(
      getVerifiedIconToken({
        symbol: 'stETH',
        chainId: 1,
        address: '0x1111111111111111111111111111111111111111',
        isNative: false,
      }),
    ).toBeUndefined();
  });

  it('gives the ETH icon to native ETH only', () => {
    expect(
      getVerifiedIconToken({
        symbol: 'ETH',
        chainId: 59144,
        address: null,
        isNative: true,
      }),
    ).toBe('eth');
    expect(
      getVerifiedIconToken({
        symbol: 'ETH',
        chainId: 56,
        address: '0x2170ed0880ac9a755fd29b2688956bd959f933f8',
        isNative: false,
      }),
    ).toBeUndefined();
  });

  it('gives no icon to a DeFi leg named ETH without an address', () => {
    expect(
      getVerifiedIconToken({
        symbol: 'ETH',
        chainId: 1,
        address: null,
        isNative: false,
      }),
    ).toBeUndefined();
  });

  it('gives no icon without a chain', () => {
    expect(
      getVerifiedIconToken({
        symbol: 'ETH',
        chainId: null,
        address: null,
        isNative: true,
      }),
    ).toBeUndefined();
  });
});

describe('isLidoApiToken', () => {
  it('counts tokens the server marked as Lido', () => {
    expect(isLidoApiToken(token({ isLido: true }))).toBe(true);
  });

  it('counts the known wstETH contract on an L2', () => {
    expect(
      isLidoApiToken(
        token({
          chainId: 8453,
          chainSlug: 'base',
          chainName: 'Base',
          symbol: 'wstETH',
          address: '0xc1cba3fcea344f92d9239c08c0568f6f2f0ee452',
        }),
      ),
    ).toBe(true);
  });

  it('does not count a token that only copies the wstETH symbol', () => {
    expect(
      isLidoApiToken(
        token({
          chainId: 8453,
          symbol: 'wstETH',
          address: '0x1111111111111111111111111111111111111111',
        }),
      ),
    ).toBe(false);
  });
});
