import { getGeoNoticeState, type GeoNoticeState } from 'utils/geo';
import { useEarnGeoGate } from 'features/earn/shared/hooks/use-earn-geo-gate';

import { GEO_SLOW_CHECK_DELAY_MS } from './consts';
import { useIsDelayExceeded } from './use-is-delay-exceeded';

export const useGeoNoticeState = (
  showLimitedNotice = false,
): GeoNoticeState | null => {
  const { isGeoChecking, isGeoUnresolved, isDepositGeoAvailable } =
    useEarnGeoGate();
  const isSlow = useIsDelayExceeded(isGeoChecking, GEO_SLOW_CHECK_DELAY_MS);

  return getGeoNoticeState({
    isChecking: isGeoChecking,
    isSlow,
    isLimited: !isDepositGeoAvailable,
    isUnresolved: isGeoUnresolved,
    showLimitedNotice,
  });
};
