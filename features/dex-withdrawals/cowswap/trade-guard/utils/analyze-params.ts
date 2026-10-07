import { isAddress } from 'viem';
import {
  DEFAULT_THRESHOLDS,
  TRADE_BUILD_ERROR,
  TRADE_SIZE_ERROR,
  type Thresholds,
} from '../consts';
import type { TradeGuardLevel, OnTradeParamsPayload } from '../types';
import { MAX_SLIPPAGE, SLIPPAGE_TOTAL_BPS } from '../../consts';

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
  const buyUnits = safeParseDecimal(params.buyTokenAmount?.units?.toString());
  const minReceiveUnits = safeParseDecimal(
    params.minimumReceiveBuyAmount?.units?.toString(),
  );
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

  // +1 bps absorbs the widget's atom-level truncation.
  const ADJUSTED_MAX_SLIPPAGE = MAX_SLIPPAGE + 1;
  if (
    params.minimumReceiveBuyAmount !== undefined &&
    (buyUnits === null ||
      minReceiveUnits === null ||
      minReceiveUnits <
        buyUnits * (1 - ADJUSTED_MAX_SLIPPAGE / SLIPPAGE_TOTAL_BPS))
  ) {
    return {
      level: 'blocked',
      messages: [TRADE_BUILD_ERROR(1008)],
      isStructural: true,
    };
  }

  return { level: 'safe', messages: [], isStructural: false };
};
