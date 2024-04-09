import { trackEvent } from '@lidofinance/analytics-matomo';
import { Curve } from 'shared/banners/curve';
import { MATOMO_CLICK_EVENTS } from 'consts/matomo-click-events';

import { TextStyles, DescStyles, ButtonLinkWrap, ButtonStyled } from './styles';

const ECOSYSTEM_LINK = 'https://lido.fi/lido-ecosystem';

const linkClickHandler = () =>
  trackEvent(...MATOMO_CLICK_EVENTS.clickExploreDeFi);

export const ModalPoolBanners = () => {
  const linkProps = {
    href: ECOSYSTEM_LINK,
    target: '_blank',
    rel: 'noopener noreferrer',
  };

  return (
    <>
      <TextStyles>
        <b>Explore DeFi</b>
        <DescStyles>
          Use your stETH/wstETH to get even bigger rewards
        </DescStyles>
      </TextStyles>
      <Curve />
      <ButtonLinkWrap {...linkProps} onClick={linkClickHandler}>
        <ButtonStyled fullwidth color="success">
          Explore more DeFi options
        </ButtonStyled>
      </ButtonLinkWrap>
    </>
  );
};
