import {
  DEFAULT_THRESHOLDS,
  VALID_SELL_TOKENS,
  VALID_BUY_TOKENS,
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

// Structural validation: token whitelist, recipient, sell limit.
// All price verification is delegated to the Chainlink oracle.
export const analyzeParams = (
  params: OnTradeParamsPayload,
  walletAddress: string | undefined,
  isTestnet: boolean,
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

  // Token whitelist (mainnet only)
  if (!isTestnet) {
    if (!VALID_SELL_TOKENS.has(sellAddr)) {
      return {
        level: 'blocked',
        messages: ['Invalid sell token detected'],
        isStructural: true,
      };
    }
    if (!VALID_BUY_TOKENS.has(buyAddr)) {
      return {
        level: 'blocked',
        messages: ['Invalid buy token detected'],
        isStructural: true,
      };
    }
  }

  // Recipient validation (wallet may be undefined during banner updates)
  if (
    walletAddress &&
    params.recipient &&
    params.recipient.toLowerCase() !== walletAddress.toLowerCase()
  ) {
    return {
      level: 'blocked',
      messages: ['Swap recipient does not match your wallet address'],
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
