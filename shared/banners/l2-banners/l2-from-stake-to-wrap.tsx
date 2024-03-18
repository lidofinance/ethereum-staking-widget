import { L2Banner } from '../l2-banner';
import { MATOMO_CLICK_EVENTS } from 'config';
import { trackEvent } from '@lidofinance/analytics-matomo';
import * as URLS from 'config/urls';

const linkClickHandler = () => trackEvent(...MATOMO_CLICK_EVENTS.l2BannerStake);

export const L2FromStakeToWrap = () => {
  return (
    <L2Banner
      testId="L2Banner"
      buttonText="Go to Wrap"
      buttonHref={URLS.WRAP_PATH}
      isLocalLink
      onClickButton={linkClickHandler}
      title="Planning to use wstETH on L2?"
      text="Wrap ETH directly to wstETH in one transaction"
    />
  );
};
