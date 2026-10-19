import { useEffect, useMemo } from 'react';
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
  verifySignedOrder: (order: OrderData) => string | null;
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
  verifySignedOrder,
  verifyApproval,
  openTransactionGuardModal,
  openSigningErrorModal,
  getNetworkTxConfig,
  appCode,
}: UseCowSwapEthereumProviderOptions): EthereumProvider | undefined => {
  const { chainId } = useDappStatus();
  const { data: walletClient } = useWalletClient();
  const { connector } = useConnection();
  const isLedgerLive = useIsLedgerLive();

  // clean up on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  return useMemo(() => {
    // resolved from the same chainId the validators receive
    const networkTxConfig = getNetworkTxConfig(chainId);
    if (
      !walletClient ||
      !connector ||
      walletClient.chain.id !== chainId ||
      !networkTxConfig
    ) {
      return undefined;
    }

    cleanup();

    return createCowSwapProvider({
      walletClient,
      connector,
      chainId,
      isLedgerLive,
      networkTxConfig,
      appCode,
      verifySignedOrder,
      verifyApproval,
      openTransactionGuardModal,
      openSigningErrorModal,
      addCleanup,
    });
  }, [
    walletClient,
    connector,
    chainId,
    getNetworkTxConfig,
    appCode,
    verifySignedOrder,
    verifyApproval,
    openTransactionGuardModal,
    isLedgerLive,
    openSigningErrorModal,
  ]);
};
