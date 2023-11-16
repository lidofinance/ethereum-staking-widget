import { FC } from 'react';
import { trackEvent, MatomoEventType } from '@lidofinance/analytics-matomo';

import {
  Wrapper,
  L2Icons,
  TextWrap,
  ButtonWrap,
  ButtonLinkWrap,
  ButtonStyle,
} from './styles';

const L2_LINK =
  'https://help.lido.fi/en/collections/3641672-lido-on-layer-2-l2';

type L2BannerProps = {
  matomoEvent: MatomoEventType;
};

export const L2OneInch: FC<L2BannerProps> = ({ matomoEvent }) => {
  const linkProps = {
    href: L2_LINK,
    target: '_blank',
    rel: 'noopener noreferrer',
  };

  const linkClickHandler = () => trackEvent(...matomoEvent);

  return (
    <Wrapper data-testid="l2Banner">
      <L2Icons />
      <TextWrap>
        Get your wstETH on Arbitrum, Optimism and Polygon for
        <b> lower gas fees</b> and enjoy
        <b> L2 DeFi opportunities</b>
      </TextWrap>
      <ButtonWrap>
        <ButtonLinkWrap {...linkProps} onClick={linkClickHandler}>
          <ButtonStyle data-testid="l2LearnMore" fullwidth size="xs">
            Learn more
          </ButtonStyle>
        </ButtonLinkWrap>
      </ButtonWrap>
    </Wrapper>
  );
};
