import { trackEvent } from '@lidofinance/analytics-matomo';
import { MATOMO_CLICK_EVENTS } from 'consts/matomo-click-events';
import { L2Banner } from '../l2-banner';

const linkClickHandler = () => trackEvent(...MATOMO_CLICK_EVENTS.l2LowFeeWrap);

const L2_LEARN_MORE_AFTER_WRAP_LINK =
  'https://lido.fi/lido-ecosystem?networks=arbitrum%2Coptimism%2Cbase%2Czksync+era%2Cmantle%2Clinea%2Cpolygon&criteria=or&tokens=wsteth';

export const L2AfterWrap = () => {
  return (
    <L2Banner
      text={
        <>
          Learn about <b>DeFi opportunities</b> using wstETH across multiple L2
          networks
        </>
      }
      buttonText="Learn more"
      buttonHref={L2_LEARN_MORE_AFTER_WRAP_LINK}
      testId="l2LowFeeBanner"
      testidButton="l2LowFee"
      onClickButton={linkClickHandler}
    />
  );
};
