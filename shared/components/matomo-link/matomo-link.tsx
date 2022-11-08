import { FC } from 'react';
import { Link, LinkProps } from '@lidofinance/lido-ui';
import { MatomoEvent, trackEvent } from 'utils';

interface MatomoLinkProps extends LinkProps {
  matomoEvent: MatomoEvent;
}

export const MatomoLink: FC<MatomoLinkProps> = (props) => {
  const { matomoEvent, ...rest } = props;

  const onClickHandelr = () => {
    trackEvent(...matomoEvent);
  };

  return <Link {...rest} onClick={onClickHandelr} />;
};
