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
} from './utils';
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
  baseLevel: TradeGuardLevel,
  fiatDeviation: number | null,
  baseMessages: string[],
  meetsThreshold: boolean,
  t: Thresholds,
): OracleOutcome => {
  if (result.ok) {
    const oracleLevel = resolveLevel(fiatDeviation, result.deviation, t);

    // Preserve slippage escalation from analyzeParams as a floor
    const level =
      oracleLevel === 'safe' && baseLevel !== 'safe' ? baseLevel : oracleLevel;
    const messages =
      result.deviation >= t.oracleDeviationDanger
        ? [
            ...baseMessages,
            `Oracle price deviation: ${result.deviation.toFixed(1)}% (Chainlink verification)`,
          ]
        : baseMessages;

    return { level, messages, verified: true };
  }

  const noOracle: OracleOutcome = {
    level: baseLevel,
    messages: baseMessages,
    verified: false,
  };

  if (result.reason === 'unavailable') {
    if (baseLevel !== 'safe') {
      return {
        ...noOracle,
        messages: [
          ...baseMessages,
          'Oracle verification unavailable — proceed with caution',
        ],
      };
    }

    if (meetsThreshold) {
      return {
        ...noOracle,
        level: 'warning',
        messages: [
          ...baseMessages,
          'Oracle verification temporarily unavailable',
        ],
      };
    }

    // Trade is safe and below oracle threshold — no warning needed
    return noOracle;
  }

  if (result.reason === 'unsupported') {
    return {
      ...noOracle,
      level: baseLevel === 'safe' ? 'warning' : baseLevel,
      messages: [
        ...baseMessages,
        'Oracle price verification not available for this token pair',
      ],
    };
  }

  return noOracle;
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
  const resolveRef = useRef<((value: boolean) => void) | null>(null);
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

  // Trade gate: fiat check → oracle check → modal
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
      const { level, fiatDeviation, messages } = analyzeParams(
        payload,
        walletAddress,
        isTestnet,
        t,
      );

      let finalLevel = level;
      let finalMessages = messages;
      let oracleVerified = false;

      // Small trade detection — fixed network costs dominate percentage checks
      const sellFiat = safeParseDecimal(payload.sellTokenFiatAmount);
      const isSmallTrade =
        sellFiat !== null && sellFiat < t.slippageCheckMinFiat;

      // Oracle verification
      const sellUnits = safeParseDecimal(
        payload.sellTokenAmount?.units?.toString(),
      );
      // QA can only lower the oracle threshold (check smaller trades), never raise it
      const oracleMinSell = Math.min(
        overrideWithQAMockNumber(
          t.minSellUnits,
          QA_THRESHOLD_KEYS.minSellUnits,
        ),
        t.minSellUnits,
      );
      const meetsThreshold = sellUnits !== null && sellUnits >= oracleMinSell;
      // QA cannot skip oracle — override only kept for key documentation
      const shouldCheckOracle =
        !isTestnet && !isSmallTrade && (meetsThreshold || level !== 'safe');

      if (shouldCheckOracle) {
        const result = await verifyWithOracle(payload);
        const outcome = applyOracleResult(
          result,
          level,
          fiatDeviation,
          messages,
          meetsThreshold,
          t,
        );
        finalLevel = outcome.level;
        finalMessages = outcome.messages;
        oracleVerified = outcome.verified;
      }

      // Small trades: cap at warning — fixed costs inflate deviation, not manipulation.
      // Never downgrade structural blocks (token whitelist, recipient mismatch) —
      // those return blocked with fiatDeviation=null from analyzeParams.
      if (isSmallTrade && finalLevel !== 'safe' && level !== 'blocked') {
        finalLevel = 'warning';
      }

      // QA overrides
      finalLevel = applyQALevelOverride(finalLevel);

      // Gate decision
      if (finalLevel === 'blocked') {
        await showModal(finalLevel, finalMessages, oracleVerified);

        return false;
      }
      if (finalLevel === 'danger') {
        return showModal(finalLevel, finalMessages, oracleVerified);
      }

      return true;
    },
    [walletAddress, isTestnet, verifyWithOracle, showModal],
  );

  // Show a blocked modal with custom messages (e.g. sell amount exceeded)
  const showBlockedMessage = useCallback(
    async (messages: string[]): Promise<void> => {
      await showModal('blocked', messages, false);
    },
    [showModal],
  );

  return { modalState, handleModalClose, validateTrade, showBlockedMessage };
};
