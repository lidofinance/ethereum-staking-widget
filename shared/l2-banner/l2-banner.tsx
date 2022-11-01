import { FC } from 'react';
import { trackEvent, MatomoEvent } from 'utils';

import {
  Wrapper,
  L2Icons,
  TextWrap,
  ButtonWrap,
  ButtonLinkWrap,
  ButtonStyle,
} from './styles';

const L2_LINK = 'https://help.lido.fi/en/collections/3641672-lido-on-l2';

type L2BannerProps = {
  matomoEvent: MatomoEvent;
};

export const L2Banner: FC<L2BannerProps> = ({ matomoEvent }) => {
  const linkProps = {
    href: L2_LINK,
    target: '_blank',
    rel: 'noopener noreferrer',
  };

  const linkClickHandler = () => trackEvent(...matomoEvent);

  return (
    <>
      <Wrapper>
        <L2Icons />
        <TextWrap>
          Get your wstETH on Arbitrum and Optimism for
          <b> lower gas fees</b> and exciting
          <b> L2 DeFi opportunities</b>
        </TextWrap>
        <ButtonWrap>
          <ButtonLinkWrap {...linkProps} onClick={linkClickHandler}>
            <ButtonStyle fullwidth size="xs">
              Learn more
            </ButtonStyle>
          </ButtonLinkWrap>
        </ButtonWrap>
      </Wrapper>
    </>
  );
};
