import React, { createContext, useContext } from 'react';
import invariant from 'tiny-invariant';

import { ModalProvider } from 'providers/modal-provider';

import { useAppChainManager } from './use-app-chain-manager';
import { LidoSDKProvider } from './lido-sdk';
import { LidoSDKL2Provider } from './lido-sdk-l2';

type DappChainContextValue = ReturnType<typeof useAppChainManager>;

export const DappChainContext = createContext<DappChainContextValue | null>(
  null,
);
DappChainContext.displayName = 'DappChainContext';

export const SupportL1Chains: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const appChainManager = useAppChainManager(false);

  return (
    <DappChainContext.Provider value={appChainManager}>
      <LidoSDKProvider>
        {/* Stub LidoSDKL2Provider for hooks that gives isL2:false. Will be overriden in SupportL2Chains */}
        <LidoSDKL2Provider>{children}</LidoSDKL2Provider>
      </LidoSDKProvider>
    </DappChainContext.Provider>
  );
};

export const SupportL2Chains: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const appChainManager = useAppChainManager(true);

  return (
    <DappChainContext.Provider value={appChainManager}>
      <LidoSDKL2Provider>
        <ModalProvider>{children}</ModalProvider>
      </LidoSDKL2Provider>
    </DappChainContext.Provider>
  );
};

export const useDappChain = () => {
  const context = useContext(DappChainContext);
  invariant(context, 'useDappChain was used outside of DappChainProvider');
  return context;
};
