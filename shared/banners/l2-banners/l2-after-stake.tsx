import { trackEvent } from '@lidofinance/analytics-matomo';
import { MATOMO_CLICK_EVENTS } from 'config';
import { L2Banner, L2_DISCOVERY_LINK } from '../l2-banner';

const linkClickHandler = () => trackEvent(...MATOMO_CLICK_EVENTS.l2LowFeeStake);

export const L2AfterStake: React.FC = () => {
  return (
    <L2Banner
      title="Unlock Low-Fee transactions on L2"
      text={
        <>
          Learn about <b>Lido on L2</b> and enjoy various opportunities in DeFi
        </>
      }
      buttonText="Learn more"
      buttonHref={L2_DISCOVERY_LINK}
      testId="l2LowFeeBanner"
      testidButton="l2LowFee"
      onClickButton={linkClickHandler}
    />
  );
};
