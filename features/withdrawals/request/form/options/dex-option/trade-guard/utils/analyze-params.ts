import {
  PARTNER_FEE_PCT,
  DEFAULT_THRESHOLDS,
  VALID_SELL_TOKENS,
  VALID_BUY_TOKENS,
  type Thresholds,
} from '../consts';
import type { TradeGuardLevel, OnTradeParamsPayload } from '../types';

import { safeParseDecimal } from './safe-parce-decimal';
import { resolveLevel } from './resolve-level';

type AnalysisResult = {
  level: TradeGuardLevel;
  fiatDeviation: number | null;
  messages: string[];
};

// Shared validation logic used by both the banner and the gate
export const analyzeParams = (
  params: OnTradeParamsPayload,
  walletAddress: string | undefined,
  isTestnet: boolean,
  t: Thresholds = DEFAULT_THRESHOLDS,
): AnalysisResult => {
  const messages: string[] = [];

  const sellAddr = params.sellToken?.address.toLowerCase();
  const buyAddr = params.buyToken?.address.toLowerCase();

  if (!sellAddr || !buyAddr) {
    return {
      level: 'danger',
      fiatDeviation: null,
      messages: [
        'Token information unavailable — trade cannot be fully verified',
      ],
    };
  }

  // Token whitelist (mainnet only)
  if (!isTestnet) {
    if (!VALID_SELL_TOKENS.has(sellAddr)) {
      return {
        level: 'blocked',
        fiatDeviation: null,
        messages: ['Invalid sell token detected'],
      };
    }
    if (!VALID_BUY_TOKENS.has(buyAddr)) {
      return {
        level: 'blocked',
        fiatDeviation: null,
        messages: ['Invalid buy token detected'],
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
      fiatDeviation: null,
      messages: ['Trade recipient does not match your wallet address'],
    };
  }

  // Max sell amount
  const sellUnits = safeParseDecimal(params.sellTokenAmount?.units?.toString());
  if (sellUnits !== null && sellUnits > t.maxAllowedSellAmount) {
    return {
      level: 'blocked',
      fiatDeviation: null,
      messages: [
        `Sell amount (${sellUnits.toFixed(2)}) exceeds maximum allowed (${t.maxAllowedSellAmount})`,
      ],
    };
  }

  // Fiat deviation
  const sellFiat = safeParseDecimal(params.sellTokenFiatAmount);
  const buyFiat = safeParseDecimal(params.buyTokenFiatAmount);
  let fiatDeviation: number | null = null;

  if (sellFiat !== null && buyFiat !== null && sellFiat > 0) {
    // Subtract partner fee — it's a known fixed cost, not unexpected loss
    fiatDeviation = ((sellFiat - buyFiat) / sellFiat) * 100 - PARTNER_FEE_PCT;
    if (fiatDeviation >= t.fiatDeviationDanger) {
      messages.push(
        `Fiat value deviation: ${fiatDeviation.toFixed(1)}% loss` +
          ` (sell $${sellFiat.toFixed(2)} → buy $${buyFiat.toFixed(2)})`,
      );
    }
  }

  // Slippage ratio check — skipped for small trades where fixed network costs
  // (gas paid by solver) dominate and distort the percentage ratio
  let hasHighSlippage = false;
  if (sellFiat === null || sellFiat >= t.slippageCheckMinFiat) {
    const minReceive = safeParseDecimal(
      params.minimumReceiveBuyAmount?.units?.toString(),
    );
    const buyAmount = safeParseDecimal(
      params.buyTokenAmount?.units?.toString(),
    );
    if (
      minReceive !== null &&
      buyAmount !== null &&
      minReceive > 0 &&
      buyAmount > 0
    ) {
      const ratio = minReceive / buyAmount;
      if (ratio < t.minReceiveRatioThreshold) {
        hasHighSlippage = true;
        messages.push(
          `Unusually high slippage tolerance: minimum receive is ${((1 - ratio) * 100).toFixed(1)}% below quoted amount`,
        );
      }
    }
  }

  const level = resolveLevel(fiatDeviation, null, t);

  return {
    level: hasHighSlippage && level === 'safe' ? 'danger' : level,
    fiatDeviation,
    messages,
  };
};
