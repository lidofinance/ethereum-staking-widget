import type { ReactNode } from 'react';

import type { GeoNoticeState } from 'utils/geo';
import { VaultWarning } from 'features/earn/shared/vault-warning';

import { GEO_NOTICE_TEXTS } from './consts';
import { GeoNoticeLoader } from './styles';

type GeoNoticeContentProps = {
  state: GeoNoticeState;
  centered?: boolean;
  limitedText?: ReactNode;
};

export const GeoNoticeContent = ({
  state,
  centered,
  limitedText,
}: GeoNoticeContentProps) => {
  const isChecking = state === 'checking' || state === 'checking-slow';

  // allows to override text for the "limited" state
  const text =
    state === 'limited' && limitedText ? limitedText : GEO_NOTICE_TEXTS[state];

  return (
    <VaultWarning
      variant="info"
      centered={centered}
      icon={isChecking ? <GeoNoticeLoader /> : undefined}
    >
      {text}
    </VaultWarning>
  );
};
