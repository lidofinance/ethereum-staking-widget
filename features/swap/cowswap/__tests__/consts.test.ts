import { describe, it, expect } from 'vitest';
import { type Address, ethAddress } from 'viem';
import { arbitrum, base, linea, mainnet, sepolia } from 'viem/chains';

import mainnetNetwork from 'networks/mainnet.json';
import arbitrumNetwork from 'networks/l2/arbitrum.json';
import baseNetwork from 'networks/l2/base.json';
import sellTokenList from '../../../../public/token-lists/swap-dex-sell-tokenlist.json';
import buyTokenList from '../../../../public/token-lists/swap-dex-buy-tokenlist.json';

import { COWSWAP_NETWORKS } from 'modules/dexes/cowswap';

import { SWAP_COWSWAP_PROFILE as profile } from '../consts';

const c = mainnetNetwork.contracts;
const lower = (address: string) => address.toLowerCase() as Address;
const mainnetConfig = () => {
  const config = profile.getNetworkTxConfig(mainnet.id);
  if (!config) throw new Error('no mainnet config');
  return config;
};

const ERC20_TOKENS = [
  c.lido,
  c.wsteth,
  c.ldo,
  c.weth,
  c.usdc,
  c.usdt,
  c.usde,
  c.dai,
  c.usds,
  c.pyusd,
  c.wbtc,
  c.cbbtc,
  c.rlusd,
  c.usdg,
  c.link,
  c.uni,
  c.aave,
  c.ausd,
  c.eurc,
  c.gho,
  c.paxg,
  c.tbtc,
  c.lbtc,
  c.cbeth,
  c.susde,
].map(lower);

