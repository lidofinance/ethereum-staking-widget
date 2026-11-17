import type { OnTradeParamsPayload } from '@cowprotocol/events';

export type { OnTradeParamsPayload };

export type TradeGuardLevel = 'safe' | 'blocked';

export type OracleOutcome = {
  level: TradeGuardLevel;
  messages: string[];
  verified: boolean;
};

// One widget provider's lifetime. Ending it drops the validated trade and
// approval, pending validations, and the provider's access to the wallet
export type CowSwapSession = {
  isActive: () => boolean;
  revoke: () => void;
};
