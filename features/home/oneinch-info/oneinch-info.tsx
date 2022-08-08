import { FC } from 'react';
import { useLidoSWR } from 'shared/hooks';
import { Button } from '@lidofinance/lido-ui';
import {
  Wrap,
  OneInchIconWrap,
  OneInchIcon,
  TextWrap,
  ButtonWrap,
  ButtonLinkWrap,
} from './styles';
import { use1inchLinkProps } from '../hooks';

export const OneinchInfo: FC = () => {
  const { data } = useLidoSWR<{ rate: number }>('/api/oneinch-rate');
  const rate = (data && data.rate) || 1;
  const discount = (100 - (1 / rate) * 100).toFixed(2);

  const linkProps = use1inchLinkProps();

  if (!rate || rate < 1.0001) return null;

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
