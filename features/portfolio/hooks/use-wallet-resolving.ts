import { useEffect, useReducer } from 'react';
import { useConnection } from 'wagmi';

// reef-knot reconnects after mount, and only with both keys set
const TERMS_KEY = 'reef-knot_accept-terms_n2';
const RECENT_CONNECTOR_KEY = 'wagmi.recentConnectorId';
// a reconnect that has not started by then is not coming
const START_TIMEOUT_MS = 3000;
// the connect screen is never held back longer than this
const MAX_RESOLVE_MS = 10_000;

export type WalletResolveState =
  'unknown' | 'waiting' | 'attempting' | 'settled';

export type WalletResolveEvent =
  | { type: 'mounted'; canReconnect: boolean }
  | { type: 'status'; status: string }
  | { type: 'startTimeout' }
  | { type: 'maxTimeout' };

const isAttempting = (status: string) =>
  status === 'connecting' || status === 'reconnecting';

export const nextWalletResolveState = (
  state: WalletResolveState,
  event: WalletResolveEvent,
): WalletResolveState => {
  if (state === 'settled') return state;
  switch (event.type) {
    case 'mounted':
      if (state !== 'unknown') return state;
      return event.canReconnect ? 'waiting' : 'settled';
    case 'status':
      if (event.status === 'connected') return 'settled';
      if (isAttempting(event.status)) return 'attempting';
      return state === 'attempting' ? 'settled' : state;
    case 'startTimeout':
      return state === 'waiting' ? 'settled' : state;
    case 'maxTimeout':
      return 'settled';
  }
};

export const canReconnect = () => {
  try {
    return (
      window.localStorage.getItem(TERMS_KEY) === 'true' &&
      window.localStorage.getItem(RECENT_CONNECTOR_KEY) != null
    );
  } catch {
    return false;
  }
};

// true while an auto-connect may still bring the wallet in
export const useWalletResolving = (): boolean => {
  const { status } = useConnection();
  const [state, dispatch] = useReducer(nextWalletResolveState, 'unknown');

  useEffect(() => {
    dispatch({ type: 'mounted', canReconnect: canReconnect() });
    const startTimeoutId = setTimeout(
      () => dispatch({ type: 'startTimeout' }),
      START_TIMEOUT_MS,
    );
    const maxTimeoutId = setTimeout(
      () => dispatch({ type: 'maxTimeout' }),
      MAX_RESOLVE_MS,
    );
    return () => {
      clearTimeout(startTimeoutId);
      clearTimeout(maxTimeoutId);
    };
  }, []);

  useEffect(() => {
    dispatch({ type: 'status', status });
  }, [status]);

  return status !== 'connected' && state !== 'settled';
};
