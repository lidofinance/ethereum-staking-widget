import { describe, it, expect } from 'vitest';
import { type Address, ethAddress } from 'viem';
import { mainnet } from 'viem/chains';

import mainnetNetwork from 'networks/mainnet.json';
import sellTokenList from '../../../../public/token-lists/swap-dex-sell-tokenlist.json';
import buyTokenList from '../../../../public/token-lists/swap-dex-buy-tokenlist.json';

import { SWAP_COWSWAP_PROFILE as profile } from '../consts';

const c = mainnetNetwork.contracts;
const lower = (address: string) => address.toLowerCase() as Address;

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
    const { sellTokens, buyTokens, cowEthFlow } = profile.getNetworkTxConfig(
      mainnet.id,
    );
    expect(sellTokens).toEqual(new Set([ethAddress, ...ERC20_TOKENS]));
    expect(buyTokens).toEqual(new Set([ethAddress, ...ERC20_TOKENS]));
    expect(cowEthFlow).toBe(lower(c.cowEthFlow));
  });

  it('has on-chain decimals for every token', () => {
    expect(profile.tokenDecimals).toEqual({
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
  ] as const)('%s token list matches the profile', (_, list, side) => {
    const { sellTokens, buyTokens } = profile.getNetworkTxConfig(mainnet.id);
    const allowed = side === 'sell' ? sellTokens : buyTokens;

    expect(new Set(list.tokens.map((token) => lower(token.address)))).toEqual(
      allowed,
    );
    for (const token of list.tokens) {
      expect(token.chainId).toBe(mainnet.id);
      expect(token.decimals).toBe(profile.tokenDecimals[lower(token.address)]);
    }
  });
});
