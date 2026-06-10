import { useCallback, useRef, useState } from 'react';

import type { TradeGuardLevel, OnTradeParamsPayload } from './types';
import { useOracleRates, type OracleResult } from './use-oracle-rates';
import type { Thresholds } from './consts';
import {
  safeParseDecimal,
  resolveLevel,
  analyzeParams,
  readThresholds,
  applyQALevelOverride,
  verifyOrderAmounts,
} from './utils';
import type { ValidatedTradeSnapshot } from './utils/verify-order';
import type { OrderData } from '../validate-tx';
import {
  MODAL_INITIAL_STATE,
  type TradeGuardModalState,
} from './trade-guard-modal';
import invariant from 'tiny-invariant';

// ---------------------------------------------------------------------------
// Oracle result → level/messages
// ---------------------------------------------------------------------------

type OracleOutcome = {
  level: TradeGuardLevel;
  messages: string[];
  verified: boolean;
};

const applyOracleResult = (
  result: OracleResult,
  t: Thresholds,
): OracleOutcome => {
  if (result.ok) {
    const level = resolveLevel(result.deviation, t);
    const messages =
      result.deviation >= t.oracleDeviationBlock
        ? [
            `Oracle price deviation: ${result.deviation.toFixed(1)}% (Chainlink verification)`,
          ]
        : [];

    return { level, messages, verified: true };
  }

  switch (result.reason) {
    case 'unavailable':
      return {
        level: 'blocked',
        messages: ['Oracle verification temporarily unavailable'],
        verified: false,
      };
    case 'unsupported':
      return {
        level: 'blocked',
        messages: [
          'Oracle price verification not available for this token pair',
        ],
        verified: false,
      };
    default:
      return { level: 'safe', messages: [], verified: false };
  }
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

type UseTradeGuardOptions = {
  isTestnet?: boolean;
};

export const useTradeGuard = ({ isTestnet = false }: UseTradeGuardOptions) => {
  const [modalState, setModalState] =
    useState<TradeGuardModalState>(MODAL_INITIAL_STATE);
  const sellExceededRef = useRef(false);
  const tokenSymbolRef = useRef('');
  const resolveRef = useRef<((value: boolean) => void) | null>(null);
  const lastValidatedTradeRef = useRef<ValidatedTradeSnapshot | null>(null);
  const { verifyWithOracle } = useOracleRates();

  const handleModalClose = useCallback((result: boolean) => {
    resolveRef.current?.(result);
    resolveRef.current = null;
    // Keep level/messages intact — prevents flicker during close animation
    setModalState((prev) => ({ ...prev, open: false }));
  }, []);

  const showModal = useCallback(
    (
      level: TradeGuardLevel,
      messages: string[],
      oracleVerified: boolean,
    ): Promise<boolean> =>
      new Promise((resolve) => {
        // Resolve any pending modal before opening a new one
        resolveRef.current?.(false);
        resolveRef.current = resolve;
        setModalState({ open: true, level, messages, oracleVerified });
      }),
    [],
  );

  // Swap gate: structural checks → oracle check → modal
  const validateTrade = useCallback(
    async (payload: OnTradeParamsPayload): Promise<boolean> => {
      // Invalidate previous snapshot — prevents stale data if this call fails
      lastValidatedTradeRef.current = null;

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
      const sellUnits = safeParseDecimal(
        payload.sellTokenAmount?.units?.toString(),
      );
      // Should never happen due to analyzeParams checks
      invariant(sellUnits !== null, 'Invalid sell amount units');
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

      // QA overrides
      finalLevel = applyQALevelOverride(finalLevel);

      // Gate decision — only safe passes, everything else is blocked
      if (finalLevel !== 'safe') {
        await showModal(finalLevel, finalMessages, oracleVerified);
        return false;
      }

      if (
        payload.sellTokenAmount?.units === undefined ||
        payload.buyTokenAmount?.units === undefined ||
        payload.sellToken?.address === undefined ||
        payload.buyToken?.address === undefined ||
        payload.minimumReceiveBuyAmount?.units === undefined
      ) {
        await showModal(
          'blocked',
          ['Incomplete trade parameters — cannot verify order'],
          false,
        );
        return false;
      }

      // Store validated params for provider-level EIP-712 verification
      lastValidatedTradeRef.current = {
        sellToken: payload.sellToken.address,
        buyToken: payload.buyToken.address,
        sellAmountUnits: payload.sellTokenAmount.units.toString(),
        buyAmountMinUnits: payload.minimumReceiveBuyAmount.units.toString(),
      };

      return true;
    },
    [isTestnet, verifyWithOracle, showModal],
  );

  // ---------------------------------------------------------------------------
  // ON_CHANGE_TRADE_PARAMS → store latest payload for pre-approval checks
  // ---------------------------------------------------------------------------

  const lastTradeParamsRef = useRef<OnTradeParamsPayload | null>(null);

  /** Call from ON_CHANGE_TRADE_PARAMS to track current params. */
  const reportTradeParams = useCallback((payload: OnTradeParamsPayload) => {
    lastTradeParamsRef.current = payload;

    // Track sell limit
    const t = readThresholds();
    const units = safeParseDecimal(payload.sellTokenAmount?.units?.toString());
    sellExceededRef.current = units !== null && units > t.maxAllowedSellAmount;
    tokenSymbolRef.current = payload.sellToken?.symbol ?? '';
  }, []);

  /** Structural pre-check on approval — uses last ON_CHANGE_TRADE_PARAMS data. */
  const validateApproval = useCallback(async (): Promise<boolean> => {
    const payload = lastTradeParamsRef.current;
    if (!payload) {
      await showModal(
        'blocked',
        ['Trade parameters unavailable — cannot verify approval'],
        false,
      );
      return false;
    }

    const tradeThresholds = readThresholds();
    const { level, messages } = analyzeParams(payload, tradeThresholds);

    if (level !== 'safe') {
      await showModal(level, messages, false);
      return false;
    }

    return true;
  }, [showModal]);

  /** Stable callback — safe to call from memoized widget hooks.
   *  Shows a neutral "limit" modal and returns false when exceeded. */
  const checkSellLimit = useCallback(async (): Promise<boolean> => {
    if (!sellExceededRef.current) return true;

    const tradeThresholds = readThresholds();
    const symbol = tokenSymbolRef.current || 'tokens';
    await showModal(
      'limit',
      [
        `Sell amount exceeds maximum allowed (${tradeThresholds.maxAllowedSellAmount.toLocaleString()} ${symbol})`,
      ],
      false,
    );

    return false;
  }, [showModal]);

  /** Verify EIP-712 order against the last validated onBeforeTrade payload. */
  const verifySignedOrder = useCallback((order: OrderData): string | null => {
    // Amount checks against last validated payload
    const snapshot = lastValidatedTradeRef.current;

    if (!snapshot) {
      return 'No validated trade on record — order signing rejected';
    }
    if (
      snapshot.buyAmountMinUnits === '' ||
      snapshot.sellAmountUnits === '' ||
      snapshot.buyToken === '' ||
      snapshot.sellToken === ''
    ) {
      return 'Trade parameters incomplete — cannot verify order';
    }

    return verifyOrderAmounts(order, snapshot);
  }, []);

  const openTransactionGuardModal = useCallback(
    async (reason: string) => {
      await showModal(
        'blocked',
        [`Safety of the signed transaction could not be verified: ${reason}`],
        false,
      );
    },
    [showModal],
  );

  return {
    modalState,
    handleModalClose,
    validateTrade,
    validateApproval,
    reportTradeParams,
    checkSellLimit,
    openTransactionGuardModal,
    verifySignedOrder,
  };
};
