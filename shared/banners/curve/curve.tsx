import { FC } from 'react';
import { Button, InlineLoader } from '@lidofinance/lido-ui';
import { trackEvent } from '@lidofinance/analytics-matomo';
import { MATOMO_CLICK_EVENTS, DATA_UNAVAILABLE } from 'config';

import { useCurve } from './useCurve';
import {
  Wrapper,
  CurveIcon,
  CurveIconWrapper,
  ButtonLinkWrap,
  ButtonWrap,
  TextWrap,
} from './styles';

const CURVE_LINK = 'https://curve.fi/#/ethereum/pools/steth/deposit';

export const Curve: FC = () => {
  const linkProps = {
    href: CURVE_LINK,
    target: '_blank',
    rel: 'noopener noreferrer',
  };

  const { data, initialLoading } = useCurve();

  const linkClickHandler = () =>
    trackEvent(...MATOMO_CLICK_EVENTS.clickCurvePool);

  const apr = data?.data.totalApr.toFixed(2) ?? DATA_UNAVAILABLE;
  const value = initialLoading ? <InlineLoader /> : apr;

  return (
    <Wrapper>
      <CurveIconWrapper>
        <CurveIcon />
      </CurveIconWrapper>
      <TextWrap>
        <b>{value}% APR</b>
        <br />
        ETH + stETH
      </TextWrap>
      <ButtonWrap>
        <ButtonLinkWrap {...linkProps} onClick={linkClickHandler}>
          <Button fullwidth size="xs" variant="text" color="secondary">
            Explore
          </Button>
        </ButtonLinkWrap>
      </ButtonWrap>
    </Wrapper>
  );
};
