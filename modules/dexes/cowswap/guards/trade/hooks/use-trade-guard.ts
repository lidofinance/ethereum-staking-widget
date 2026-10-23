import { ethAddress, isAddressEqual } from 'viem';
import { useCallback, useRef, useState } from 'react';

import type { MATOMO_TX_EVENTS_TYPES } from 'consts/matomo/matomo-tx-events';
import { trackMatomoEvent } from 'utils/track-matomo-event';

import type { ApprovalData, OrderData } from '../../tx';
import { useOracleRates, type OracleFeedMaps } from '../../oracles';

import {
  approvalSnapshotFromTrade,
  evaluateTrade,
  evaluateApproval,
  verifyApprovalAgainstSnapshot,
  verifyOrderAgainstSnapshot,
  type TokenDecimalsMap,
  type ValidatedApprovalSnapshot,
  type ValidatedTradeSnapshot,
} from '../utils';
import type { TradeGuardLevel, OnTradeParamsPayload } from '../types';

import {
  MODAL_INITIAL_STATE,
  type SigningHelpTip,
  type TradeGuardModalState,
} from '../trade-guard-modal';
import { WRAP_UNAVAILABLE_ERROR, WRAP_UNAVAILABLE_TITLE } from '../consts';

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
  const lastValidatedApprovalRef = useRef<ValidatedApprovalSnapshot | null>(
    null,
  );
  const approvalCallIdRef = useRef(0);
  const { verifyWithOracle, readSellTokenUsd } = useOracleRates(oracleFeeds);

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
    const previous = lastTradeParamsRef.current;
    // Approval snapshot belongs to the sell token and amount it was made for
    if (
      previous?.sellToken?.address.toLowerCase() !==
        payload.sellToken?.address.toLowerCase() ||
      previous?.sellTokenAmount?.units !== payload.sellTokenAmount?.units
    ) {
      lastValidatedApprovalRef.current = null;
    }
    lastTradeParamsRef.current = payload;
  }, []);

  /** Approval gate — uses last ON_CHANGE_TRADE_PARAMS data. */
  const validateApproval = useCallback(async (): Promise<boolean> => {
    // Invalidate previous snapshot — prevents stale data if this call fails
    lastValidatedApprovalRef.current = null;
    const callId = ++approvalCallIdRef.current;

    const decision = await evaluateApproval(lastTradeParamsRef.current, {
      isTestnet,
      readSellTokenUsd,
      tokenDecimals,
    });

    // A newer approval check owns the snapshot
    if (callId !== approvalCallIdRef.current) return false;

    if (!decision.ok) {
      await showModal(decision.level, decision.messages, false);
      return false;
    }

    // Store validated approval for provider-level approve verification
    lastValidatedApprovalRef.current = decision.snapshot;

    return true;
  }, [isTestnet, readSellTokenUsd, tokenDecimals, showModal]);

  /** Verify approve calldata against the last validated approval or trade. */
  const verifyApproval = useCallback(
    (approval: ApprovalData): string | null =>
      verifyApprovalAgainstSnapshot(approval, [
        lastValidatedApprovalRef.current,
        approvalSnapshotFromTrade(lastValidatedTradeRef.current, tokenDecimals),
      ]),
    [tokenDecimals],
  );

  /** Verify EIP-712 order against the last validated onBeforeTrade payload. */
  const consumeSignedOrder = useCallback(
    (order: OrderData): string | null => {
      const error = verifyOrderAgainstSnapshot(
        order,
        lastValidatedTradeRef.current,
        tokenDecimals,
      );
      // EthFlow sends ETH with the order: one transaction per validated trade
      if (!error && isAddressEqual(order.sellToken, ethAddress)) {
        lastValidatedTradeRef.current = null;
      }
      return error;
    },
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

  // ETH ↔ WETH goes through the CoW wrap flow, which this integration does not allow
  const rejectWrapOrUnwrap = useCallback(async (): Promise<false> => {
    await showModal(
      'blocked',
      [WRAP_UNAVAILABLE_ERROR],
      false,
      WRAP_UNAVAILABLE_TITLE,
    );
    return false;
  }, [showModal]);

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
    consumeSignedOrder,
    verifyApproval,
    rejectWrapOrUnwrap,
  };
};
