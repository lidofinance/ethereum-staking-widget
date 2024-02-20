import { useCallback } from 'react';
import { trackEvent } from '@lidofinance/analytics-matomo';

import { MATOMO_CLICK_EVENTS } from 'consts/matomo-click-events';

import { L2Banner } from '../l2-banner';

type L2WstethProps = {
  matomoEventLink:
    | typeof MATOMO_CLICK_EVENTS.l2BannerWrap
    | typeof MATOMO_CLICK_EVENTS.l2BannerUnwrap;
};

export const L2Wsteth = ({ matomoEventLink }: L2WstethProps) => {
  const linkClickHandler = useCallback(
    () => trackEvent(...matomoEventLink),
    [matomoEventLink],
  );
  return (
    <L2Banner
      testidWrap="L2wstETHbanner"
      testidButton="l2WSstethlearnMore"
      buttonText="Learn More"
      onClickButton={linkClickHandler}
      text={
        <>
          Enjoy <b>lower gas</b> fees and <b>DeFi opportunities</b> using wstETH
          across Arbitrum, Optimism, Base, zkSync, Mantle and Linea.
        </>
      }
    />
  );
};
