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

    // Swap is below oracle threshold — no concern
    return { level: 'safe', messages: [], verified: false };
  }

  if (result.reason === 'unsupported') {
    return {
      level: 'blocked',
      messages: ['Oracle price verification not available for this token pair'],
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

  // Swap gate: structural checks → oracle check → modal
  const validateTrade = useCallback(
    async (payload: OnTradeParamsPayload): Promise<boolean> => {
      if (!walletAddress) {
        await showModal(
          'blocked',
          ['Wallet address unavailable — cannot verify swap'],
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
      // QA clamping already applied in readThresholds()
      const meetsThreshold =
        sellUnits !== null && sellUnits >= t.minSellUnitsToTriggerOracle;
      const shouldCheckOracle = !isTestnet && !isStructural && meetsThreshold;

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

  // ---------------------------------------------------------------------------
  // ON_CHANGE_TRADE_PARAMS → store latest payload for pre-approval checks
  // ---------------------------------------------------------------------------

  const lastTradeParamsRef = useRef<OnTradeParamsPayload | null>(null);

  /** Call from ON_CHANGE_TRADE_PARAMS to track current params. */
  const reportTradeParams = useCallback(
    (payload: OnTradeParamsPayload) => {
      lastTradeParamsRef.current = payload;

      // Track sell limit
      const t = readThresholds();
      const units = Number(payload.sellTokenAmount?.units);
      sellExceededRef.current = !isNaN(units) && units > t.maxAllowedSellAmount;
      tokenSymbolRef.current = payload.sellToken?.symbol ?? '';
    },
    [],
  );

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

    const t = readThresholds();
    const { level, messages } = analyzeParams(
      payload,
      walletAddress,
      isTestnet,
      t,
    );

    if (level !== 'safe') {
      await showModal(level, messages, false);
      return false;
    }

    return true;
  }, [walletAddress, isTestnet, showModal]);

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
      if (!walletAddress) return 'Wallet address unavailable';

      // Static checks (receiver, token whitelist)
      const staticError = verifyOrderFields(order, walletAddress, isTestnet);
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
    validateApproval,
    reportTradeParams,
    checkSellLimit,
    verifySignedOrder,
  };
};
