import { trackEvent } from '@lidofinance/analytics-matomo';
import { Curve, Balancer } from 'shared/banners';
import { MATOMO_CLICK_EVENTS } from 'config';

import {
  Wrapper,
  TextStyles,
  DescStyles,
  ButtonLinkWrap,
  ButtonStyled,
} from './styles';

const ECOSYSTEM_LINK = 'https://lido.fi/lido-ecosystem';

export const ModalPoolBanners = () => {
  const linkProps = {
    href: ECOSYSTEM_LINK,
    target: '_blank',
    rel: 'noopener noreferrer',
  };

  const linkClickHandler = () =>
    trackEvent(...MATOMO_CLICK_EVENTS.clickExploreDeFi);

  return (
    <Wrapper>
      <TextStyles>
        <b>Explore DeFi</b>
        <DescStyles>
          Use your stETH/wstETH to get even bigger rewards
        </DescStyles>
      </TextStyles>
      <Curve />
      <Balancer />
      <ButtonLinkWrap {...linkProps} onClick={linkClickHandler}>
        <ButtonStyled fullwidth color="success">
          Explore more DeFi options
        </ButtonStyled>
      </ButtonLinkWrap>
    </Wrapper>
  );
};
