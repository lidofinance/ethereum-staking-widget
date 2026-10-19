import invariant from 'tiny-invariant';

import type { MATOMO_TX_EVENTS_TYPES } from 'consts/matomo';

import { buildNetworkTxConfig } from './guards/tx/utils/network-tx-config';
import { resolveTokenAddress } from './guards/tx/utils/token-addresses';
import type {
  CowswapNetwork,
  DexTokenKey,
  NetworkTxConfig,
} from './guards/tx/utils/types';
import type { OraclePriceKey } from './guards/oracles/feeds';
import type { OracleFeedMaps } from './guards/oracles/utils/verify-with-oracle';
import type { TokenDecimalsMap } from './guards/trade/utils/verify-order';

export type { CowswapNetwork, DexTokenKey, NetworkTxConfig, OraclePriceKey };

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
  // token decimals and prices apply on every network, prices come from mainnet Chainlink
  networks: Record<number, CowswapNetwork>;
  analytics: CowswapAnalyticsEvents;
};

export type CowswapProfile = Omit<
  CowswapProfileConfig,
  'networks' | 'sellTokens' | 'buyTokens'
> & {
  // networks with a partner fee recipient; undefined disables the swap
  chainIds: readonly number[];
  getNetworkTxConfig: (chainId: number) => NetworkTxConfig | undefined;
  // lowercased token address on any enabled network → decimals / price
  tokenDecimals: TokenDecimalsMap;
  oracleFeeds: OracleFeedMaps;
};

const toAddressMap = <T>(
  networks: readonly CowswapNetwork[],
  tokens: readonly CowswapToken[],
  pick: (token: CowswapToken) => T,
): Record<string, T> => {
  const map: Record<string, T> = {};
  for (const contracts of networks) {
    for (const token of tokens) {
      const address = resolveTokenAddress(contracts, token.key);
      if (!address) continue;
      const value = pick(token);
      // one address must mean one token on every network
      invariant(
        map[address] === undefined || map[address] === value,
        `CoW Swap profile address ${address} maps to different tokens`,
      );
      map[address] = value;
    }
  }

  return map;
};

export const createCowswapProfile = ({
  networks,
  sellTokens,
  buyTokens,
  ...rest
}: CowswapProfileConfig): CowswapProfile => {
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

  // a network without a partner fee recipient stays disabled
  const enabled = Object.entries(networks).flatMap(([chainId, contracts]) => {
    const { partnerFeeRecipient } = contracts;
    return partnerFeeRecipient
      ? [
          {
            chainId: Number(chainId),
            contracts: { ...contracts, partnerFeeRecipient },
          },
        ]
      : [];
  });
  invariant(enabled.length > 0, 'CoW Swap profile has no enabled networks');

  const txConfigs = new Map<number, NetworkTxConfig>(
    enabled.map(({ chainId, contracts }) => [
      chainId,
      buildNetworkTxConfig(contracts, sellKeys, buyKeys),
    ]),
  );
  const enabledContracts = enabled.map(({ contracts }) => contracts);

  const tokenDecimals: TokenDecimalsMap = toAddressMap(
    enabledContracts,
    [...sellTokens, ...buyTokens],
    (token) => token.decimals,
  );
  const oracleFeeds: OracleFeedMaps = {
    sell: toAddressMap<OraclePriceKey>(
      enabledContracts,
      sellTokens,
      (token) => token.oracleFeed,
    ),
    buy: toAddressMap<OraclePriceKey>(
      enabledContracts,
      buyTokens,
      (token) => token.oracleFeed,
    ),
  };

  return {
    ...rest,
    chainIds: enabled.map(({ chainId }) => chainId),
    getNetworkTxConfig: (chainId) => txConfigs.get(chainId),
    tokenDecimals,
    oracleFeeds,
  };
};
