import { isAddress } from 'viem';

import {
  MAX_SLIPPAGE,
  PARTNER_FEE_BPS,
  SLIPPAGE_TOTAL_BPS,
} from '../../../consts';

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
export const analyzeParams = (
  params: OnTradeParamsPayload,
  // CoW network cost in buy token units, see readNetworkCostAllowance
  networkCostAllowanceUnits = 0,
): AnalysisResult => {
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

  // CoW takes the partner fee from the gross quote, then slippage from the amount net of fees and network cost
  if (params.minimumReceiveBuyAmount !== undefined) {
    const netUnits =
      buyUnits === null
        ? null
        : buyUnits * (1 - PARTNER_FEE_BPS / SLIPPAGE_TOTAL_BPS) -
          networkCostAllowanceUnits;
    const floorUnits =
      netUnits === null || buyUnits === null
        ? null
        : netUnits * (1 - MAX_SLIPPAGE / SLIPPAGE_TOTAL_BPS) -
          (buyUnits * SLIPPAGE_TRUNCATION_BPS) / SLIPPAGE_TOTAL_BPS;
    if (
      floorUnits === null ||
      minReceiveUnits === null ||
      minReceiveUnits < floorUnits
    ) {
      return {
        level: 'blocked',
        messages: [TRADE_BUILD_ERROR(1008)],
        isStructural: true,
      };
    }
  }

  return { level: 'safe', messages: [], isStructural: false };
};
