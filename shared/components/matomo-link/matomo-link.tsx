import { FC } from 'react';
import { Link, LinkProps } from '@lidofinance/lido-ui';
import { trackEvent } from '@lidofinance/analytics-matomo';

import {
  MATOMO_CLICK_EVENTS_TYPES,
  MATOMO_CLICK_EVENTS,
} from 'consts/matomo-click-events';

interface MatomoLinkProps extends LinkProps {
  matomoEvent: MATOMO_CLICK_EVENTS_TYPES;
}

export const MatomoLink: FC<MatomoLinkProps> = (props) => {
  const { matomoEvent, ...rest } = props;

  const onClickHandler = () => {
    trackEvent(...MATOMO_CLICK_EVENTS[matomoEvent]);
  };

  return <Link {...rest} onClick={onClickHandler} />;
};
