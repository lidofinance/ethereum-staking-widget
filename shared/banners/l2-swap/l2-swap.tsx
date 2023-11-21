import { trackEvent } from '@lidofinance/analytics-matomo';
import { MATOMO_CLICK_EVENTS } from 'config';

import { L2Banner } from '../l2-banner';

const CURVE_LINK = 'https://kyberswap.com/swap/ethereum/eth-to-wsteth';

const linkClickHandler = () => trackEvent(...MATOMO_CLICK_EVENTS.l2swap);

export const L2Swap = () => {
  return (
    <L2Banner
      title="Swap ETH to wstETH on L2"
      text="Swap ETH to wstETH directly on L2 and use wstETH in DeFi enjoying low gas fees opportunities"
      buttonText="Swap"
      buttonHref={CURVE_LINK}
      testidWrap="l2SwapBanner"
      testidButton="l2Swap"
      onClickButton={linkClickHandler}
    />
  );
};
