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

const linkClickHandler = () => trackEvent(...MATOMO_CLICK_EVENTS.l2BannerWrap);

export const L2Wsteth = () => {
  return (
    <Banner data-testid="L2wstETHbanner">
      <TextContent>
        Enjoy <b>lower gas</b> fees and <b>DeFi opportunities</b> using wstETH
        across Arbitrum, Optimism, Base and zkSync.
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
