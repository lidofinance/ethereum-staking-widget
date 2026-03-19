import { Close } from '@lidofinance/lido-ui';
import type { WhaleBannerConfig } from './types';
import { Wrap, Text, CtaGroup, CtaLink, CloseButton } from './styles';

type WhaleBannerProps = {
  config: WhaleBannerConfig;
  onDismiss?: () => void;
  withArrow?: boolean;
};

export const WhaleBanner = ({ config, onDismiss, withArrow }: WhaleBannerProps) => {
  return (
    <Wrap $withArrow={withArrow}>
      {onDismiss && (
        <CloseButton onClick={onDismiss} aria-label="Dismiss">
          <Close />
        </CloseButton>
      )}
      <Text weight={700} size="xs">
        {config.heading}
      </Text>
      <Text weight={400} size="xxs">
        {config.body}
      </Text>
      <CtaGroup>
        {config.ctas.map((cta) => (
          <CtaLink
            key={cta.href}
            href={cta.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {cta.text}
          </CtaLink>
        ))}
      </CtaGroup>
    </Wrap>
  );
};
