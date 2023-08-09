import { FC } from 'react';
import { Button, InlineLoader } from '@lidofinance/lido-ui';
import { trackEvent } from '@lidofinance/analytics-matomo';
import { MATOMO_CLICK_EVENTS, DATA_UNAVAILABLE } from 'config';
import { Banner } from 'shared/components';

import { useBalancer } from './useBalancer';
import { BalancerIcon, ButtonLinkWrap } from './styles';

const BALANCER_LINK =
  'https://app.balancer.fi/#/pool/0x32296969ef14eb0c6d29669c550d4a0449130230000200000000000000000080';

const linkClickHandler = () =>
  trackEvent(...MATOMO_CLICK_EVENTS.clickBalancerPool);

export const Balancer: FC = () => {
  const linkProps = {
    href: BALANCER_LINK,
    target: '_blank',
    rel: 'noopener noreferrer',
  };

  const { data, initialLoading } = useBalancer();

  const apr = data?.data.totalApr.toFixed(2) ?? DATA_UNAVAILABLE;
  const value = initialLoading ? <InlineLoader /> : apr;

  return (
    <Banner
      background="balancer"
      icon={<BalancerIcon />}
      button={
        <ButtonLinkWrap {...linkProps} onClick={linkClickHandler}>
          <Button fullwidth size="xs" variant="text" color="secondary">
            Explore
          </Button>
        </ButtonLinkWrap>
      }
    >
      <b>{value}% APR</b>
      <br /> wstETH + WETH
    </Banner>
  );
};
