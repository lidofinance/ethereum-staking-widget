import type { PropsWithChildren } from 'react';

import { GEO_LIMITED_CARD_TEXT } from './consts';
import { GeoNoticeContent } from './geo-notice-content';
import { useGeoNoticeState } from './use-geo-notice-state';
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
