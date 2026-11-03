import { useEffect, useMemo, useRef } from 'react';
import { EthereumProvider } from '@cowprotocol/widget-react';
import { useConnection, useWalletClient } from 'wagmi';

import { useDappStatus, useIsLedgerLive } from 'modules/web3';

import type { ApprovalData, OrderData, NetworkTxConfig } from '../guards/tx';
import type { SigningHelpTip } from '../guards/trade';
import { createCowSwapProvider } from '../utils';

const CLEANUP_SET = new Set<() => void>();

const addCleanup = (fn: () => void) => {
  CLEANUP_SET.add(fn);
};

const cleanup = () => {
  for (const fn of CLEANUP_SET) {
    try {
      fn();
    } catch (error) {
      console.error('[useCowSwapEthereumProvider] Cleanup error:', error);
    }
  }
  CLEANUP_SET.clear();
};

type UseCowSwapEthereumProviderOptions = {
  consumeSignedOrder: (order: OrderData) => string | null;
  verifyApproval: (approval: ApprovalData) => string | null;
  openTransactionGuardModal: (reason: string) => Promise<void>;
  openSigningErrorModal: (
    reason: string,
    helpTip?: SigningHelpTip,
  ) => Promise<void>;
  getNetworkTxConfig: (chainId: number) => NetworkTxConfig | undefined;
  appCode: string;
};

export const useCowSwapEthereumProvider = ({
  consumeSignedOrder,
  verifyApproval,
  openTransactionGuardModal,
  openSigningErrorModal,
  getNetworkTxConfig,
  appCode,
}: UseCowSwapEthereumProviderOptions): {
  provider: EthereumProvider | undefined;
  // wallet is on the dapp chain but its client is not ready yet
  isProviderPending: boolean;
} => {
  const { chainId, walletChainId } = useDappStatus();
  const { data: walletClient } = useWalletClient();
  const { connector, address } = useConnection();
  const isLedgerLive = useIsLedgerLive();

  // clean up on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const result = useMemo(() => {
    // resolved from the same chainId the validators receive
    const networkTxConfig = getNetworkTxConfig(chainId);
    if (walletChainId !== chainId || !networkTxConfig) {
      return { provider: undefined, isProviderPending: false };
    }
    if (!walletClient || !connector || walletClient.chain.id !== chainId) {
      return { provider: undefined, isProviderPending: true };
    }

    cleanup();

    const provider = createCowSwapProvider({
      walletClient,
      connector,
      chainId,
      isLedgerLive,
      networkTxConfig,
      appCode,
      consumeSignedOrder,
      verifyApproval,
      openTransactionGuardModal,
      openSigningErrorModal,
      addCleanup,
    });
    return { provider, isProviderPending: false };
  }, [
    walletClient,
    connector,
    chainId,
    walletChainId,
    getNetworkTxConfig,
    appCode,
    consumeSignedOrder,
    verifyApproval,
    openTransactionGuardModal,
    isLedgerLive,
    openSigningErrorModal,
  ]);

  // TODO: temp debug of widget reloads: what changed before the provider was recreated or dropped
  const debugRef = useRef<Record<string, unknown> | null>(null);
  useEffect(() => {
    const snapshot: Record<string, unknown> = {
      walletClient,
      connector,
      address,
      chainId,
      walletChainId,
      isLedgerLive,
      provider: result.provider,
      isProviderPending: result.isProviderPending,
    };
    const prev = debugRef.current;
    debugRef.current = snapshot;
    if (!prev || prev.provider === result.provider) return;
    const changed = Object.keys(snapshot).filter(
      (key) => key !== 'provider' && prev[key] !== snapshot[key],
    );
    console.warn('[CowSwap provider debug] provider changed', {
      changed,
      state: result.provider
        ? 'ready'
        : result.isProviderPending
          ? 'pending'
          : 'none',
      address,
      chainId,
      walletChainId,
      walletClientChainId: walletClient?.chain.id,
      connector: connector?.id,
    });
  });

  return result;
};
