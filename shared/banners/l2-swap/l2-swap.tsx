import { FC } from 'react';
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

const CURVE_LINK = 'https://kyberswap.com/swap/ethereum/eth-to-wsteth';

const linkClickHandler = () => trackEvent(...MATOMO_CLICK_EVENTS.l2swap);

export const L2Swap: FC = () => {
  const linkProps = {
    href: CURVE_LINK,
    target: '_blank',
    rel: 'noopener noreferrer',
  };

  return (
    <Wrapper data-testid="l2SwapBanner">
      <ThemeProvider theme={themeDark}>
        <ContentWrap>
          <TextWrap>
            <TextHeader>Swap ETH to wstETH on L2</TextHeader>
            Swap ETH to wstETH directly on L2 and use wstETH in DeFi enjoying
            low gas fees opportunities
          </TextWrap>
          <ButtonWrap>
            <ButtonLinkWrap {...linkProps} onClick={linkClickHandler}>
              <ButtonStyle data-testid="l2Swap" size="sm" color="secondary">
                Swap
              </ButtonStyle>
            </ButtonLinkWrap>
          </ButtonWrap>
        </ContentWrap>
        <L2Icons />
      </ThemeProvider>
    </Wrapper>
  );
};
