import { useConnectorInfo } from 'reef-knot/core-react';
import { useAppFlag } from 'providers/app-flag';

export const useIsLedgerLive = () => {
  const appFlag = useAppFlag();
  const { isLedgerLive } = useConnectorInfo();

  return appFlag === 'ledger-live' || isLedgerLive;
};
