/* eslint-disable import/no-extraneous-dependencies */
import { keccak256, toHex, type Address, type Hex } from 'viem';
import { mainnet, sepolia } from 'viem/chains';
// json-stringify-deterministic is a transitive dependency (see app-data.ts)
import stringify from 'json-stringify-deterministic';

import invariant from 'tiny-invariant';

import { MATOMO_TX_EVENTS_TYPES } from 'consts/matomo';
import sepoliaNetwork from 'networks/sepolia.json';

import { COWSWAP_NETWORKS } from '../../../networks';
import {
  createCowswapProfile,
  type CowswapProfileConfig,
} from '../../../profile';
import type { ValidationContext } from '../utils';

export const TEST_APP_CODE = 'Lido dApp Staking';

export const TEST_SEPOLIA_NETWORK = {
  ...COWSWAP_NETWORKS[sepolia.id],
  partnerFeeRecipient: sepoliaNetwork.contracts.daoAgent,
};

// Mirrors the withdrawals DEX profile
export const TEST_PROFILE_CONFIG: CowswapProfileConfig = {
  appCode: TEST_APP_CODE,
  sellTokens: [
    { key: 'lido', decimals: 18, oracleFeed: 'STETH_USD' },
    { key: 'wsteth', decimals: 18, oracleFeed: 'WSTETH_USD' },
  ],
  buyTokens: [
    { key: 'eth', decimals: 18, oracleFeed: 'ETH_USD' },
    { key: 'weth', decimals: 18, oracleFeed: 'ETH_USD' },
    { key: 'usdc', decimals: 6, oracleFeed: 'USDC_USD' },
    { key: 'usdt', decimals: 6, oracleFeed: 'USDT_USD' },
    { key: 'usds', decimals: 18, oracleFeed: 'DAI_USD' },
    { key: 'wbtc', decimals: 8, oracleFeed: 'BTC_USD' },
  ],
  defaultPair: { sell: ['lido'], buy: ['eth'] },
  tokenLists: {
    sell: { url: 'https://example.com/sell.json', fallback: 'sell.json' },
    buy: { url: 'https://example.com/buy.json', fallback: 'buy.json' },
  },
  networks: {
    [mainnet.id]: COWSWAP_NETWORKS[mainnet.id],
    // sepolia is off in config, enabled here to cover a second network
    [sepolia.id]: TEST_SEPOLIA_NETWORK,
  },
  analytics: {
    quoteViewed: MATOMO_TX_EVENTS_TYPES.withdrawalDexQuoteViewed,
    quoteError: MATOMO_TX_EVENTS_TYPES.withdrawalDexQuoteError,
    swapStart: MATOMO_TX_EVENTS_TYPES.withdrawalDexSwapStart,
    swapPosted: MATOMO_TX_EVENTS_TYPES.withdrawalDexSwapPosted,
    swapFinish: MATOMO_TX_EVENTS_TYPES.withdrawalDexSwapFinish,
    swapCancel: MATOMO_TX_EVENTS_TYPES.withdrawalDexSwapCancel,
  },
};

export const TEST_PROFILE = createCowswapProfile(TEST_PROFILE_CONFIG);

const txConfig = (chainId: number) => {
  const config = TEST_PROFILE.getNetworkTxConfig(chainId);
  invariant(config, `no CoW Swap test config for chain ${chainId}`);
  return config;
};

export const MAINNET_TX_CONFIG = txConfig(mainnet.id);
export const SEPOLIA_TX_CONFIG = txConfig(sepolia.id);

export const CHAIN_MAINNET = mainnet.id;
export const CHAIN_SEPOLIA = sepolia.id;

export const SIGNER: Address = '0x2222222222222222222222222222222222222222';
export const ATTACKER: Address = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';

export const MAINNET_CTX: ValidationContext = {
  chainId: CHAIN_MAINNET,
  signer: SIGNER,
  networkTxConfig: MAINNET_TX_CONFIG,
  appCode: TEST_APP_CODE,
};
export const SEPOLIA_CTX: ValidationContext = {
  chainId: CHAIN_SEPOLIA,
  signer: SIGNER,
  networkTxConfig: SEPOLIA_TX_CONFIG,
  appCode: TEST_APP_CODE,
};

// keccak256 of the deterministically-stringified appData document — mirrors
// getAppDataHex() in app-data.ts, which is how the validator derives the hash the
// order's appData field is checked against, so order UIDs must be computed with it.
export const hashFullAppData = (fullAppData: string): Hex =>
  keccak256(toHex(stringify(JSON.parse(fullAppData))));
