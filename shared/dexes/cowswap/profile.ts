import invariant from 'tiny-invariant';
import { mainnet } from 'viem/chains';

import type { MATOMO_TX_EVENTS_TYPES } from 'consts/matomo';

import { buildNetworkTxConfig } from './guards/tx/utils/network-tx-config';
import { resolveTokenAddress } from './guards/tx/utils/token-addresses';
import type {
  ContactsMap,
  DexTokenKey,
  NetworkTxConfig,
} from './guards/tx/utils/types';
import type { OraclePriceKey } from './guards/oracles/feeds';
import type { OracleFeedMaps } from './guards/oracles/utils/verify-with-oracle';
import type { TokenDecimalsMap } from './guards/trade/utils/verify-order';

export type { ContactsMap, DexTokenKey, NetworkTxConfig, OraclePriceKey };

export type CowswapToken = {
  key: DexTokenKey;
  decimals: number;
  // tokens without a feed are blocked by the oracle check on mainnet
  oracleFeed: OraclePriceKey;
};

export type CowswapTokenList = {
  url: string;
  // path relative to window.location.origin
  fallback: string;
};

export type CowswapAnalyticsEvents = {
  quoteViewed: MATOMO_TX_EVENTS_TYPES;
  quoteError: MATOMO_TX_EVENTS_TYPES;
  swapStart: MATOMO_TX_EVENTS_TYPES;
  swapPosted: MATOMO_TX_EVENTS_TYPES;
  swapFinish: MATOMO_TX_EVENTS_TYPES;
  swapCancel: MATOMO_TX_EVENTS_TYPES;
};

export type CowswapProfileConfig = {
  appCode: string;
  sellTokens: readonly CowswapToken[];
  buyTokens: readonly CowswapToken[];
  // widget asset symbols selected on load
  defaultPair: { sell: string; buy: string };
  tokenLists: { sell: CowswapTokenList; buy: CowswapTokenList };
  // must include mainnet: oracle feeds and decimals are resolved by mainnet addresses
  networks: Record<number, ContactsMap>;
  analytics: CowswapAnalyticsEvents;
};

export type CowswapProfile = Omit<
  CowswapProfileConfig,
  'networks' | 'sellTokens' | 'buyTokens'
> & {
  // unknown chains fall back to mainnet
  getNetworkTxConfig: (chainId: number) => NetworkTxConfig;
  tokenDecimals: TokenDecimalsMap;
  oracleFeeds: OracleFeedMaps;
};

const toAddressMap = <T>(
  contracts: ContactsMap,
  tokens: readonly CowswapToken[],
  pick: (token: CowswapToken) => T,
): Record<string, T> => {
  const map: Record<string, T> = {};
  for (const token of tokens) {
    const address = resolveTokenAddress(contracts, token.key);
    if (address) map[address] = pick(token);
  }

  return map;
};

export const createCowswapProfile = ({
  networks,
  sellTokens,
  buyTokens,
  ...rest
}: CowswapProfileConfig): CowswapProfile => {
  const mainnetContracts = networks[mainnet.id];
  invariant(mainnetContracts, 'CoW Swap profile requires mainnet contracts');
  invariant(rest.appCode.trim(), 'CoW Swap profile requires appCode');

  const sellKeys = sellTokens.map((token) => token.key);
  const buyKeys = buyTokens.map((token) => token.key);

  invariant(
    sellKeys.length > 0 && buyKeys.length > 0,
    'CoW Swap profile has no tokens',
  );
  invariant(
    new Set(sellKeys).size === sellKeys.length &&
      new Set(buyKeys).size === buyKeys.length,
    'CoW Swap profile has duplicate tokens',
  );
  // native ETH cannot be approved or presigned, it is sold through EthFlow
  invariant(
    !sellKeys.includes('eth') || mainnetContracts.cowEthFlow,
    'CoW Swap profile cannot sell ETH without EthFlow',
  );
  // a token listed on both sides must use one price and one decimals
  for (const sellToken of sellTokens) {
    const buyToken = buyTokens.find((token) => token.key === sellToken.key);
    invariant(
      !buyToken ||
        (buyToken.decimals === sellToken.decimals &&
          buyToken.oracleFeed === sellToken.oracleFeed),
      `CoW Swap profile token ${sellToken.key} differs between sell and buy`,
    );
  }

  const txConfigs = new Map<number, NetworkTxConfig>();
  for (const [chainId, contracts] of Object.entries(networks)) {
    txConfigs.set(
      Number(chainId),
      buildNetworkTxConfig(contracts, sellKeys, buyKeys),
    );
  }
  const mainnetTxConfig = txConfigs.get(mainnet.id) as NetworkTxConfig;

  const tokenDecimals: TokenDecimalsMap = toAddressMap(
    mainnetContracts,
    [...sellTokens, ...buyTokens],
    (token) => token.decimals,
  );
  const oracleFeeds: OracleFeedMaps = {
    sell: toAddressMap<OraclePriceKey>(
      mainnetContracts,
      sellTokens,
      (token) => token.oracleFeed,
    ),
    buy: toAddressMap<OraclePriceKey>(
      mainnetContracts,
      buyTokens,
      (token) => token.oracleFeed,
    ),
  };

  return {
    ...rest,
    getNetworkTxConfig: (chainId) => txConfigs.get(chainId) ?? mainnetTxConfig,
    tokenDecimals,
    oracleFeeds,
  };
};
