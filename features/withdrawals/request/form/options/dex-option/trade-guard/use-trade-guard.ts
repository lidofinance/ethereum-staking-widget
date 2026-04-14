import { useCallback, useRef, useState } from 'react';

import { overrideWithQAMockNumber } from 'utils/qa';

import type { Thresholds } from './consts';
import type { TradeGuardLevel, OnTradeParamsPayload } from './types';
import { useOracleRates, type OracleResult } from './use-oracle-rates';
import {
  safeParseDecimal,
  resolveLevel,
  analyzeParams,
  readThresholds,
  applyQALevelOverride,
  QA_THRESHOLD_KEYS,
  verifyOrderFields,
  verifyOrderAmounts,
} from './utils';
import type { OrderFields, ValidatedTradeSnapshot } from './utils/verify-order';
import {
  MODAL_INITIAL_STATE,
  type TradeGuardModalState,
} from './trade-guard-modal';

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
  meetsThreshold: boolean,
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

  if (result.reason === 'unavailable') {
    if (meetsThreshold) {
      return {
        level: 'blocked',
        messages: ['Oracle verification temporarily unavailable'],
        verified: false,
      };
    }

    // Trade is below oracle threshold — no concern
    return { level: 'safe', messages: [], verified: false };
  }

  if (result.reason === 'unsupported') {
    return {
      level: 'blocked',
      messages: [
        'Oracle price verification not available for this token pair',
      ],
      verified: false,
    };
  }

  return { level: 'safe', messages: [], verified: false };
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

type UseTradeGuardOptions = {
  walletAddress?: string;
  isTestnet?: boolean;
};

export const useTradeGuard = ({
  walletAddress,
  isTestnet = false,
}: UseTradeGuardOptions) => {
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

  // Trade gate: structural checks → oracle check → modal
  const validateTrade = useCallback(
    async (payload: OnTradeParamsPayload): Promise<boolean> => {
      if (!walletAddress) {
        await showModal(
          'blocked',
          ['Wallet address unavailable — cannot verify trade'],
          false,
        );

        return false;
      }

      const t = readThresholds();
      const { level, messages, isStructural } = analyzeParams(
        payload,
        walletAddress,
        isTestnet,
        t,
      );

      let finalLevel = level;
      let finalMessages = messages;
      let oracleVerified = false;

      // Oracle verification — skip for structural blocks (oracle is irrelevant
      // for token whitelist, recipient mismatch, etc.)
      const sellUnits = safeParseDecimal(
        payload.sellTokenAmount?.units?.toString(),
      );
      // QA can only lower the oracle threshold (check smaller trades), never raise it
      const oracleMinSell = Math.min(
        overrideWithQAMockNumber(
          t.minSellUnitsToTriggerOracle,
          QA_THRESHOLD_KEYS.minSellUnitsToTriggerOracle,
        ),
        t.minSellUnitsToTriggerOracle,
      );
      const meetsThreshold = sellUnits !== null && sellUnits >= oracleMinSell;
      const shouldCheckOracle =
        !isTestnet && !isStructural && meetsThreshold;

      if (shouldCheckOracle) {
        const result = await verifyWithOracle(payload);
        const outcome = applyOracleResult(result, meetsThreshold, t);
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

      // Store validated params for provider-level EIP-712 verification
      lastValidatedTradeRef.current = {
        sellToken: payload.sellToken?.address ?? '',
        buyToken: payload.buyToken?.address ?? '',
        sellAmountUnits: payload.sellTokenAmount?.units?.toString() ?? '',
        buyAmountMinUnits:
          payload.minimumReceiveBuyAmount?.units?.toString() ?? '',
      };

      return true;
    },
    [walletAddress, isTestnet, verifyWithOracle, showModal],
  );

  // ---------------------------------------------------------------------------
  // Sell-amount limit — ref lives here so memoized widget hooks can read it
  // without triggering re-creation of CowSwap params.
  // ---------------------------------------------------------------------------

  /** Call from ON_CHANGE_TRADE_PARAMS to track current sell amount. */
  const reportSellAmount = useCallback((units: number, tokenSymbol: string) => {
    const t = readThresholds();
    const exceeded = !isNaN(units) && units > t.maxAllowedSellAmount;
    sellExceededRef.current = exceeded;
    tokenSymbolRef.current = tokenSymbol;
  }, []);

  /** Stable callback — safe to call from memoized widget hooks.
   *  Shows a neutral "limit" modal and returns false when exceeded. */
  const checkSellLimit = useCallback(async (): Promise<boolean> => {
    if (!sellExceededRef.current) return true;

    const t = readThresholds();
    const symbol = tokenSymbolRef.current || 'tokens';
    await showModal(
      'limit',
      [
        `Sell amount exceeds maximum allowed (${t.maxAllowedSellAmount.toLocaleString()} ${symbol})`,
      ],
      false,
    );

    return false;
  }, [showModal]);

  /** Verify EIP-712 order against the last validated onBeforeTrade payload. */
  const verifySignedOrder = useCallback(
    (order: OrderFields): string | null => {
      // Static checks (receiver, token whitelist)
      const staticError = verifyOrderFields(order, walletAddress ?? '', isTestnet);
      if (staticError) return staticError;

      // Amount checks against last validated payload
      const snapshot = lastValidatedTradeRef.current;
      if (snapshot) {
        return verifyOrderAmounts(order, snapshot);
      }

      return null;
    },
    [walletAddress, isTestnet],
  );

  return {
    modalState,
    handleModalClose,
    validateTrade,
    reportSellAmount,
    checkSellLimit,
    verifySignedOrder,
  };
};