describe('SWAP_COWSWAP_PROFILE', () => {
  it('uses Lido dApp Swap appCode', () => {
    expect(profile.appCode).toBe('Lido dApp Swap');
  });

  it('lists every token on both sides and sells ETH through EthFlow', () => {
    const { sellTokens, buyTokens, cowEthFlow } = mainnetConfig();
    expect(sellTokens).toEqual(new Set([ethAddress, ...ERC20_TOKENS]));
    expect(buyTokens).toEqual(new Set([ethAddress, ...ERC20_TOKENS]));
    expect(cowEthFlow).toBe(lower(c.cowEthFlow));
  });

  it('has on-chain decimals for every mainnet token', () => {
    expect(profile.tokenDecimals).toMatchObject({
      [ethAddress]: 18,
      [lower(c.lido)]: 18,
      [lower(c.wsteth)]: 18,
      [lower(c.ldo)]: 18,
      [lower(c.weth)]: 18,
      [lower(c.usdc)]: 6,
      [lower(c.usdt)]: 6,
      [lower(c.usde)]: 18,
      [lower(c.dai)]: 18,
      [lower(c.usds)]: 18,
      [lower(c.pyusd)]: 6,
      [lower(c.wbtc)]: 8,
      [lower(c.cbbtc)]: 8,
      [lower(c.rlusd)]: 18,
      [lower(c.usdg)]: 6,
      [lower(c.link)]: 18,
      [lower(c.uni)]: 18,
      [lower(c.aave)]: 18,
      [lower(c.ausd)]: 6,
      [lower(c.eurc)]: 6,
      [lower(c.gho)]: 18,
      [lower(c.paxg)]: 18,
      [lower(c.tbtc)]: 18,
      [lower(c.lbtc)]: 8,
      [lower(c.cbeth)]: 18,
      [lower(c.susde)]: 18,
    });
  });

  it('has oracle price for every token', () => {
    for (const address of [ethAddress, ...ERC20_TOKENS]) {
      expect(profile.oracleFeeds.buy[address]).toBeDefined();
    }
    for (const address of [ethAddress, ...ERC20_TOKENS]) {
      expect(profile.oracleFeeds.sell[address]).toBeDefined();
    }
  });

  it('prices LDO, WBTC, LBTC and cbETH through composite feeds', () => {
    expect(profile.oracleFeeds.sell[lower(c.ldo)]).toBe('LDO_USD');
    expect(profile.oracleFeeds.sell[lower(c.wbtc)]).toBe('WBTC_USD');
    expect(profile.oracleFeeds.sell[lower(c.lbtc)]).toBe('LBTC_USD');
    expect(profile.oracleFeeds.sell[lower(c.cbeth)]).toBe('CBETH_USD');
  });

  it.each([
    ['sell', sellTokenList, 'sell'],
    ['buy', buyTokenList, 'buy'],
  ] as const)(
    '%s token list matches the profile on every network',
    (_, list, side) => {
      const listChainIds = [mainnet.id, arbitrum.id, base.id];
      expect(new Set(list.tokens.map((token) => token.chainId))).toEqual(
        new Set(listChainIds),
      );

      for (const chainId of listChainIds) {
        const config = profile.getNetworkTxConfig(chainId);
        if (!config) throw new Error(`no config for ${chainId}`);
        const listed = list.tokens.filter((token) => token.chainId === chainId);

        expect(new Set(listed.map((token) => lower(token.address)))).toEqual(
          side === 'sell' ? config.sellTokens : config.buyTokens,
        );
        for (const token of listed) {
          expect(token.decimals).toBe(
            profile.tokenDecimals[lower(token.address)],
          );
        }
      }
    },
  );

  it('is enabled on mainnet, Arbitrum and Base', () => {
    expect([...profile.chainIds].sort()).toEqual(
      [mainnet.id, arbitrum.id, base.id].sort(),
    );
  });

  // no partner fee recipient in config, see ADR 0006
  it.each([
    ['linea', linea.id],
    ['sepolia', sepolia.id],
  ])('keeps %s disabled', (_, chainId) => {
    expect(COWSWAP_NETWORKS[chainId]).toBeDefined();
    expect(profile.getNetworkTxConfig(chainId)).toBeUndefined();
  });

  it.each([
    ['arbitrum', arbitrum.id, arbitrumNetwork.contracts],
    ['base', base.id, baseNetwork.contracts],
  ])('uses %s wstETH, WETH and CoW contracts', (_, chainId, contracts) => {
    const config = profile.getNetworkTxConfig(chainId);
    if (!config) throw new Error(`no config for ${chainId}`);

    expect(config.sellTokens.has(ethAddress)).toBe(true);
    expect(config.sellTokens.has(lower(contracts.L2wstETH))).toBe(true);
    expect(config.sellTokens.has(lower(contracts.weth))).toBe(true);
    expect(config.weth).toBe(lower(contracts.weth));
    expect(config.cowEthFlow).toBe(lower(contracts.cowEthFlow));
    expect(config.cowSettlement).toBe(lower(contracts.cowSettlement));
    // same recipient as mainnet, to be confirmed with CoW
    expect(config.feeRecipient).toBe(lower(c.daoAgent));
    expect(profile.oracleFeeds.sell[lower(contracts.L2wstETH)]).toBe(
      'WSTETH_USD',
    );
  });

  // only verified native or canonical-bridge tokens, see vault research 2026-10-19
  it.each([
    [
      'arbitrum',
      arbitrum.id,
      [
        'eth',
        'wsteth',
        'weth',
        'ldo',
        'usdc',
        'usdt',
        'usde',
        'dai',
        'usds',
        'pyusd',
        'wbtc',
        'usdg',
        'gho',
        'tbtc',
        'susde',
        'link',
        'uni',
        'aave',
      ],
    ],
    [
      'base',
      base.id,
      [
        'eth',
        'wsteth',
        'weth',
        'usdc',
        'usdt',
        'usde',
        'dai',
        'usds',
        'cbbtc',
        'eurc',
        'gho',
        'tbtc',
        'lbtc',
        'cbeth',
        'link',
        'uni',
        'aave',
      ],
    ],
  ] as const)('lists the verified %s tokens', (_, chainId, keys) => {
    const config = profile.getNetworkTxConfig(chainId);
    if (!config) throw new Error(`no config for ${chainId}`);
    const network = COWSWAP_NETWORKS[chainId];
    const expected = new Set(
      keys.map((key) =>
        key === 'eth' ? ethAddress : lower(network[key] as string),
      ),
    );

    expect(config.sellTokens).toEqual(expected);
    expect(config.buyTokens).toEqual(expected);
  });

  it.each([
    ['mainnet', mainnet.id, c.lido],
    ['arbitrum', arbitrum.id, arbitrumNetwork.contracts.L2wstETH],
    ['base', base.id, baseNetwork.contracts.L2wstETH],
  ])('starts %s from stETH or wstETH to ETH', (_, chainId, sellToken) => {
    expect(profile.getDefaultPair(chainId)).toEqual({
      sell: lower(sellToken),
      buy: 'ETH',
    });
  });
});
