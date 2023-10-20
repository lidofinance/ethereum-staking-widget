import { FC } from 'react';

import { Button } from '@lidofinance/lido-ui';
import { trackEvent } from '@lidofinance/analytics-matomo';

import { MATOMO_CLICK_EVENTS } from 'config';
import { ONE_INCH_RATE_LIMIT } from 'config/one-inch';
import { L2Banner } from 'shared/l2-banner';

import { use1inchLinkProps } from '../hooks';

import {
  Wrap,
  OneInchIconWrap,
  OneInchIcon,
  TextWrap,
  ButtonWrap,
  ButtonLinkWrap,
} from './styles';
import { useOneInchRate } from './hooks';

export const OneInchInfo: FC = () => {
  const linkProps = use1inchLinkProps();
  const { rate, swr } = useOneInchRate();

  // for fix flashing banner
  if (swr.initialLoading) return null;

  const showL2 = !rate || rate < ONE_INCH_RATE_LIMIT;

  const discountText = (100 - (1 / (rate || 1)) * 100).toFixed(2);

  if (showL2)
    return <L2Banner matomoEvent={MATOMO_CLICK_EVENTS.l2BannerStake} />;

  const linkClickHandler = () =>
    trackEvent(...MATOMO_CLICK_EVENTS.oneInchDiscount);

  return (
    <Wrap>
      <OneInchIconWrap>
        <OneInchIcon />
      </OneInchIconWrap>
      <TextWrap>
        Get a <b>{discountText}% discount</b> by buying stETH&nbsp;on the 1inch
        platform
      </TextWrap>
      <ButtonWrap>
        <ButtonLinkWrap {...linkProps} onClick={linkClickHandler}>
          <Button fullwidth size="xs">
            Get discount
          </Button>
        </ButtonLinkWrap>
      </ButtonWrap>
    </Wrap>
  );
};
