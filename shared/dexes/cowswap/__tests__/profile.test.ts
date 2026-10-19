import { describe, it, expect } from 'vitest';
import { type Address, ethAddress } from 'viem';
import { arbitrum, mainnet, sepolia } from 'viem/chains';

import mainnetNetwork from 'networks/mainnet.json';
import sepoliaNetwork from 'networks/sepolia.json';

import { COWSWAP_NETWORKS } from '../networks';
import { createCowswapProfile, type CowswapProfileConfig } from '../profile';
import {
  TEST_PROFILE,
  TEST_PROFILE_CONFIG,
} from '../guards/tx/__tests__/fixtures';

const c = mainnetNetwork.contracts;
const s = sepoliaNetwork.contracts;
const lower = (address: string) => address.toLowerCase() as Address;

const MAINNET = COWSWAP_NETWORKS[mainnet.id];
const SEPOLIA = COWSWAP_NETWORKS[sepolia.id];
// L2-shaped network with its own addresses
const L2_WSTETH = '0x00000000000000000000000000000000000000a1';
const L2_USDC = '0x00000000000000000000000000000000000000a2';
const L2_NETWORK = {
  ...MAINNET,
  lido: undefined,
  wsteth: L2_WSTETH,
  usdc: L2_USDC,
  usdt: undefined,
  usds: undefined,
  wbtc: undefined,
  weth: '0x00000000000000000000000000000000000000a3',
  partnerFeeRecipient: '0x00000000000000000000000000000000000000a4',
};

const configTx = (profile = TEST_PROFILE, chainId: number = mainnet.id) => {
  const config = profile.getNetworkTxConfig(chainId);
  if (!config) throw new Error(`no config for ${chainId}`);
  return config;
};

