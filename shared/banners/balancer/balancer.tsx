import { FC } from 'react';
import { Button } from '@lidofinance/lido-ui';
import { MATOMO_EVENTS } from 'config';
import { trackEvent } from 'utils';

import {
  Wrapper,
  BalancerIcon,
  ButtonLinkWrap,
  ButtonWrap,
  TextWrap,
} from './styles';

const BALANCER_LINK =
  'https://app.balancer.fi/#/pool/0x32296969ef14eb0c6d29669c550d4a0449130230000200000000000000000080';

export const Balancer: FC = () => {
  const linkProps = {
    href: BALANCER_LINK,
    target: '_blank',
    rel: 'noopener noreferrer',
  };

  const linkClickHandler = () => trackEvent(...MATOMO_EVENTS.clickBalancerPool);

  return (
    <Wrapper>
      <BalancerIcon />
      <TextWrap>
        <b>% APY</b> <br /> wstETH + WETH
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
