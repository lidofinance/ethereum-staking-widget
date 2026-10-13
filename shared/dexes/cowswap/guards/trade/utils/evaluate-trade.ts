import { type Address, isAddress } from 'viem';

import type { OrderData } from '../../tx/utils/types';
import type { OracleResult } from '../../oracles/types';
import { safeParseDecimal } from '../../utils';

import { TRADE_BUILD_ERROR } from '../consts';
import type { TradeGuardLevel, OnTradeParamsPayload } from '../types';

import { analyzeParams } from './analyze-params';
import { applyOracleResult } from './apply-oracle-result';
import { readThresholds, applyQALevelOverride } from './qa-utils';
import {
  verifyOrderAmounts,
  type ValidatedTradeSnapshot,
} from './verify-order';

export type TradeGuardRejection = {
  ok: false;
  level: TradeGuardLevel;
  messages: string[];
  oracleVerified: boolean;
};

export type TradeGuardDecision =
  { ok: true; snapshot: ValidatedTradeSnapshot } | TradeGuardRejection;

type EvaluateTradeOptions = {
  isTestnet: boolean;
  verifyWithOracle: (payload: OnTradeParamsPayload) => Promise<OracleResult>;
  // Called once the payload is structurally complete, before any async work
  onSnapshotInvalidated?: () => void;
};

const reject = (
  level: TradeGuardLevel,
  messages: string[],
  oracleVerified = false,
): TradeGuardRejection => ({ ok: false, level, messages, oracleVerified });

// Swap gate: structural checks → oracle check → QA override
export const evaluateTrade = async (
  payload: OnTradeParamsPayload,
  { isTestnet, verifyWithOracle, onSnapshotInvalidated }: EvaluateTradeOptions,
): Promise<TradeGuardDecision> => {
  if (
    payload.sellTokenAmount?.units === undefined ||
    payload.buyTokenAmount?.units === undefined ||
    payload.sellToken?.address === undefined ||
    isAddress(payload.sellToken?.address, { strict: false }) === false ||
    payload.buyToken?.address === undefined ||
    isAddress(payload.buyToken?.address, { strict: false }) === false ||
    payload.minimumReceiveBuyAmount?.units === undefined
  ) {
    return reject('blocked', [TRADE_BUILD_ERROR(1002)]);
  }

  onSnapshotInvalidated?.();

  const tradeThresholds = readThresholds();
  const { level, messages, isStructural } = analyzeParams(
    payload,
    tradeThresholds,
  );

  let finalLevel = level;
  let finalMessages = messages;
  let oracleVerified = false;

  // Oracle verification — skip for structural blocks (oracle is irrelevant
  // for token whitelist, recipient mismatch, etc.)
  const sellUnits = safeParseDecimal(payload.sellTokenAmount.units?.toString());

  if (!sellUnits) return reject('blocked', [TRADE_BUILD_ERROR(1007)]);

  // QA clamping already applied in readThresholds()
  const meetsThreshold =
    sellUnits >= tradeThresholds.minSellUnitsToTriggerOracle;
  const shouldCheckOracle = !isTestnet && !isStructural && meetsThreshold;

  if (shouldCheckOracle) {
    const result = await verifyWithOracle(payload);
    const outcome = applyOracleResult(result, tradeThresholds);
    finalLevel = outcome.level;
    finalMessages = outcome.messages;
    oracleVerified = outcome.verified;
  }

  finalLevel = applyQALevelOverride(finalLevel);

  // Gate decision — only safe passes, everything else is blocked
  if (finalLevel !== 'safe') {
    return reject(finalLevel, finalMessages, oracleVerified);
  }

  return {
    ok: true,
    snapshot: {
      sellToken: payload.sellToken.address.toLowerCase() as Address,
      buyToken: payload.buyToken.address.toLowerCase() as Address,
      sellAmountUnits: payload.sellTokenAmount.units,
      buyAmountMinUnits: payload.minimumReceiveBuyAmount.units,
    },
  };
};

// Structural pre-check on approval — uses last ON_CHANGE_TRADE_PARAMS data
export const evaluateApproval = (
  payload: OnTradeParamsPayload | null,
): TradeGuardRejection | null => {
  if (!payload) return reject('blocked', [TRADE_BUILD_ERROR(1003)]);

  const { level, messages } = analyzeParams(payload, readThresholds());

  return level !== 'safe' ? reject(level, messages) : null;
};

// Verify EIP-712 order against the last validated onBeforeTrade payload
export const verifyOrderAgainstSnapshot = (
  order: OrderData,
  snapshot: ValidatedTradeSnapshot | null,
): string | null => {
  if (
    !snapshot ||
    snapshot.buyAmountMinUnits === '' ||
    snapshot.sellAmountUnits === ''
  ) {
    return TRADE_BUILD_ERROR(1001);
  }

  return verifyOrderAmounts(order, snapshot);
};
