import { useEffect, useMemo } from 'react';
import { EthereumProvider } from '@cowprotocol/widget-react';
import { isAddressEqual } from 'viem';
import { useConnection, useWalletClient } from 'wagmi';

import { useDappStatus, useIsLedgerLive } from 'modules/web3';
import { useAddressValidation } from 'providers/address-validation-provider';

import type { NetworkTxConfig } from '../guards/tx';
import type { CowSwapSession, SigningHelpTip } from '../guards/trade';
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

  // clean up on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  return useMemo(() => {
    // any change ends the previous provider's session, also when no new provider follows
    cleanup();

    // resolved from the same chainId the validators receive
    const networkTxConfig = getNetworkTxConfig(chainId);
    if (walletChainId !== chainId || !networkTxConfig) {
      return { provider: undefined, isProviderPending: false };
    }
    if (
      !walletClient ||
      !connector ||
      !address ||
      walletClient.chain.id !== chainId ||
      !isAddressEqual(walletClient.account.address, address)
    ) {
      return { provider: undefined, isProviderPending: true };
    }

    const session = startSession();
    addCleanup(session.revoke);

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
      addCleanup,
    });
    return { provider, isProviderPending: false };
  }, [
    walletClient,
    connector,
    address,
    chainId,
    walletChainId,
    getNetworkTxConfig,
    appCode,
    startSession,
    validateAddress,
    openTransactionGuardModal,
    isLedgerLive,
    openSigningErrorModal,
  ]);
};
