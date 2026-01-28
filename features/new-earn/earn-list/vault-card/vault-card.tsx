import React from 'react';
import { Button } from '@lidofinance/lido-ui';

import {
  CardWrapper,
  CardHeader,
  CardHeaderContent,
  CardTitle,
  CardDescription,
  CardStats,
  StatItem,
  StatLabel,
  StatValue,
  CardDivider,
  CardCta,
  VaultIconWrapper,
} from './styles';

export type VaultCardStat = {
  label: string;
  value: string;
  accent?: boolean;
  muted?: boolean;
  labelIcon?: React.ReactNode;
  // TODO: replace with formatted values from API
};

type VaultCardProps = {
  title: string;
  description: string;
  stats: VaultCardStat[];
  ctaLabel: string;
  variant: 'eth' | 'usd';
  illustration?: React.ReactNode;
};

export const VaultCard: React.FC<VaultCardProps> = ({
  title,
  description,
  stats,
  ctaLabel,
  variant,
  illustration,
}) => {
  return (
    <CardWrapper $variant={variant}>
      <CardHeader>
        <CardHeaderContent>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeaderContent>
        <VaultIconWrapper>{illustration}</VaultIconWrapper>
      </CardHeader>
      <CardDivider />
      <CardStats>
        {stats.map((stat) => (
          <StatItem key={stat.label}>
            <StatLabel>
              {stat.label}
              {stat.labelIcon}
            </StatLabel>
            <StatValue $accent={stat.accent} $muted={stat.muted}>
              {stat.value}
            </StatValue>
          </StatItem>
        ))}
      </CardStats>
      <CardCta>
        <Button fullwidth variant="translucent">
          {ctaLabel}
        </Button>
      </CardCta>
    </CardWrapper>
  );
};
