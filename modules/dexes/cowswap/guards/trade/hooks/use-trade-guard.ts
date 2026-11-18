import { type Address, isAddress, isAddressEqual } from 'viem';
import { useCallback, useRef, useState } from 'react';
import { mainnet } from 'viem/chains';

import type { MATOMO_TX_EVENTS_TYPES } from 'consts/matomo/matomo-tx-events';
import { trackMatomoEvent } from 'utils/track-matomo-event';

// direct file import: the utils index pulls the provider, which imports the guards
import { getTokenPair } from '../../../utils/token-pair-tracker';

import { useOracleRates, type OracleFeedMaps } from '../../oracles';

import {
  createCowSwapSession,
  evaluateTrade,
  evaluateApproval,
  toNativeSaleSnapshot,
  type CowSwapSession,
  type TokenDecimalsMap,
} from '../utils';
import type { TradeGuardLevel, OnTradeParamsPayload } from '../types';

import {
  MODAL_INITIAL_STATE,
  type SigningHelpTip,
  type TradeGuardModalState,
} from '../trade-guard-modal';
import { WRAP_UNAVAILABLE_ERROR, WRAP_UNAVAILABLE_TITLE } from '../consts';

const isSameAddress = (a?: string, b?: string): boolean =>
  a === undefined || b === undefined
    ? a === b
    : isAddress(a) && isAddress(b)
      ? isAddressEqual(a, b)
      : a === b;

// stands in until the first provider starts: stores nothing
const NO_SESSION = createCowSwapSession({});
NO_SESSION.revoke();

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

type UseTradeGuardOptions = {
  // dapp chain the widget runs on, not the one the frame reports
  chainId: number;
  isTestnet?: boolean;
  tokenDecimals: TokenDecimalsMap;
  oracleFeeds: OracleFeedMaps;
  quoteErrorEvent: MATOMO_TX_EVENTS_TYPES;
  weth: Address;
};

export const useTradeGuard = ({
  chainId,
  isTestnet = false,
  tokenDecimals,
  oracleFeeds,
  quoteErrorEvent,
  weth,
}: UseTradeGuardOptions) => {
  const [modalState, setModalState] =
    useState<TradeGuardModalState>(MODAL_INITIAL_STATE);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);
  // holds the validated trade and approval; none is stored before a provider starts
  const sessionRef = useRef<CowSwapSession>(NO_SESSION);
  const approvalCallIdRef = useRef(0);
  const lastTradeParamsRef = useRef<OnTradeParamsPayload | null>(null);
  const { verifyWithOracle, readSellTokenUsd, readNetworkCostAllowance } =
    useOracleRates(oracleFeeds, {
      isMainnet: chainId === mainnet.id,
      isTestnet,
    });

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
        const params = lastTradeParamsRef.current;
        trackMatomoEvent(quoteErrorEvent, {
          token: getTokenPair(params?.sellToken, params?.buyToken),
        });
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

  // Starts the session of a new widget provider and revokes the previous one
  const startSession = useCallback((): CowSwapSession => {
    sessionRef.current.revoke();
    sessionRef.current = createCowSwapSession(tokenDecimals);
    return sessionRef.current;
  }, [tokenDecimals]);

  // Swap gate: structural checks → oracle check → modal
  const validateTrade = useCallback(
    async (payload: OnTradeParamsPayload): Promise<boolean> => {
      // the session this check stores into, even if a newer one starts meanwhile
      const session = sessionRef.current;
      // a failed or pending check leaves nothing to sign
      session.storeTrade(null);

      const reportedSellToken = lastTradeParamsRef.current?.sellToken?.address;
      const decision = await evaluateTrade(payload, {
        isTestnet,
        verifyWithOracle,
        readNetworkCostAllowance,
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
      session.storeTrade(
        toNativeSaleSnapshot(decision.snapshot, reportedSellToken, weth),
      );

      return session.isActive();
    },
    [isTestnet, verifyWithOracle, readNetworkCostAllowance, showModal, weth],
  );

  // ---------------------------------------------------------------------------
  // ON_CHANGE_TRADE_PARAMS → store latest payload for pre-approval checks
  // ---------------------------------------------------------------------------

  /** Call from ON_CHANGE_TRADE_PARAMS to track current params. */
  const reportTradeParams = useCallback((payload: OnTradeParamsPayload) => {
    const previous = lastTradeParamsRef.current;
    // Approval snapshot belongs to the sell token and amount it was made for
    if (
      !isSameAddress(
        previous?.sellToken?.address,
        payload.sellToken?.address,
      ) ||
      previous?.sellTokenAmount?.units !== payload.sellTokenAmount?.units
    ) {
      sessionRef.current.storeApproval(null);
    }
    lastTradeParamsRef.current = payload;
  }, []);

  /** Approval gate — uses last ON_CHANGE_TRADE_PARAMS data. */
  const validateApproval = useCallback(async (): Promise<boolean> => {
    const session = sessionRef.current;
    // Invalidate previous snapshot — prevents stale data if this call fails
    session.storeApproval(null);
    const callId = ++approvalCallIdRef.current;

    const decision = await evaluateApproval(lastTradeParamsRef.current, {
      isTestnet,
      readSellTokenUsd,
      readNetworkCostAllowance,
      tokenDecimals,
    });

    // A newer approval check owns the snapshot
    if (callId !== approvalCallIdRef.current) return false;

    if (!decision.ok) {
      await showModal(decision.level, decision.messages, false);
      return false;
    }

    // Store validated approval for provider-level approve verification
    session.storeApproval(decision.snapshot);

    return session.isActive();
  }, [
    isTestnet,
    readSellTokenUsd,
    readNetworkCostAllowance,
    tokenDecimals,
    showModal,
  ]);

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
    rejectWrapOrUnwrap,
    startSession,
  };
};
