import { getGeoNoticeState } from 'utils/geo';
import { useEarnGeoGate } from 'features/earn/shared/hooks/use-earn-geo-gate';
import { VaultWarning } from 'features/earn/shared/vault-warning';

import { GEO_NOTICE_TEXTS, GEO_SLOW_CHECK_DELAY_MS } from './consts';
import { useIsDelayExceeded } from './use-is-delay-exceeded';
import { GeoNoticeLoader, GeoNoticeWrapper } from './styles';

type GeoNoticeProps = {
  showLimitedNotice?: boolean;
};

export const GeoNotice = ({ showLimitedNotice = false }: GeoNoticeProps) => {
  const { isGeoChecking, isGeoUnresolved, isDepositGeoAvailable } =
    useEarnGeoGate();
  const isSlow = useIsDelayExceeded(isGeoChecking, GEO_SLOW_CHECK_DELAY_MS);

  const state = getGeoNoticeState({
    isChecking: isGeoChecking,
    isSlow,
    isLimited: !isDepositGeoAvailable,
    isUnresolved: isGeoUnresolved,
    showLimitedNotice,
  });

  if (!state) return null;

  const isChecking = state === 'checking' || state === 'checking-slow';

  return (
    <GeoNoticeWrapper data-testid="geo-notice" data-geo-notice-state={state}>
      <VaultWarning
        variant="info"
        icon={isChecking ? <GeoNoticeLoader /> : undefined}
      >
        {GEO_NOTICE_TEXTS[state]}
      </VaultWarning>
    </GeoNoticeWrapper>
  );
};
