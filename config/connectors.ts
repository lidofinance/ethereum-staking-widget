import { useMemo } from 'react';
import { CHAINS } from '@lido-sdk/constants';

import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { WalletLinkConnector } from '@web3-react/walletlink-connector';
import { LedgerHQFrameConnector } from 'web3-ledgerhq-frame-connector';
import { LedgerHQConnector } from 'web3-ledgerhq-connector';
import { SafeAppConnector } from '@gnosis.pm/safe-apps-web3-react';

import { getBackendRPCPath } from '.';

export const safeMultisigConnector =
  typeof window === 'undefined' ? null : new SafeAppConnector();

export type UseConnectorsReturnType = {
  injected: InjectedConnector;
  walletconnect: WalletConnectConnector;
  coinbase: WalletLinkConnector;
  ledger: LedgerHQConnector;
  ledgerlive: LedgerHQFrameConnector;
};

// TODO: may be use https://github.com/lidofinance/lido-js-sdk/blob/main/packages/web3-react/src/context/connectors.tsx#L68
export const useConnectors = (chainId: CHAINS): UseConnectorsReturnType => {
  const prcPath = getBackendRPCPath(chainId);

  const supportedChainIds = useMemo(() => [chainId], [chainId]);

  const injected = useMemo(
    () =>
      new InjectedConnector({
        supportedChainIds,
      }),
    [supportedChainIds],
  );

  const walletconnect = useMemo(
    () =>
      new WalletConnectConnector({
        supportedChainIds,
        storageId: 'lido-walletconnect',
        rpc: {
          [chainId]: prcPath,
        },
      }),
    [prcPath, chainId, supportedChainIds],
  );

  const coinbase = useMemo(
    () =>
      new WalletLinkConnector({
        supportedChainIds,
        url: prcPath,
        appName: 'Lido',
        appLogoUrl:
          'https://lido.fi/static/images/favicon/apple-touch-icon.png',
        darkMode: false,
      }),
    [prcPath, supportedChainIds],
  );

  const ledgerlive = useMemo(() => new LedgerHQFrameConnector(), []);

  const ledger = useMemo(
    () => new LedgerHQConnector({ url: prcPath, chainId }),
    [prcPath, chainId],
  );

  return {
    injected,
    walletconnect,
    coinbase,
    ledger,
    ledgerlive,
  };
};
