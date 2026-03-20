import { Close } from '@lidofinance/lido-ui';
import type { WhaleBannerConfig } from './types';
import {
  Wrapper,
  HeaderStyled,
  DescriptionStyled,
  CtaGroup,
  CtaLink,
  CloseButton,
} from './styles';

type WhaleBannerProps = {
  config: WhaleBannerConfig;
  onDismiss?: () => void;
  isModal?: boolean;
  marginTop?: number;
};

export const WhaleBanner = ({
  config,
  onDismiss,
  isModal,
  marginTop,
}: WhaleBannerProps) => {
  return (
    <Wrapper $isModal={isModal} $marginTop={marginTop}>
      {onDismiss && (
        <CloseButton onClick={onDismiss} aria-label="Dismiss">
          <Close width={20} height={20} />
        </CloseButton>
      )}
      <HeaderStyled>{config.heading}</HeaderStyled>
      <DescriptionStyled>{config.body}</DescriptionStyled>
      <CtaGroup $isModal={isModal}>
        {config.ctas.map((cta) => (
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
