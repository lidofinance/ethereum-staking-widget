import { FC } from 'react';
import { useLidoSWR } from 'shared/hooks';
import { Button } from '@lidofinance/lido-ui';
import { L2Banner } from 'shared/l2-banner';

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
  const { data, initialLoading } = useLidoSWR<{ rate: number }>(
    '/api/oneinch-rate',
  );
  const rate = (data && data.rate) || 1;
  const discount = (100 - (1 / rate) * 100).toFixed(2);

  const linkProps = use1inchLinkProps();

  // for fix flashing banner
  if (initialLoading) return null;

  if (!rate || rate < ONE_INCH_RATE_LIMIT) return <L2Banner />;

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
        <ButtonLinkWrap {...linkProps}>
          <Button fullwidth size="xs">
            Get discount
          </Button>
        </ButtonLinkWrap>
      </ButtonWrap>
    </Wrap>
  );
};
