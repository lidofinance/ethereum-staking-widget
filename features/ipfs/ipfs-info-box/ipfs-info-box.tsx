import { CSPViolationBox } from '../csp-violation-box';
import { RPCAvailabilityCheckResultBox } from '../rpc-availability-check-result-box';

export const IPFSInfoBox = () => {
  const isCspViolated = true;
  const isInfoShown = false;

  if (isCspViolated) return <CSPViolationBox />;

  if (isInfoShown) return <RPCAvailabilityCheckResultBox />;

  return null;
};
