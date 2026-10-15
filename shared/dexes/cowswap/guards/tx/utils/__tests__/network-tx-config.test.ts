import { describe, it, expect } from 'vitest';
import { type Address, ethAddress } from 'viem';

import mainnetNetwork from 'networks/mainnet.json';
import sepoliaNetwork from 'networks/sepolia.json';

import { buildNetworkTxConfig } from '../network-tx-config';
import { collectTokenAddresses, resolveTokenAddress } from '../token-addresses';
import type { ContactsMap } from '../types';
import { MAINNET_TX_CONFIG, SEPOLIA_TX_CONFIG } from '../../__tests__/fixtures';

const c = mainnetNetwork.contracts;
const lower = (address: string) => address.toLowerCase() as Address;

// ---------------------------------------------------------------------------
// token-addresses
// ---------------------------------------------------------------------------
describe('resolveTokenAddress', () => {
  it('resolves contract key to lowercased address', () => {
    expect(resolveTokenAddress(c, 'lido')).toBe(lower(c.lido));
  });

  it('resolves eth to native placeholder', () => {
    expect(resolveTokenAddress(c, 'eth')).toBe(ethAddress);
  });

  it('returns undefined for empty address', () => {
    expect(resolveTokenAddress({ ...c, usds: '' }, 'usds')).toBeUndefined();
  });
});

describe('collectTokenAddresses', () => {
  it('collects lowercased addresses for given keys', () => {
    expect(collectTokenAddresses(c, ['lido', 'weth', 'eth'])).toEqual(
      new Set([lower(c.lido), lower(c.weth), ethAddress]),
    );
  });

  it('skips keys with empty address', () => {
    const contracts = { ...c, usds: '' };
    expect(collectTokenAddresses(contracts, ['lido', 'usds'])).toEqual(
      new Set([lower(c.lido)]),
    );
  });

  it('skips keys missing on network', () => {
    const contracts = sepoliaNetwork.contracts as ContactsMap;
    expect(collectTokenAddresses(contracts, ['lido', 'usdc'])).toEqual(
      new Set([lower(contracts.lido)]),
    );
  });

  it('returns empty set for empty key list', () => {
    expect(collectTokenAddresses(c, []).size).toBe(0);
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
    expect(MAINNET_TX_CONFIG.buyTokens).toEqual(
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

  it('keeps sell and buy token sets disjoint', () => {
    for (const token of MAINNET_TX_CONFIG.sellTokens) {
      expect(MAINNET_TX_CONFIG.buyTokens.has(token)).toBe(false);
    }
  });

  it('includes contract tokens but not ETH placeholder in tokens', () => {
    expect(MAINNET_TX_CONFIG.tokens.has(ethAddress)).toBe(false);
    expect(MAINNET_TX_CONFIG.tokens.size).toBe(7);
  });

  it('builds sepolia config from sepolia contracts', () => {
    const s = sepoliaNetwork.contracts;
    expect(SEPOLIA_TX_CONFIG.cowVaultRelayer).toBe(lower(s.cowVaultRelayer));
    expect(SEPOLIA_TX_CONFIG.cowSettlement).toBe(lower(s.cowSettlement));
    expect(SEPOLIA_TX_CONFIG.feeRecipient).toBe(lower(s.daoAgent));
    expect(SEPOLIA_TX_CONFIG.sellTokens.has(lower(s.lido))).toBe(true);
    expect(SEPOLIA_TX_CONFIG.sellTokens.has(lower(c.lido))).toBe(false);
  });

  it('allows ETH only when listed', () => {
    const config = buildNetworkTxConfig(c, ['lido'], ['usdc']);
    expect(config.tokens).toEqual(new Set([lower(c.lido), lower(c.usdc)]));
    expect(config.sellTokens).toEqual(new Set([lower(c.lido)]));
    expect(config.buyTokens).toEqual(new Set([lower(c.usdc)]));
  });
});
