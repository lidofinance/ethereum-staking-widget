import type { WhaleBannerConfig } from './types';
import { Wrap, Text, CtaGroup, CtaLink } from './styles';

type WhaleBannerProps = {
  config: WhaleBannerConfig;
};

export const WhaleBanner = ({ config }: WhaleBannerProps) => {
  return (
    <Wrap>
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
