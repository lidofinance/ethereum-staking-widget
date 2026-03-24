import { FC, PropsWithChildren } from 'react';
import { Close } from '@lidofinance/lido-ui';

import {
  trackAmountBannerCtaClick,
  type AmountBannerPlacement,
} from './matomo';
import { useAmountBannerOnConnectVisibility } from './use-amount-banner-on-connect-visibility';

import {
  Wrapper,
  HeaderStyled,
  DescriptionStyled,
  CtaGroup,
  CtaLink,
  CloseButton,
} from './styles';

type AmountBannerProps = {
  isModal?: boolean;
  marginTop?: number;
  isDismissible?: boolean;
  initialBalance?: bigint;
  placement: AmountBannerPlacement;
};

export const AmountBanner: FC<PropsWithChildren<AmountBannerProps>> = ({
  isModal,
  marginTop,
  children,
  isDismissible = false,
  initialBalance,
  placement,
}) => {
  const { shouldShow, bannerConfig, dismiss } =
    useAmountBannerOnConnectVisibility({ initialBalance });

  if (!shouldShow || !bannerConfig) return children;

  return (
    <Wrapper $isModal={isModal} $marginTop={marginTop}>
      {isDismissible && (
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
            onClick={() =>
              trackAmountBannerCtaClick(
                cta.text,
                bannerConfig.variant,
                placement,
              )
            }
          >
            {cta.text}
          </CtaLink>
        ))}
      </CtaGroup>
    </Wrapper>
  );
};
