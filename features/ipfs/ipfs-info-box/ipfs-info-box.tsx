import { useIPFSInfoBoxStatuses } from 'providers/ipfs-info-box-statuses';

import { CSPViolationBox } from '../csp-violation-box';
import { RPCAvailabilityCheckResultBox } from '../rpc-availability-check-result-box';

export const IPFSInfoBox = () => {
  const { isCSPViolated, isShownTheRPCNotAvailableBox } =
    useIPFSInfoBoxStatuses();

  if (isCSPViolated) return <CSPViolationBox />;

  if (isShownTheRPCNotAvailableBox) return <RPCAvailabilityCheckResultBox />;

  return null;
};
