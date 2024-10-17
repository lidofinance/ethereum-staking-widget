import { useConnectorInfo } from 'reef-knot/core-react';

export const useIsLedgerHardware = () => {
  const { isLedger } = useConnectorInfo();

  return isLedger;
};
