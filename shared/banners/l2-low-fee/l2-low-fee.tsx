import { FC, useCallback } from 'react';
import { ThemeProvider, themeDark } from '@lidofinance/lido-ui';
import { trackEvent } from '@lidofinance/analytics-matomo';
import { MATOMO_CLICK_EVENTS } from 'config';

import {
  Wrapper,
  L2Icons,
  TextWrap,
  ButtonWrap,
  ButtonLinkWrap,
  ButtonStyle,
  ContentWrap,
  TextHeader,
} from './styles';

const LINK = 'https://lido.fi/lido-on-l2';

type L2LowFeeProps = {
  token: 'stETH' | 'wstETH';
};

export const L2LowFee: FC<L2LowFeeProps> = ({ token }) => {
  const linkProps = {
    href: LINK,
    target: '_blank',
    rel: 'noopener noreferrer',
  };
  const isStETH = token === 'stETH';
  const linkClickHandler = useCallback(() => {
    const event = isStETH
      ? MATOMO_CLICK_EVENTS.l2LowFeeStake
      : MATOMO_CLICK_EVENTS.l2LowFeeWrap;
    trackEvent(...event);
  }, [isStETH]);

  const text = isStETH
    ? 'Learn about Lido on L2 opportunities on Arbitrum, Optimism, and Polygon PoS to enjoy reduced gas fees in DeFi'
    : 'Bridge wstETH to Arbitrum, Optimism and Polygon PoS to enjoy low gas fees and enhanced opportunities in DeFi';

  return (
    <Wrapper data-testid="l2LowFeeBanner">
      <ThemeProvider theme={themeDark}>
        <ContentWrap>
          <TextWrap>
            <TextHeader>Unlock Low-Fee transactions on L2</TextHeader>
            {text}
          </TextWrap>
          <ButtonWrap>
            <ButtonLinkWrap {...linkProps} onClick={linkClickHandler}>
              <ButtonStyle data-testid="l2LowFee" size="sm" color="secondary">
                Learn more
              </ButtonStyle>
            </ButtonLinkWrap>
          </ButtonWrap>
        </ContentWrap>
        <L2Icons />
      </ThemeProvider>
    </Wrapper>
  );
};
