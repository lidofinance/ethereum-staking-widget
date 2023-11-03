import { FC } from 'react';

import { Button } from '@lidofinance/lido-ui';
import { trackEvent } from '@lidofinance/analytics-matomo';

import { MATOMO_CLICK_EVENTS } from 'config';
import { useLidoSWR } from 'shared/hooks';
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

const ONE_INCH_RATE_LIMIT = 1.004;

export const OneInchInfo: FC = () => {
  const linkProps = use1inchLinkProps();

  const { data, initialLoading } = useLidoSWR<{ rate: number }>(
    '/api/oneinch-rate',
  );

  // for fix flashing banner
  if (initialLoading) return null;

  const rate = (data && data.rate) || 1;

  const showL2 = !rate || rate < ONE_INCH_RATE_LIMIT;
  if (showL2)
    return <L2Banner matomoEvent={MATOMO_CLICK_EVENTS.l2BannerStake} />;

  const discountText = (100 - (1 / (rate || 1)) * 100).toFixed(2);

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
