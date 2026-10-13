import { describe, it, expect } from 'vitest';
import { type Address, ethAddress } from 'viem';

import mainnetNetwork from 'networks/mainnet.json';
import sepoliaNetwork from 'networks/sepolia.json';

import { buildNetworkTxConfig } from '../network-tx-config';
import {
  collectTokenAddresses,
  collectSellTokenAddresses,
  collectBuyTokenAddresses,
} from '../token-addresses';
import {
  SELL_TOKEN_KEYS,
  BUY_TOKEN_KEYS,
  DEX_TOKEN_KEYS,
  MAINNET_TX_CONFIG,
  SEPOLIA_TX_CONFIG,
} from '../../__tests__/fixtures';

const c = mainnetNetwork.contracts;
const lower = (address: string) => address.toLowerCase() as Address;

// ---------------------------------------------------------------------------
// token-addresses
// ---------------------------------------------------------------------------
describe('collectTokenAddresses', () => {
  it('collects lowercased addresses for given keys', () => {
    const result = collectTokenAddresses(c, ['lido', 'weth']);
    expect(result).toEqual(new Set([lower(c.lido), lower(c.weth)]));
  });

  it('skips keys with empty address', () => {
    const contracts = { ...c, usds: '' };
    const result = collectTokenAddresses(contracts, ['lido', 'usds']);
    expect(result).toEqual(new Set([lower(c.lido)]));
  });

  it('returns empty set for empty key list', () => {
    expect(collectTokenAddresses(c, []).size).toBe(0);
  });
});

describe('collectSellTokenAddresses', () => {
  it('collects only given sell keys', () => {
    const result = collectSellTokenAddresses(c, SELL_TOKEN_KEYS);
    expect(result).toEqual(new Set([lower(c.lido), lower(c.wsteth)]));
  });

  it('does not add ETH placeholder', () => {
    const result = collectSellTokenAddresses(c, SELL_TOKEN_KEYS);
    expect(result.has(ethAddress)).toBe(false);
  });
});

describe('collectBuyTokenAddresses', () => {
  it('collects buy keys and adds ETH placeholder', () => {
    const result = collectBuyTokenAddresses(c, BUY_TOKEN_KEYS);
    expect(result).toEqual(
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

  it('adds ETH placeholder even for empty key list', () => {
    expect(collectBuyTokenAddresses(c, [])).toEqual(new Set([ethAddress]));
  });
});

// ---------------------------------------------------------------------------
// buildNetworkTxConfig
// ---------------------------------------------------------------------------
describe('buildNetworkTxConfig', () => {
  it('builds mainnet config from network contracts', () => {
    expect(MAINNET_TX_CONFIG.cowVaultRelayer).toBe(lower(c.cowVaultRelayer));
    expect(MAINNET_TX_CONFIG.cowSettlement).toBe(lower(c.cowSettlement));
    expect(MAINNET_TX_CONFIG.feeRecipient).toBe(lower(c.daoAgent));
    expect(MAINNET_TX_CONFIG.sellTokens).toEqual(
      new Set([lower(c.lido), lower(c.wsteth)]),
    );
  });

  it('keeps sell and buy token sets disjoint', () => {
    for (const token of MAINNET_TX_CONFIG.sellTokens) {
      expect(MAINNET_TX_CONFIG.buyTokens.has(token)).toBe(false);
    }
  });

  it('includes all sell and buy tokens (except ETH) in tokens', () => {
    for (const token of MAINNET_TX_CONFIG.sellTokens) {
      expect(MAINNET_TX_CONFIG.tokens.has(token)).toBe(true);
    }
    for (const token of MAINNET_TX_CONFIG.buyTokens) {
      if (token === ethAddress) continue;
      expect(MAINNET_TX_CONFIG.tokens.has(token)).toBe(true);
    }
    expect(MAINNET_TX_CONFIG.tokens.size).toBe(DEX_TOKEN_KEYS.length);
  });

  it('builds sepolia config from sepolia contracts', () => {
    const s = sepoliaNetwork.contracts;
    expect(SEPOLIA_TX_CONFIG.cowVaultRelayer).toBe(lower(s.cowVaultRelayer));
    expect(SEPOLIA_TX_CONFIG.cowSettlement).toBe(lower(s.cowSettlement));
    expect(SEPOLIA_TX_CONFIG.feeRecipient).toBe(lower(s.daoAgent));
    expect(SEPOLIA_TX_CONFIG.sellTokens.has(lower(s.lido))).toBe(true);
    expect(SEPOLIA_TX_CONFIG.sellTokens.has(lower(c.lido))).toBe(false);
  });

  it('uses passed key lists instead of fixed ones', () => {
    const config = buildNetworkTxConfig(c, ['lido'], ['lido'], ['usdc']);
    expect(config.tokens).toEqual(new Set([lower(c.lido)]));
    expect(config.sellTokens).toEqual(new Set([lower(c.lido)]));
    expect(config.buyTokens).toEqual(new Set([lower(c.usdc), ethAddress]));
  });
});
