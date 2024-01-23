import { useCallback } from 'react';
import {
  Banner,
  L2Icons,
  LinkButton,
  TextContent,
  OverlayLink,
  FooterWrapper,
} from './styles';
import { L2_DISCOVERY_LINK } from '../l2-banner';
import { MATOMO_CLICK_EVENTS } from 'config';
import { trackEvent } from '@lidofinance/analytics-matomo';

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
    <Banner data-testid="L2wstETHbanner">
      <TextContent>
        Enjoy <b>lower gas</b> fees and <b>DeFi opportunities</b> using wstETH
        across Arbitrum, Optimism, Base, zkSync and Mantle.
      </TextContent>
      <FooterWrapper>
        <L2Icons />
        <OverlayLink
          href={L2_DISCOVERY_LINK}
          onClick={linkClickHandler}
          target="_blank"
          rel="noopener noreferrer"
        >
          <LinkButton data-testid="l2WSstethlearnMore">Learn More</LinkButton>
        </OverlayLink>
      </FooterWrapper>
    </Banner>
  );
};
