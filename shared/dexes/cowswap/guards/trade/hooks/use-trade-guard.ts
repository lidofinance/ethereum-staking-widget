import { useCallback, useRef, useState } from 'react';

import type { MATOMO_TX_EVENTS_TYPES } from 'consts/matomo/matomo-tx-events';
import { trackMatomoEvent } from 'utils/track-matomo-event';

import type { OrderData } from '../../tx';
import { useOracleRates } from '../../oracles';
import type { OracleFeedMaps } from '../../oracles/utils';

import {
  evaluateTrade,
  evaluateApproval,
  verifyOrderAgainstSnapshot,
  type TokenDecimalsMap,
  type ValidatedTradeSnapshot,
} from '../utils';
import type { TradeGuardLevel, OnTradeParamsPayload } from '../types';

import {
  MODAL_INITIAL_STATE,
  type SigningHelpTip,
  type TradeGuardModalState,
} from '../trade-guard-modal';

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

type UseTradeGuardOptions = {
  isTestnet?: boolean;
  tokenDecimals: TokenDecimalsMap;
  oracleFeeds: OracleFeedMaps;
  quoteErrorEvent: MATOMO_TX_EVENTS_TYPES;
};

export const useTradeGuard = ({
  isTestnet = false,
  tokenDecimals,
  oracleFeeds,
  quoteErrorEvent,
}: UseTradeGuardOptions) => {
  const [modalState, setModalState] =
    useState<TradeGuardModalState>(MODAL_INITIAL_STATE);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);
  const lastValidatedTradeRef = useRef<ValidatedTradeSnapshot | null>(null);
  const { verifyWithOracle } = useOracleRates(oracleFeeds);

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
      title?: string,
      helpTip?: SigningHelpTip,
    ): Promise<boolean> =>
      new Promise((resolve) => {
        trackMatomoEvent(quoteErrorEvent);
        // Resolve any pending modal before opening a new one
        resolveRef.current?.(false);
        resolveRef.current = resolve;
        setModalState({
          open: true,
          level,
          messages,
          oracleVerified,
          title,
          helpTip,
        });
      }),
    [quoteErrorEvent],
  );

  // Swap gate: structural checks → oracle check → modal
  const validateTrade = useCallback(
    async (payload: OnTradeParamsPayload): Promise<boolean> => {
      const decision = await evaluateTrade(payload, {
        isTestnet,
        verifyWithOracle,
        // Invalidate previous snapshot — prevents stale data if this call fails
        onSnapshotInvalidated: () => {
          lastValidatedTradeRef.current = null;
        },
      });

      if (!decision.ok) {
        await showModal(
          decision.level,
          decision.messages,
          decision.oracleVerified,
        );
        return false;
      }

      // Store validated params for provider-level EIP-712 verification
      lastValidatedTradeRef.current = decision.snapshot;

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
  }, []);

  /** Structural pre-check on approval — uses last ON_CHANGE_TRADE_PARAMS data. */
  const validateApproval = useCallback(async (): Promise<boolean> => {
    const rejection = evaluateApproval(lastTradeParamsRef.current);

    if (rejection) {
      await showModal(rejection.level, rejection.messages, false);
      return false;
    }

    return true;
  }, [showModal]);

  /** Verify EIP-712 order against the last validated onBeforeTrade payload. */
  const verifySignedOrder = useCallback(
    (order: OrderData): string | null =>
      verifyOrderAgainstSnapshot(
        order,
        lastValidatedTradeRef.current,
        tokenDecimals,
      ),
    [tokenDecimals],
  );

  const openTransactionGuardModal = useCallback(
    async (reason: string) => {
      await showModal(
        'blocked',
        [`Safety of the transaction could not be verified.`, reason],
        false,
      );
    },
    [showModal],
  );

  // The CoW iframe cannot render custom error texts — we show them ourselves
  const openSigningErrorModal = useCallback(
    async (reason: string, helpTip?: SigningHelpTip) => {
      await showModal('blocked', [reason], false, 'Signing failed', helpTip);
    },
    [showModal],
  );

  return {
    modalState,
    handleModalClose,
    validateTrade,
    validateApproval,
    reportTradeParams,
    openTransactionGuardModal,
    openSigningErrorModal,
    verifySignedOrder,
  };
};
