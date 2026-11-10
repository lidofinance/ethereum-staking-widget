import { describe, it, expect } from 'vitest';
import { type Address, ethAddress } from 'viem';
import { mainnet, sepolia } from 'viem/chains';

import mainnetNetwork from 'networks/mainnet.json';
import sepoliaNetwork from 'networks/sepolia.json';

import { buildNetworkTxConfig } from '../network-tx-config';
import { collectTokenAddresses, resolveTokenAddress } from '../token-addresses';
import { COWSWAP_NETWORKS } from '../../../../networks';
import { MAINNET_TX_CONFIG, SEPOLIA_TX_CONFIG } from '../../__tests__/fixtures';

const c = mainnetNetwork.contracts;
const n = {
  ...COWSWAP_NETWORKS[mainnet.id],
  partnerFeeRecipient: c.daoAgent,
};
const lower = (address: string) => address.toLowerCase() as Address;

// ---------------------------------------------------------------------------
// token-addresses
// ---------------------------------------------------------------------------
describe('resolveTokenAddress', () => {
  it('resolves contract key to lowercased address', () => {
    expect(resolveTokenAddress(n, 'lido')).toBe(lower(c.lido));
  });

  it('resolves eth to native placeholder', () => {
    expect(resolveTokenAddress(n, 'eth')).toBe(ethAddress);
  });

  it('returns undefined for empty address', () => {
    expect(resolveTokenAddress({ ...n, usds: '' }, 'usds')).toBeUndefined();
  });
});

describe('collectTokenAddresses', () => {
  it('collects lowercased addresses for given keys', () => {
    expect(collectTokenAddresses(n, ['lido', 'weth', 'eth'])).toEqual(
      new Set([lower(c.lido), lower(c.weth), ethAddress]),
    );
  });

  it('skips keys with empty address', () => {
    const contracts = { ...n, usds: '' };
    expect(collectTokenAddresses(contracts, ['lido', 'usds'])).toEqual(
      new Set([lower(c.lido)]),
    );
  });

  it('skips keys missing on network', () => {
    const contracts = COWSWAP_NETWORKS[sepolia.id];
    expect(collectTokenAddresses(contracts, ['lido', 'usdc'])).toEqual(
      new Set([lower(sepoliaNetwork.contracts.lido)]),
    );
  });

  it('returns empty set for empty key list', () => {
    expect(collectTokenAddresses(n, []).size).toBe(0);
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
    const config = buildNetworkTxConfig(n, ['lido'], ['usdc']);
    expect(config.tokens).toEqual(new Set([lower(c.lido), lower(c.usdc)]));
    expect(config.sellTokens).toEqual(new Set([lower(c.lido)]));
    expect(config.buyTokens).toEqual(new Set([lower(c.usdc)]));
  });

  it('drops ETH from sell tokens without EthFlow', () => {
    const config = buildNetworkTxConfig(
      { ...n, cowEthFlow: undefined },
      ['eth', 'lido'],
      ['usdc'],
    );
    expect(config.sellTokens).toEqual(new Set([lower(c.lido)]));
    expect(config.cowEthFlow).toBeUndefined();
  });

  it('takes the fee recipient from the network partnerFeeRecipient', () => {
    const recipient = '0x00000000000000000000000000000000000000Fe';
    expect(
      buildNetworkTxConfig(
        { ...n, partnerFeeRecipient: recipient },
        ['lido'],
        ['usdc'],
      ).feeRecipient,
    ).toBe(lower(recipient));
  });
});
