import { trackEvent } from '@lidofinance/analytics-matomo';
import {
  MATOMO_CLICK_EVENTS_TYPES,
  MATOMO_CLICK_EVENTS,
} from 'consts/matomo-click-events';

const onClickHandler = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
  const { target } = event;
  const matomoTarget = target instanceof Element ? target : null;
  const matomoEvent = matomoTarget
    ? matomoTarget.getAttribute('data-matomo')
    : null;

  if (!matomoEvent) return;

  trackEvent(...MATOMO_CLICK_EVENTS[matomoEvent as MATOMO_CLICK_EVENTS_TYPES]);
};

export const useMatomoEventHandle = () => {
  return onClickHandler;
};
