import { FC } from 'react';
import { Button, InlineLoader } from '@lidofinance/lido-ui';
import { trackEvent } from '@lidofinance/analytics-matomo';

import { DATA_UNAVAILABLE } from 'consts/text';
import { MATOMO_CLICK_EVENTS } from 'consts/matomo-click-events';
import { Banner } from 'shared/components';

import { useCurve } from './useCurve';
import { CurveIcon, CurveIconWrapper, ButtonLinkWrap } from './styles';

const CURVE_LINK = 'https://curve.fi/#/ethereum/pools/steth/deposit';

const linkClickHandler = () =>
  trackEvent(...MATOMO_CLICK_EVENTS.clickCurvePool);

export const Curve: FC = () => {
  const linkProps = {
    href: CURVE_LINK,
    target: '_blank',
    rel: 'noopener noreferrer',
  };

  const { data, initialLoading } = useCurve();

  const apr = data?.data.totalApr.toFixed(2) ?? DATA_UNAVAILABLE;
  const value = initialLoading ? <InlineLoader /> : apr;

  return (
    <Banner
      background="curve"
      icon={
        <CurveIconWrapper>
          <CurveIcon />
        </CurveIconWrapper>
      }
      button={
        <ButtonLinkWrap {...linkProps} onClick={linkClickHandler}>
          <Button fullwidth size="xs" variant="text" color="secondary">
            Explore
          </Button>
        </ButtonLinkWrap>
      }
    >
      <b>{value}% APR</b>
      <br />
      ETH + stETH
    </Banner>
  );
};
