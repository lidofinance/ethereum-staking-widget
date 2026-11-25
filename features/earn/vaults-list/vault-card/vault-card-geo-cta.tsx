import type { PropsWithChildren } from 'react';

import { GEO_LIMITED_CARD_TEXT } from '../../shared/v2/geo-notice/consts';
import { GeoNoticeContent } from '../../shared/v2/geo-notice/geo-notice-content';
import { useGeoNoticeState } from '../../shared/v2/geo-notice/use-geo-notice-state';
import { VaultCardGeoNoticeWrapper } from './styles';

export const VaultCardGeoCta = ({ children }: PropsWithChildren) => {
  const state = useGeoNoticeState(true);

  if (!state) return <>{children}</>;

  return (
    <VaultCardGeoNoticeWrapper
      data-testid="geo-notice"
      data-geo-notice-state={state}
    >
      <GeoNoticeContent
        state={state}
        centered
        limitedText={GEO_LIMITED_CARD_TEXT}
      />
    </VaultCardGeoNoticeWrapper>
  );
};
