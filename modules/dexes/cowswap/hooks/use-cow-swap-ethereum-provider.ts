import { useCallback, useEffect, useMemo, useRef } from 'react';
import { EthereumProvider } from '@cowprotocol/widget-react';
import { isAddressEqual } from 'viem';
import { useConnection, useWalletClient } from 'wagmi';

import { useDappStatus, useIsLedgerLive } from 'modules/web3';
import { useAddressValidation } from 'providers/address-validation-provider';

import type { NetworkTxConfig } from '../guards/tx';
import type { CowSwapSession, SigningHelpTip } from '../guards/trade';
import { createCowSwapProvider } from '../utils';

type UseCowSwapEthereumProviderArgs = {
  // starts the provider's session; cleanup revokes it
  startSession: () => CowSwapSession;
  openTransactionGuardModal: (reason: string) => Promise<void>;
  openSigningErrorModal: (
    reason: string,
    helpTip?: SigningHelpTip,
  ) => Promise<void>;
  getNetworkTxConfig: (chainId: number) => NetworkTxConfig | undefined;
  appCode: string;
};

export const useCowSwapEthereumProvider = ({
  startSession,
  openTransactionGuardModal,
  openSigningErrorModal,
  getNetworkTxConfig,
  appCode,
}: UseCowSwapEthereumProviderArgs): {
  provider: EthereumProvider | undefined;
  // wallet is on the dapp chain but its client is not ready yet
  isProviderPending: boolean;
} => {
  const { address, chainId, walletChainId } = useDappStatus();
  // keyed by the account: a client fetched for the previous one is never reused
  const { data: walletClient } = useWalletClient({ account: address });
  const { connector } = useConnection();
  const isLedgerLive = useIsLedgerLive();
  const { validateAddress } = useAddressValidation();

  // Per-instance cleanup functions
  const cleanupFnsRef = useRef<Set<() => void>>(new Set());

  const runCleanup = useCallback(() => {
    for (const fn of cleanupFnsRef.current) {
      try {
        fn();
      } catch (error) {
        console.error('[useCowSwapEthereumProvider] Cleanup error:', error);
      }
    }
    cleanupFnsRef.current.clear();
  }, []);

  // clean up on unmount
  useEffect(() => {
    return () => {
      runCleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return useMemo(() => {
    // Clear previous cleanups when dependencies change
    runCleanup();

    // resolved from the same chainId the validators receive
    const networkTxConfig = getNetworkTxConfig(chainId);
    // no wallet, another chain or no config: the widget renders without a provider
    if (walletChainId !== chainId || !networkTxConfig) {
      return { provider: undefined, isProviderPending: false };
    }
    // the client is still loading or belongs to the previous account or chain
    if (
      !walletClient ||
      !connector ||
      !address ||
      walletClient.chain.id !== chainId ||
      !isAddressEqual(walletClient.account.address, address)
    ) {
      return { provider: undefined, isProviderPending: true };
    }

    const addFrameCleanup = (fn: () => void) => {
      cleanupFnsRef.current.add(fn);
    };
    const session = startSession();
    addFrameCleanup(session.revoke);

    const provider = createCowSwapProvider({
      walletClient,
      connector,
      chainId,
      isLedgerLive,
      networkTxConfig,
      appCode,
      session,
      validateAddress,
      openTransactionGuardModal,
      openSigningErrorModal,
      addCleanup: addFrameCleanup,
    });
    return { provider, isProviderPending: false };
  }, [
    runCleanup,
    getNetworkTxConfig,
    chainId,
    walletChainId,
    walletClient,
    connector,
    address,
    startSession,
    isLedgerLive,
    appCode,
    validateAddress,
    openTransactionGuardModal,
    openSigningErrorModal,
  ]);
};
