import { FC } from 'react';
import { Button } from '@lidofinance/lido-ui';
import { MATOMO_EVENTS } from 'config';
import { trackEvent } from 'utils';

import {
  Wrapper,
  CurveIcon,
  CurveIconWrapper,
  ButtonLinkWrap,
  ButtonWrap,
  TextWrap,
} from './styles';

const CURVE_LINK = 'https://curve.fi/steth';

export const Curve: FC = () => {
  const linkProps = {
    href: CURVE_LINK,
    target: '_blank',
    rel: 'noopener noreferrer',
  };

  const linkClickHandler = () => trackEvent(...MATOMO_EVENTS.clickCurvePool);

  return (
    <Wrapper>
      <CurveIconWrapper>
        <CurveIcon />
      </CurveIconWrapper>
      <TextWrap>
        <b>3.36% APY</b>
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
