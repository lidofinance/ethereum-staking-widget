import { useCallback } from 'react';
import { trackEvent } from '@lidofinance/analytics-matomo';
import { MATOMO_CLICK_EVENTS } from 'config';

import { L2Banner, L2_DISCOVERY_LINK } from '../l2-banner';

type L2LowFeeProps = {
  token: 'stETH' | 'wstETH';
};

export const L2LowFee: React.FC<L2LowFeeProps> = ({ token }) => {
  const isStETH = token === 'stETH';

  const linkClickHandler = useCallback(() => {
    const event = isStETH
      ? MATOMO_CLICK_EVENTS.l2LowFeeStake
      : MATOMO_CLICK_EVENTS.l2LowFeeWrap;
    trackEvent(...event);
  }, [isStETH]);

  const text = isStETH
    ? 'Learn about Lido on L2 opportunities on Arbitrum, Optimism, Base, zkSync, Mantle and Linea to enjoy reduced gas fees in DeFi'
    : 'Bridge wstETH to Arbitrum, Optimism, Base, zkSync, Mantle and Linea to enjoy low gas fees and enhanced opportunities in DeFi';

  return (
    <L2Banner
      title="Unlock Low-Fee transactions on L2"
      text={text}
      buttonText="Learn more"
      buttonHref={L2_DISCOVERY_LINK}
      testidWrap="l2LowFeeBanner"
      testidButton="l2LowFee"
      onClickButton={linkClickHandler}
    />
  );
};
