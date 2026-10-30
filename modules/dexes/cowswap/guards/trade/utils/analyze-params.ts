import { isAddress } from 'viem';

import { MAX_SLIPPAGE, SLIPPAGE_TOTAL_BPS } from '../../../consts';

import { safeParseDecimal } from '../../utils';

import { SLIPPAGE_TRUNCATION_BPS, TRADE_BUILD_ERROR } from '../consts';
import type { TradeGuardLevel, OnTradeParamsPayload } from '../types';

type AnalysisResult = {
  level: TradeGuardLevel;
  messages: string[];
  /** True when the block is structural (token/recipient/wallet/limit) — oracle is irrelevant */
  isStructural: boolean;
};

// Structural validation: tokens, amounts, slippage. Signing validation is handled by tx validation
// USD limits and price verification need the Chainlink oracle, see evaluateTrade
export const analyzeParams = (params: OnTradeParamsPayload): AnalysisResult => {
  const sellAddr = params.sellToken?.address.toLowerCase();
  const buyAddr = params.buyToken?.address.toLowerCase();
  const sellUnits = safeParseDecimal(params.sellTokenAmount?.units?.toString());
  const buyUnits = safeParseDecimal(params.buyTokenAmount?.units?.toString());
  const minReceiveUnits = safeParseDecimal(
    params.minimumReceiveBuyAmount?.units?.toString(),
  );

  if (
    !sellAddr ||
    !isAddress(sellAddr) ||
    !buyAddr ||
    !isAddress(buyAddr) ||
    sellUnits === null
  ) {
    return {
      level: 'blocked',
      messages: [TRADE_BUILD_ERROR(1006)],
      isStructural: true,
    };
  }

  if (sellAddr === buyAddr) {
    return {
      level: 'blocked',
      messages: [TRADE_BUILD_ERROR(1009)],
      isStructural: true,
    };
  }

  const ADJUSTED_MAX_SLIPPAGE = MAX_SLIPPAGE + SLIPPAGE_TRUNCATION_BPS;
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
