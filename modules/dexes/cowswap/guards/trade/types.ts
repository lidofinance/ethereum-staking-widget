import type { OnTradeParamsPayload } from '@cowprotocol/events';

export type { OnTradeParamsPayload };

export type TradeGuardLevel = 'safe' | 'blocked';

export type OracleOutcome = {
  level: TradeGuardLevel;
  messages: string[];
  verified: boolean;
};
