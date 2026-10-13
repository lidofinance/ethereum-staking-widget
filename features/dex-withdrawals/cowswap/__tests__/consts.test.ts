import { describe, it, expect } from 'vitest';
import { type Address, ethAddress } from 'viem';
import { mainnet, sepolia } from 'viem/chains';

import mainnetNetwork from 'networks/mainnet.json';
import sepoliaNetwork from 'networks/sepolia.json';

import {
  getNetworkTxConfig,
  DEX_SELL_TOKEN_LIST_URL,
  DEX_BUY_TOKEN_LIST_URL,
  DEX_SELL_TOKEN_LIST_URL_FALLBACK,
  DEX_BUY_TOKEN_LIST_URL_FALLBACK,
} from '../consts';

const lower = (address: string) => address.toLowerCase() as Address;

describe('getNetworkTxConfig', () => {
  it('returns mainnet config for mainnet', () => {
    const config = getNetworkTxConfig(mainnet.id);
    const c = mainnetNetwork.contracts;
    expect(config.cowSettlement).toBe(lower(c.cowSettlement));
    expect(config.cowVaultRelayer).toBe(lower(c.cowVaultRelayer));
    expect(config.feeRecipient).toBe(lower(c.daoAgent));
    expect(config.sellTokens).toEqual(
      new Set([lower(c.lido), lower(c.wsteth)]),
    );
    expect(config.buyTokens).toEqual(
      new Set([
        lower(c.weth),
        lower(c.usdc),
        lower(c.usdt),
        lower(c.usds),
        lower(c.wbtc),
        ethAddress,
      ]),
    );
  });

  it('returns sepolia config for sepolia', () => {
    const config = getNetworkTxConfig(sepolia.id);
    const s = sepoliaNetwork.contracts;
    expect(config.cowSettlement).toBe(lower(s.cowSettlement));
    expect(config.feeRecipient).toBe(lower(s.daoAgent));
    expect(config.sellTokens.has(lower(s.lido))).toBe(true);
  });

  it('falls back to mainnet config for other chains', () => {
    expect(getNetworkTxConfig(137)).toBe(getNetworkTxConfig(mainnet.id));
  });

  it('returns stable references', () => {
    expect(getNetworkTxConfig(mainnet.id)).toBe(getNetworkTxConfig(mainnet.id));
    expect(getNetworkTxConfig(sepolia.id)).toBe(getNetworkTxConfig(sepolia.id));
  });
});

describe('token list urls', () => {
  it('points to withdrawals DEX token lists', () => {
    expect(DEX_SELL_TOKEN_LIST_URL).toMatch(
      /\/public\/token-lists\/withdrawals-dex-sell-tokenlist\.json$/,
    );
    expect(DEX_BUY_TOKEN_LIST_URL).toMatch(
      /\/public\/token-lists\/withdrawals-dex-buy-tokenlist\.json$/,
    );
  });

  it('uses relative self-hosted fallbacks', () => {
    expect(DEX_SELL_TOKEN_LIST_URL_FALLBACK).toBe(
      'token-lists/withdrawals-dex-sell-tokenlist.json',
    );
    expect(DEX_BUY_TOKEN_LIST_URL_FALLBACK).toBe(
      'token-lists/withdrawals-dex-buy-tokenlist.json',
    );
  });
});
