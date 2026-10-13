import { describe, it, expect } from 'vitest';
import { type Address, ethAddress } from 'viem';
import { mainnet, sepolia } from 'viem/chains';

import { MATOMO_TX_EVENTS_TYPES } from 'consts/matomo';
import mainnetNetwork from 'networks/mainnet.json';
import sepoliaNetwork from 'networks/sepolia.json';

import { TEST_PROFILE } from 'shared/dexes/cowswap/guards/tx/__tests__/fixtures';

import { WITHDRAWALS_COWSWAP_PROFILE as profile } from '../consts';

const c = mainnetNetwork.contracts;
const lower = (address: string) => address.toLowerCase() as Address;

describe('WITHDRAWALS_COWSWAP_PROFILE', () => {
  it('uses Lido Staking Widget appCode', () => {
    expect(profile.appCode).toBe('Lido Staking Widget');
  });

  it('sells stETH/wstETH and buys ETH, WETH and stables/BTC on mainnet', () => {
    const config = profile.getNetworkTxConfig(mainnet.id);
    expect(config.cowSettlement).toBe(lower(c.cowSettlement));
    expect(config.cowVaultRelayer).toBe(lower(c.cowVaultRelayer));
    expect(config.feeRecipient).toBe(lower(c.daoAgent));
    expect(config.sellTokens).toEqual(
      new Set([lower(c.lido), lower(c.wsteth)]),
    );
    expect(config.buyTokens).toEqual(
      new Set([
        ethAddress,
        lower(c.weth),
        lower(c.usdc),
        lower(c.usdt),
        lower(c.usds),
        lower(c.wbtc),
      ]),
    );
  });

  it('resolves sepolia config', () => {
    const config = profile.getNetworkTxConfig(sepolia.id);
    const s = sepoliaNetwork.contracts;
    expect(config.cowSettlement).toBe(lower(s.cowSettlement));
    expect(config.feeRecipient).toBe(lower(s.daoAgent));
    expect(config.sellTokens.has(lower(s.lido))).toBe(true);
  });

  it('falls back to mainnet config for other chains', () => {
    expect(profile.getNetworkTxConfig(137)).toBe(
      profile.getNetworkTxConfig(mainnet.id),
    );
  });

  it('has decimals for every token by mainnet address', () => {
    expect(profile.tokenDecimals).toEqual({
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

  it('has oracle feed for every token by mainnet address', () => {
    expect(profile.oracleFeeds).toEqual({
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

  it('matches shared test fixture profile', () => {
    expect(profile.tokenDecimals).toEqual(TEST_PROFILE.tokenDecimals);
    expect(profile.oracleFeeds).toEqual(TEST_PROFILE.oracleFeeds);
    expect(profile.appCode).toBe(TEST_PROFILE.appCode);
  });

  it('defaults to stETH → ETH', () => {
    expect(profile.defaultPair).toEqual({ sell: 'STETH', buy: 'ETH' });
  });

  it('points to withdrawals DEX token lists', () => {
    expect(profile.tokenLists.sell.url).toMatch(
      /\/public\/token-lists\/withdrawals-dex-sell-tokenlist\.json$/,
    );
    expect(profile.tokenLists.buy.url).toMatch(
      /\/public\/token-lists\/withdrawals-dex-buy-tokenlist\.json$/,
    );
    expect(profile.tokenLists.sell.fallback).toBe(
      'token-lists/withdrawals-dex-sell-tokenlist.json',
    );
    expect(profile.tokenLists.buy.fallback).toBe(
      'token-lists/withdrawals-dex-buy-tokenlist.json',
    );
  });

  it('tracks withdrawals DEX analytics events', () => {
    expect(profile.analytics).toEqual({
      quoteViewed: MATOMO_TX_EVENTS_TYPES.withdrawalDexQuoteViewed,
      quoteError: MATOMO_TX_EVENTS_TYPES.withdrawalDexQuoteError,
      swapStart: MATOMO_TX_EVENTS_TYPES.withdrawalDexSwapStart,
      swapPosted: MATOMO_TX_EVENTS_TYPES.withdrawalDexSwapPosted,
      swapFinish: MATOMO_TX_EVENTS_TYPES.withdrawalDexSwapFinish,
      swapCancel: MATOMO_TX_EVENTS_TYPES.withdrawalDexSwapCancel,
    });
  });
});
