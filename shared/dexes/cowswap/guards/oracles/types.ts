import type { Address } from 'viem';
import type { OnTradeParamsPayload } from '@cowprotocol/events';

export type OracleResult =
  | { ok: true; sellTokenUsd: number; buyTokenUsd: number; deviation: number }
  | { ok: false; reason: 'unsupported' | 'unavailable' };

export type { OnTradeParamsPayload };

export type ChainlinkFeedConfig = {
  address: Address;
  maxStaleness: number; // seconds
};
