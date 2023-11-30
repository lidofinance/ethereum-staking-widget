import { FC } from 'react';

import { Button } from '@lidofinance/lido-ui';
import { trackEvent } from '@lidofinance/analytics-matomo';

import { dynamics, MATOMO_CLICK_EVENTS } from 'config';
import { useLidoSWR } from 'shared/hooks';
import { L2OneInch } from 'shared/banners/l2-oneinch';
import { STRATEGY_LAZY } from 'utils/swrStrategies';
import { prependBasePath } from 'utils';

import {
  Wrap,
  OneInchIconWrap,
  OneInchIcon,
  TextWrap,
  ButtonWrap,
  ButtonLinkWrap,
} from './styles';
import { use1inchLinkProps } from '../hooks';

const ONE_INCH_RATE_LIMIT = 1.004;

export const OneInchInfo: FC = () => {
  const linkProps = use1inchLinkProps();

  const apiOneInchRatePath = 'api/oneinch-rate?token=eth';
  const { data, initialLoading } = useLidoSWR<{ rate: number }>(
    dynamics.ipfsMode
      ? `${dynamics.widgetApiBasePathForIpfs}/${apiOneInchRatePath}`
      : prependBasePath(apiOneInchRatePath),
    STRATEGY_LAZY,
  );

  if (initialLoading) return null;

  const rate = (data && data.rate) || 1;

  const showL2 = !rate || rate > ONE_INCH_RATE_LIMIT;

  if (showL2)
    return <L2OneInch matomoEvent={MATOMO_CLICK_EVENTS.l2BannerStake} />;

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
