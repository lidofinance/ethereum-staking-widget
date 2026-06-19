import { isAddress } from 'viem';
import {
  DEFAULT_THRESHOLDS,
  TRADE_BUILD_ERROR,
  TRADE_SIZE_ERROR,
  type Thresholds,
} from '../consts';
import type { TradeGuardLevel, OnTradeParamsPayload } from '../types';

import { safeParseDecimal } from './safe-parse-decimal';

type AnalysisResult = {
  level: TradeGuardLevel;
  messages: string[];
  /** True when the block is structural (token/recipient/wallet/limit) — oracle is irrelevant */
  isStructural: boolean;
};

// Structural validation: token whitelist, sell limit. Signing validation is handled by tx validation
// All price verification is delegated to the Chainlink oracle.
export const analyzeParams = (
  params: OnTradeParamsPayload,
  t: Thresholds = DEFAULT_THRESHOLDS,
): AnalysisResult => {
  const sellAddr = params.sellToken?.address.toLowerCase();
  const buyAddr = params.buyToken?.address.toLowerCase();
  const sellUnits = safeParseDecimal(params.sellTokenAmount?.units?.toString());
  const symbol = params.sellToken?.symbol;

  if (
    !sellAddr ||
    !isAddress(sellAddr) ||
    !buyAddr ||
    !isAddress(buyAddr) ||
    sellUnits === null ||
    !symbol
  ) {
    return {
      level: 'blocked',
      messages: [TRADE_BUILD_ERROR(1006)],
      isStructural: true,
    };
  }

  // Max sell amount

  if (sellUnits > t.maxAllowedSellAmount) {
    return {
      level: 'blocked',
      messages: [TRADE_SIZE_ERROR(t.maxAllowedSellAmount, symbol)],
      isStructural: true,
    };
  }

  return { level: 'safe', messages: [], isStructural: false };
};
