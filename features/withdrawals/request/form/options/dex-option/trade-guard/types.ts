import type { Address } from 'viem';
// eslint-disable-next-line import/no-extraneous-dependencies
import type { OnTradeParamsPayload } from '@cowprotocol/events';

export type { OnTradeParamsPayload };

export type TradeGuardLevel = 'safe' | 'warning' | 'danger' | 'blocked';

export type ChainlinkFeedConfig = {
  address: Address;
  maxStaleness: number; // seconds
};
