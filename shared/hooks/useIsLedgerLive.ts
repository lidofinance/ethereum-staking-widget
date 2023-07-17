import { useConnectorInfo } from 'reef-knot/web3-react';
import { useAppFlag } from 'providers/app-flag';

export const useIsLedgerLive = () => {
  const appFlag = useAppFlag();
  const { isLedgerLive } = useConnectorInfo();

  return appFlag === 'ledger-live' || isLedgerLive;
};
