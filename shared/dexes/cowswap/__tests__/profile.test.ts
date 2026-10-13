import { describe, it, expect } from 'vitest';
import { type Address, ethAddress } from 'viem';
import { mainnet, sepolia } from 'viem/chains';

import mainnetNetwork from 'networks/mainnet.json';
import sepoliaNetwork from 'networks/sepolia.json';

import { createCowswapProfile, type CowswapProfileConfig } from '../profile';
import {
  TEST_PROFILE,
  TEST_PROFILE_CONFIG,
} from '../guards/tx/__tests__/fixtures';

const c = mainnetNetwork.contracts;
const s = sepoliaNetwork.contracts;
const lower = (address: string) => address.toLowerCase() as Address;

describe('createCowswapProfile', () => {
  it('keeps plain config fields', () => {
    expect(TEST_PROFILE.appCode).toBe(TEST_PROFILE_CONFIG.appCode);
    expect(TEST_PROFILE.defaultPair).toBe(TEST_PROFILE_CONFIG.defaultPair);
    expect(TEST_PROFILE.tokenLists).toBe(TEST_PROFILE_CONFIG.tokenLists);
    expect(TEST_PROFILE.analytics).toBe(TEST_PROFILE_CONFIG.analytics);
  });

  it('resolves network tx config per chain', () => {
    expect(TEST_PROFILE.getNetworkTxConfig(mainnet.id).cowSettlement).toBe(
      lower(c.cowSettlement),
    );
    expect(TEST_PROFILE.getNetworkTxConfig(sepolia.id).feeRecipient).toBe(
      lower(s.daoAgent),
    );
    expect(
      TEST_PROFILE.getNetworkTxConfig(sepolia.id).sellTokens.has(lower(s.lido)),
    ).toBe(true);
  });

  it('falls back to mainnet config for unknown chains', () => {
    expect(TEST_PROFILE.getNetworkTxConfig(137)).toBe(
      TEST_PROFILE.getNetworkTxConfig(mainnet.id),
    );
  });

  it('returns stable config references', () => {
    expect(TEST_PROFILE.getNetworkTxConfig(sepolia.id)).toBe(
      TEST_PROFILE.getNetworkTxConfig(sepolia.id),
    );
  });

  it('builds token decimals by mainnet address', () => {
    expect(TEST_PROFILE.tokenDecimals).toEqual({
      [lower(c.lido)]: 18,
      [lower(c.wsteth)]: 18,
      [ethAddress]: 18,
      [lower(c.weth)]: 18,
      [lower(c.usdc)]: 6,
      [lower(c.usdt)]: 6,
      [lower(c.usds)]: 18,
      [lower(c.wbtc)]: 8,
    });
  });

  it('builds oracle feed maps by mainnet address', () => {
    expect(TEST_PROFILE.oracleFeeds).toEqual({
      sell: {
        [lower(c.lido)]: 'STETH_USD',
        [lower(c.wsteth)]: 'STETH_USD',
      },
      buy: {
        [ethAddress]: 'ETH_USD',
        [lower(c.weth)]: 'ETH_USD',
        [lower(c.usdc)]: 'USDC_USD',
        [lower(c.usdt)]: 'USDT_USD',
        [lower(c.usds)]: 'DAI_USD',
        [lower(c.wbtc)]: 'BTC_USD',
      },
    });
  });

  it('builds a profile with another token set', () => {
    const profile = createCowswapProfile({
      ...TEST_PROFILE_CONFIG,
      appCode: 'Lido Swap',
      sellTokens: [{ key: 'wsteth', decimals: 18, oracleFeed: 'STETH_USD' }],
      buyTokens: [{ key: 'usdc', decimals: 6, oracleFeed: 'USDC_USD' }],
    });
    const config = profile.getNetworkTxConfig(mainnet.id);

    expect(profile.appCode).toBe('Lido Swap');
    expect(config.sellTokens).toEqual(new Set([lower(c.wsteth)]));
    expect(config.buyTokens).toEqual(new Set([lower(c.usdc)]));
    expect(config.buyTokens.has(ethAddress)).toBe(false);
    expect(Object.keys(profile.tokenDecimals)).toHaveLength(2);
    expect(profile.oracleFeeds.sell[lower(c.lido)]).toBeUndefined();
  });

  it('throws without mainnet contracts', () => {
    expect(() =>
      createCowswapProfile({
        ...TEST_PROFILE_CONFIG,
        networks: { [sepolia.id]: TEST_PROFILE_CONFIG.networks[sepolia.id] },
      }),
    ).toThrow('CoW Swap profile requires mainnet contracts');
  });

  it.each([
    ['empty appCode', { appCode: '  ' }, 'requires appCode'],
    ['no sell tokens', { sellTokens: [] }, 'has no tokens'],
    ['no buy tokens', { buyTokens: [] }, 'has no tokens'],
    [
      'duplicate tokens',
      {
        sellTokens: [
          { key: 'lido', decimals: 18, oracleFeed: 'STETH_USD' },
          { key: 'lido', decimals: 18, oracleFeed: 'STETH_USD' },
        ],
      },
      'has duplicate tokens',
    ],
    [
      'ETH as sell token',
      {
        sellTokens: [
          ...TEST_PROFILE_CONFIG.sellTokens,
          { key: 'eth', decimals: 18, oracleFeed: 'ETH_USD' },
        ],
      },
      'cannot sell ETH',
    ],
    [
      'overlapping sell and buy tokens',
      {
        buyTokens: [
          ...TEST_PROFILE_CONFIG.buyTokens,
          { key: 'wsteth', decimals: 18, oracleFeed: 'STETH_USD' },
        ],
      },
      'sell and buy tokens overlap',
    ],
  ] as const)('throws for %s', (_, overrides, message) => {
    expect(() =>
      createCowswapProfile({
        ...TEST_PROFILE_CONFIG,
        ...(overrides as Partial<CowswapProfileConfig>),
      }),
    ).toThrow(message);
  });
});
