import type { Address } from 'viem';
import type { OnTradeParamsPayload } from '@cowprotocol/events';

export type { OnTradeParamsPayload };

export type TradeGuardLevel = 'safe' | 'blocked';

export type ChainlinkFeedConfig = {
  address: Address;
  maxStaleness: number; // seconds
};
