import { useConnectorInfo } from 'reef-knot/core-react';
import { useAppFlag } from 'providers/app-flag';
import { useConnections } from 'wagmi';
import { injected } from 'wagmi/connectors';

export const useIsLedgerLive = () => {
  const appFlag = useAppFlag();
  const { isLedgerLive } = useConnectorInfo();

  return appFlag === 'ledger-live' || isLedgerLive;
};

export const useIsLedgerHardware = () => {
  const { isLedger } = useConnectorInfo();
  return isLedger;
};

export const useIsSafeWallet = () => {
  const { isGnosis } = useConnectorInfo();
  return isGnosis;
};

export const useIsMetamask = () => {
  const connector = useConnections()[0]?.connector;
  if (!connector) return false;
  // eip6963
  if (connector.rdns === 'io.metamask') return true;
  // legacy
  return !!(
    connector.type === injected.type && (window?.ethereum as any)?.isMetaMask
  );
};
