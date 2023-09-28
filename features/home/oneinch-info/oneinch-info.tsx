import { FC } from 'react';
import { Button } from '@lidofinance/lido-ui';
import { trackEvent } from '@lidofinance/analytics-matomo';

import { dynamics, MATOMO_CLICK_EVENTS } from 'config';
import { useLidoSWR } from 'shared/hooks';
import { L2Banner } from 'shared/l2-banner';
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

export const OneinchInfo: FC = () => {
  const apiOneInchRatePath = '/api/oneinch-rate';
  const { data, initialLoading } = useLidoSWR<{ rate: number }>(
    dynamics.ipfsMode
      ? `${dynamics.ipfsWidgetEthApiBasePath}/${apiOneInchRatePath}`
      : prependBasePath(apiOneInchRatePath),
  );
  const rate = (data && data.rate) || 1;
  const discount = (100 - (1 / rate) * 100).toFixed(2);

  const linkProps = use1inchLinkProps();

  // for fix flashing banner
  if (initialLoading) return null;

  if (!rate || rate < ONE_INCH_RATE_LIMIT)
    return <L2Banner matomoEvent={MATOMO_CLICK_EVENTS.l2BannerStake} />;

  const linkClickHandler = () =>
    trackEvent(...MATOMO_CLICK_EVENTS.oneInchDiscount);

  return (
    <Wrap>
      <OneInchIconWrap>
        <OneInchIcon />
      </OneInchIconWrap>
      <TextWrap>
        Get a <b>{discount}% discount</b> by buying stETH&nbsp;on the 1inch
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