describe('createCowswapProfile', () => {
  it('keeps plain config fields', () => {
    expect(TEST_PROFILE.appCode).toBe(TEST_PROFILE_CONFIG.appCode);
    expect(TEST_PROFILE.defaultPair).toBe(TEST_PROFILE_CONFIG.defaultPair);
    expect(TEST_PROFILE.tokenLists).toBe(TEST_PROFILE_CONFIG.tokenLists);
    expect(TEST_PROFILE.analytics).toBe(TEST_PROFILE_CONFIG.analytics);
  });

  it('resolves network tx config per chain', () => {
    expect(configTx().cowSettlement).toBe(lower(c.cowSettlement));
    expect(configTx(TEST_PROFILE, sepolia.id).feeRecipient).toBe(
      lower(s.daoAgent),
    );
    expect(
      configTx(TEST_PROFILE, sepolia.id).sellTokens.has(lower(s.lido)),
    ).toBe(true);
  });

  it('has no config for chains outside the profile', () => {
    expect(TEST_PROFILE.chainIds).toEqual([mainnet.id, sepolia.id]);
    expect(TEST_PROFILE.getNetworkTxConfig(137)).toBeUndefined();
  });

  it('returns stable config references', () => {
    expect(TEST_PROFILE.getNetworkTxConfig(sepolia.id)).toBe(
      TEST_PROFILE.getNetworkTxConfig(sepolia.id),
    );
  });

  it('disables networks without a partner fee recipient', () => {
    const profile = createCowswapProfile({
      ...TEST_PROFILE_CONFIG,
      networks: {
        [mainnet.id]: MAINNET,
        [arbitrum.id]: { ...L2_NETWORK, partnerFeeRecipient: undefined },
      },
    });

    expect(profile.chainIds).toEqual([mainnet.id]);
    expect(profile.getNetworkTxConfig(arbitrum.id)).toBeUndefined();
    expect(profile.tokenDecimals[L2_USDC]).toBeUndefined();
  });

  it('builds token decimals by address on every network', () => {
    expect(TEST_PROFILE.tokenDecimals).toEqual({
      [lower(c.lido)]: 18,
      [lower(c.wsteth)]: 18,
      [ethAddress]: 18,
      [lower(c.weth)]: 18,
      [lower(c.usdc)]: 6,
      [lower(c.usdt)]: 6,
      [lower(c.usds)]: 18,
      [lower(c.wbtc)]: 8,
      [lower(s.lido)]: 18,
      [lower(s.wsteth)]: 18,
      [lower(s.weth)]: 18,
    });
  });

  it('builds oracle price maps by address on every network', () => {
    expect(TEST_PROFILE.oracleFeeds).toEqual({
      sell: {
        [lower(c.lido)]: 'STETH_USD',
        [lower(c.wsteth)]: 'WSTETH_USD',
        [lower(s.lido)]: 'STETH_USD',
        [lower(s.wsteth)]: 'WSTETH_USD',
      },
      buy: {
        [ethAddress]: 'ETH_USD',
        [lower(c.weth)]: 'ETH_USD',
        [lower(c.usdc)]: 'USDC_USD',
        [lower(c.usdt)]: 'USDT_USD',
        [lower(c.usds)]: 'DAI_USD',
        [lower(c.wbtc)]: 'BTC_USD',
        [lower(s.weth)]: 'ETH_USD',
      },
    });
  });

  it('prices L2 tokens like their mainnet counterparts', () => {
    const profile = createCowswapProfile({
      ...TEST_PROFILE_CONFIG,
      networks: { [mainnet.id]: MAINNET, [arbitrum.id]: L2_NETWORK },
    });

    expect(profile.chainIds).toEqual([mainnet.id, arbitrum.id]);
    expect(profile.oracleFeeds.sell[L2_WSTETH]).toBe('WSTETH_USD');
    expect(profile.oracleFeeds.buy[L2_USDC]).toBe('USDC_USD');
    expect(profile.tokenDecimals[L2_USDC]).toBe(6);
    expect(configTx(profile, arbitrum.id).sellTokens).toEqual(
      new Set([L2_WSTETH]),
    );
    expect(configTx(profile, arbitrum.id).feeRecipient).toBe(
      L2_NETWORK.partnerFeeRecipient,
    );
  });

  it('builds a profile with another token set', () => {
    const profile = createCowswapProfile({
      ...TEST_PROFILE_CONFIG,
      appCode: 'Lido Swap',
      sellTokens: [{ key: 'wsteth', decimals: 18, oracleFeed: 'WSTETH_USD' }],
      buyTokens: [{ key: 'usdc', decimals: 6, oracleFeed: 'USDC_USD' }],
      networks: { [mainnet.id]: MAINNET },
    });
    const config = configTx(profile);

    expect(profile.appCode).toBe('Lido Swap');
    expect(config.sellTokens).toEqual(new Set([lower(c.wsteth)]));
    expect(config.buyTokens).toEqual(new Set([lower(c.usdc)]));
    expect(config.buyTokens.has(ethAddress)).toBe(false);
    expect(Object.keys(profile.tokenDecimals)).toHaveLength(2);
    expect(profile.oracleFeeds.sell[lower(c.lido)]).toBeUndefined();
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
      'no enabled networks',
      {
        networks: {
          [mainnet.id]: { ...MAINNET, partnerFeeRecipient: undefined },
        },
      },
      'has no enabled networks',
    ],
    [
      'one address mapped to different tokens',
      {
        networks: {
          [mainnet.id]: MAINNET,
          [arbitrum.id]: { ...L2_NETWORK, wsteth: undefined, usdc: c.wsteth },
        },
      },
      `address ${lower(c.wsteth)} maps to different tokens`,
    ],
    [
      'token decimals differing between sides',
      {
        buyTokens: [
          ...TEST_PROFILE_CONFIG.buyTokens,
          { key: 'wsteth', decimals: 6, oracleFeed: 'WSTETH_USD' },
        ],
      },
      'token wsteth differs between sell and buy',
    ],
    [
      'token price differing between sides',
      {
        buyTokens: [
          ...TEST_PROFILE_CONFIG.buyTokens,
          { key: 'wsteth', decimals: 18, oracleFeed: 'ETH_USD' },
        ],
      },
      'token wsteth differs between sell and buy',
    ],
  ] as const)('throws for %s', (_, overrides, message) => {
    expect(() =>
      createCowswapProfile({
        ...TEST_PROFILE_CONFIG,
        ...(overrides as Partial<CowswapProfileConfig>),
      }),
    ).toThrow(message);
  });

  it('allows the same token on both sides', () => {
    const profile = createCowswapProfile({
      ...TEST_PROFILE_CONFIG,
      buyTokens: [
        ...TEST_PROFILE_CONFIG.buyTokens,
        { key: 'wsteth', decimals: 18, oracleFeed: 'WSTETH_USD' },
      ],
    });
    const { sellTokens, buyTokens } = configTx(profile);

    expect(sellTokens.has(lower(c.wsteth))).toBe(true);
    expect(buyTokens.has(lower(c.wsteth))).toBe(true);
    expect(profile.oracleFeeds.buy[lower(c.wsteth)]).toBe('WSTETH_USD');
  });

  it('sells ETH only on networks with EthFlow', () => {
    const profile = createCowswapProfile({
      ...TEST_PROFILE_CONFIG,
      sellTokens: [
        ...TEST_PROFILE_CONFIG.sellTokens,
        { key: 'eth', decimals: 18, oracleFeed: 'ETH_USD' },
      ],
      networks: { [mainnet.id]: MAINNET, [sepolia.id]: SEPOLIA },
    });

    expect(configTx(profile).sellTokens.has(ethAddress)).toBe(true);
    expect(configTx(profile).cowEthFlow).toBe(lower(c.cowEthFlow));
    expect(configTx(profile, sepolia.id).sellTokens.has(ethAddress)).toBe(
      false,
    );
  });
});
