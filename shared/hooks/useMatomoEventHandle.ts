import { trackEvent } from 'utils';
import { MATOMO_EVENTS } from 'config';

export const useMatomoEventHandle = () => {
  const onClickHandler = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    const { target } = event;
    const matomoTarget = target instanceof Element ? target : null;
    const matomoEvent = matomoTarget
      ? matomoTarget.getAttribute('data-matomo')
      : null;

    if (!matomoEvent) return;

    trackEvent(...MATOMO_EVENTS[matomoEvent]);
  };

  return onClickHandler;
};
