import { describe, it, expect } from 'vitest';
import { type Address, ethAddress } from 'viem';
import { arbitrum, base, linea, mainnet, sepolia } from 'viem/chains';

import mainnetNetwork from 'networks/mainnet.json';
import arbitrumNetwork from 'networks/l2/arbitrum.json';
import baseNetwork from 'networks/l2/base.json';
import lineaNetwork from 'networks/l2/linea.json';
import sellTokenList from '../../../../public/token-lists/swap-dex-sell-tokenlist.json';
import buyTokenList from '../../../../public/token-lists/swap-dex-buy-tokenlist.json';

import { COWSWAP_NETWORKS } from 'shared/dexes/cowswap';

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

  it('prices LDO and WBTC through composite feeds', () => {
    expect(profile.oracleFeeds.sell[lower(c.ldo)]).toBe('LDO_USD');
    expect(profile.oracleFeeds.sell[lower(c.wbtc)]).toBe('WBTC_USD');
  });

  it.each([
    ['sell', sellTokenList, 'sell'],
    ['buy', buyTokenList, 'buy'],
  ] as const)(
    '%s token list matches the profile on every network',
    (_, list, side) => {
      const listChainIds = [mainnet.id, arbitrum.id, base.id, linea.id];
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

  it('is enabled on mainnet, sepolia and the CoW L2s', () => {
    expect([...profile.chainIds].sort()).toEqual(
      [mainnet.id, sepolia.id, arbitrum.id, base.id, linea.id].sort(),
    );
  });

  it.each([
    ['arbitrum', arbitrum.id, arbitrumNetwork.contracts],
    ['base', base.id, baseNetwork.contracts],
    ['linea', linea.id, lineaNetwork.contracts],
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
      ],
    ],
    [
      'base',
      base.id,
      ['eth', 'wsteth', 'weth', 'usdc', 'usdt', 'usde', 'dai', 'usds', 'cbbtc'],
    ],
    [
      'linea',
      linea.id,
      ['eth', 'wsteth', 'weth', 'ldo', 'usdc', 'usdt', 'usde', 'dai', 'wbtc'],
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
});
