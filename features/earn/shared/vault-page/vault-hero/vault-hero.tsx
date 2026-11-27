import type { ReactNode } from 'react';

import { ProtectedBadge } from '../../protected-badge';
import type { VaultVisualVariant } from '../../vault-visual';
import type { VaultApx, VaultTvl } from '../types';
import { ICON_SIZE, ICON_SIZE_MOBILE } from './consts';
import { HeroStats } from './hero-stats';
import {
  HeroBody,
  HeroCard,
  HeroContent,
  HeroDescription,
  HeroHeader,
  HeroTitle,
  HeroTitleRow,
  HeroVisual,
} from './styles';

type VaultHeroProps = {
  title: string;
  description: string;
  variant: VaultVisualVariant;
  illustration: ReactNode;
  protectedBadgeTooltip?: ReactNode;
  apx: VaultApx;
  tvl: VaultTvl;
};

export const VaultHero = ({
  title,
  description,
  variant,
  illustration,
  protectedBadgeTooltip,
  apx,
  tvl,
}: VaultHeroProps) => (
  <HeroCard padding={0} gap={0} clip data-testid="vault-hero">
    <HeroBody>
      <HeroContent>
        <HeroHeader>
          <HeroTitleRow>
            <HeroTitle data-testid="vault-title">{title}</HeroTitle>
            {protectedBadgeTooltip && (
              <ProtectedBadge tooltip={protectedBadgeTooltip} />
            )}
          </HeroTitleRow>
          <HeroDescription data-testid="vault-description">
            {description}
          </HeroDescription>
        </HeroHeader>

        <HeroStats apx={apx} tvl={tvl} />
      </HeroContent>

      <HeroVisual
        variant={variant}
        iconSize={ICON_SIZE}
        iconSizeMobile={ICON_SIZE_MOBILE}
      >
        {illustration}
      </HeroVisual>
    </HeroBody>
  </HeroCard>
);
