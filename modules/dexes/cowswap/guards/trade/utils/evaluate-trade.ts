import { type Address, ethAddress, isAddress, isAddressEqual } from 'viem';

import type { ApprovalData, OrderData } from '../../tx';
import type { OracleResult } from '../../oracles';
import { safeParseDecimal } from '../../utils';

import {
  TRADE_BUILD_ERROR,
  TRADE_SIZE_ERROR,
  TRADE_VERIFICATION_ERROR,
  type Thresholds,
} from '../consts';
import type {
  OracleOutcome,
  TradeGuardLevel,
  OnTradeParamsPayload,
} from '../types';

import { analyzeParams } from './analyze-params';
import { applyOracleResult } from './apply-oracle-result';
import { readThresholds, applyQALevelOverride } from './qa-utils';
import {
  unitsToRaw,
  verifyOrderAmounts,
  type TokenDecimalsMap,
  type ValidatedTradeSnapshot,
} from './verify-order';

/** Approve allowed by the last validated onBeforeApproval payload. */
export type ValidatedApprovalSnapshot = {
  token: Address;
  maxRaw: bigint;
};

export type TradeGuardRejection = {
  ok: false;
  level: TradeGuardLevel;
  messages: string[];
  oracleVerified: boolean;
};

export type TradeGuardDecision =
  { ok: true; snapshot: ValidatedTradeSnapshot } | TradeGuardRejection;

export type ApprovalDecision =
  { ok: true; snapshot: ValidatedApprovalSnapshot } | TradeGuardRejection;

type EvaluateTradeOptions = {
  isTestnet: boolean;
  verifyWithOracle: (payload: OnTradeParamsPayload) => Promise<OracleResult>;
  // Called once the payload is structurally complete, before any async work
  onSnapshotInvalidated?: () => void;
};

// USD max sell, then oracle deviation from the USD trigger
const applyTradeLimits = (
  result: OracleResult,
  sellUnits: number,
  t: Thresholds,
): OracleOutcome => {
  if (!result.ok) return applyOracleResult(result, t);

  const sellUsd = sellUnits * result.sellTokenUsd;
  if (sellUsd > t.maxSellUsd) {
    return {
      level: 'blocked',
      messages: [TRADE_SIZE_ERROR(t.maxSellUsd)],
      verified: true,
    };
  }
  if (sellUsd < t.minSellUsdToTriggerOracle) {
    return { level: 'safe', messages: [], verified: false };
  }

  return applyOracleResult(result, t);
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
  const { level, messages, isStructural } = analyzeParams(payload);

  const sellUnits = safeParseDecimal(payload.sellTokenAmount.units?.toString());

  if (!sellUnits) return reject('blocked', [TRADE_BUILD_ERROR(1007)]);

  // USD limits need the oracle price; skipped for structural blocks and testnet
  const outcome: OracleOutcome =
    isTestnet || isStructural
      ? { level, messages, verified: false }
      : applyTradeLimits(
          await verifyWithOracle(payload),
          sellUnits,
          tradeThresholds,
        );

  const finalLevel = applyQALevelOverride(outcome.level);

  // Gate decision — only safe passes, everything else is blocked
  if (finalLevel !== 'safe') {
    return reject(finalLevel, outcome.messages, outcome.verified);
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

// EthFlow: the widget sends a native ETH sale to onBeforeTrade as WETH
export const toNativeSaleSnapshot = (
  snapshot: ValidatedTradeSnapshot,
  reportedSellToken: string | undefined,
  weth: Address,
): ValidatedTradeSnapshot =>
  reportedSellToken?.toLowerCase() === ethAddress.toLowerCase() &&
  snapshot.sellToken === weth.toLowerCase()
    ? { ...snapshot, sellToken: ethAddress.toLowerCase() as Address }
    : snapshot;

type EvaluateApprovalOptions = {
  isTestnet: boolean;
  readSellTokenUsd: (payload: OnTradeParamsPayload) => Promise<number | null>;
  tokenDecimals: TokenDecimalsMap;
};

// Approval gate on the last ON_CHANGE_TRADE_PARAMS data: structure → USD max sell → snapshot
export const evaluateApproval = async (
  payload: OnTradeParamsPayload | null,
  { isTestnet, readSellTokenUsd, tokenDecimals }: EvaluateApprovalOptions,
): Promise<ApprovalDecision> => {
  if (!payload) return reject('blocked', [TRADE_BUILD_ERROR(1003)]);

  const { level, messages } = analyzeParams(payload);
  if (level !== 'safe') return reject(level, messages);

  const sellAddr = payload.sellToken?.address.toLowerCase() as Address;
  const sellUnitsRaw = payload.sellTokenAmount?.units?.toString() ?? '';
  const sellUnits = safeParseDecimal(sellUnitsRaw);
  if (!sellUnits) return reject('blocked', [TRADE_BUILD_ERROR(1007)]);

  if (!isTestnet) {
    const sellTokenUsd = await readSellTokenUsd(payload);
    if (sellTokenUsd === null) {
      return reject('blocked', [TRADE_BUILD_ERROR(1004)]);
    }

    const { maxSellUsd } = readThresholds();
    if (sellUnits * sellTokenUsd > maxSellUsd) {
      return reject('blocked', [TRADE_SIZE_ERROR(maxSellUsd)]);
    }
  }

  const sellRaw = unitsToRaw(sellUnitsRaw, sellAddr, tokenDecimals);
  if (sellRaw === null) return reject('blocked', [TRADE_BUILD_ERROR(1010)]);

  // Orders are sell-only, so CoW approves exactly the sell amount
  return { ok: true, snapshot: { token: sellAddr, maxRaw: sellRaw } };
};

// Safe bundles send approve with the order, without onBeforeApproval
export const approvalSnapshotFromTrade = (
  snapshot: ValidatedTradeSnapshot | null,
  tokenDecimals: TokenDecimalsMap,
): ValidatedApprovalSnapshot | null => {
  if (!snapshot) return null;

  const maxRaw = unitsToRaw(
    snapshot.sellAmountUnits,
    snapshot.sellToken,
    tokenDecimals,
  );

  return maxRaw === null ? null : { token: snapshot.sellToken, maxRaw };
};

// Verify approve calldata against validated approval or trade snapshots
export const verifyApprovalAgainstSnapshot = (
  approval: ApprovalData,
  snapshots: readonly (ValidatedApprovalSnapshot | null)[],
): string | null => {
  const available = snapshots.filter(
    (snapshot): snapshot is ValidatedApprovalSnapshot => snapshot !== null,
  );
  if (available.length === 0) return TRADE_VERIFICATION_ERROR(1007);

  const sameToken = available.filter((snapshot) =>
    isAddressEqual(approval.token, snapshot.token),
  );
  if (sameToken.length === 0) return TRADE_VERIFICATION_ERROR(1008);

  if (sameToken.every((snapshot) => approval.amount > snapshot.maxRaw)) {
    return TRADE_VERIFICATION_ERROR(1009);
  }

  return null;
};

// Verify EIP-712 order against the last validated onBeforeTrade payload
export const verifyOrderAgainstSnapshot = (
  order: OrderData,
  snapshot: ValidatedTradeSnapshot | null,
  tokenDecimals: TokenDecimalsMap,
): string | null => {
  if (
    !snapshot ||
    snapshot.buyAmountMinUnits === '' ||
    snapshot.sellAmountUnits === ''
  ) {
    return TRADE_BUILD_ERROR(1001);
  }

  return verifyOrderAmounts(order, snapshot, tokenDecimals);
};
