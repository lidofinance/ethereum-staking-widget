import { FC, PropsWithChildren } from 'react';
import { Close } from '@lidofinance/lido-ui';
import {
  Wrapper,
  HeaderStyled,
  DescriptionStyled,
  CtaGroup,
  CtaLink,
  CloseButton,
} from './styles';
import { useAmountBannerOnConnectVisibility } from './use-amount-banner-on-connect-visibility';

type AmountBannerProps = {
  isModal?: boolean;
  marginTop?: number;
};

export const AmountBanner: FC<PropsWithChildren<AmountBannerProps>> = ({
  isModal,
  marginTop,
  children,
}) => {
  const { shouldShow, bannerConfig, dismiss } =
    useAmountBannerOnConnectVisibility();

  if (!shouldShow || !bannerConfig) return children;

  return (
    <Wrapper $isModal={isModal} $marginTop={marginTop}>
      {dismiss && (
        <CloseButton onClick={dismiss} aria-label="Dismiss">
          <Close width={20} height={20} />
        </CloseButton>
      )}
      <HeaderStyled>{bannerConfig.heading}</HeaderStyled>
      <DescriptionStyled>{bannerConfig.body}</DescriptionStyled>
      <CtaGroup $isModal={isModal}>
        {bannerConfig.ctas.map((cta) => (
          <CtaLink
            key={cta.href}
            href={cta.href}
            target="_blank"
            rel="noopener noreferrer"
            $isModal={isModal}
          >
            {cta.text}
          </CtaLink>
        ))}
      </CtaGroup>
    </Wrapper>
  );
};
