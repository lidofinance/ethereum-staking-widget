import type { GeoNoticeState } from 'utils/geo';
import { VaultWarning } from 'features/earn/shared/vault-warning';

import { GEO_NOTICE_TEXTS } from './consts';
import { GeoNoticeLoader } from './styles';

type GeoNoticeContentProps = {
  state: GeoNoticeState;
  centered?: boolean;
};

export const GeoNoticeContent = ({
  state,
  centered,
}: GeoNoticeContentProps) => {
  const isChecking = state === 'checking' || state === 'checking-slow';

  return (
    <VaultWarning
      variant="info"
      centered={centered}
      icon={isChecking ? <GeoNoticeLoader /> : undefined}
    >
      {GEO_NOTICE_TEXTS[state]}
    </VaultWarning>
  );
};
