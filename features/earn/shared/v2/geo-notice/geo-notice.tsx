import { GeoNoticeContent } from './geo-notice-content';
import { useGeoNoticeState } from './use-geo-notice-state';
import { GeoNoticeWrapper } from './styles';

type GeoNoticeProps = {
  showLimitedNotice?: boolean;
};

export const GeoNotice = ({ showLimitedNotice = false }: GeoNoticeProps) => {
  const state = useGeoNoticeState(showLimitedNotice);

  if (!state) return null;

  return (
    <GeoNoticeWrapper data-testid="geo-notice" data-geo-notice-state={state}>
      <GeoNoticeContent state={state} />
    </GeoNoticeWrapper>
  );
};
