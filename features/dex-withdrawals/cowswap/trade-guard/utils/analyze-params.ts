import { DEFAULT_THRESHOLDS, type Thresholds } from '../consts';
import type { TradeGuardLevel, OnTradeParamsPayload } from '../types';

import { safeParseDecimal } from './safe-parse-decimal';

type AnalysisResult = {
  level: TradeGuardLevel;
  messages: string[];
  /** True when the block is structural (token/recipient/wallet/limit) — oracle is irrelevant */
  isStructural: boolean;
};

// Structural validation: token whitelist, recipient, sell limit.
// All price verification is delegated to the Chainlink oracle.
export const analyzeParams = (
  params: OnTradeParamsPayload,
  t: Thresholds = DEFAULT_THRESHOLDS,
): AnalysisResult => {
  const sellAddr = params.sellToken?.address.toLowerCase();
  const buyAddr = params.buyToken?.address.toLowerCase();

  if (!sellAddr || !buyAddr) {
    return {
      level: 'blocked',
      messages: [
        'Token information unavailable — swap cannot be fully verified',
      ],
      isStructural: true,
    };
  }

  // Max sell amount
  const sellUnits = safeParseDecimal(params.sellTokenAmount?.units?.toString());
  const symbol = params.sellToken?.symbol;
  if (sellUnits !== null && sellUnits > t.maxAllowedSellAmount) {
    return {
      level: 'blocked',
      messages: [
        `Single transactions are capped at ${t.maxAllowedSellAmount.toLocaleString()} ${symbol}. This limit exists to protect you from outsized losses due to slippage, MEV, and execution risk. Split your order into smaller trades to continue.`,
      ],
      isStructural: true,
    };
  }

  return { level: 'safe', messages: [], isStructural: false };
};
