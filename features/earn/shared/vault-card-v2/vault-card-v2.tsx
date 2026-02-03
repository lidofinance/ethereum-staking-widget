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
import { LocalLink } from 'shared/components/local-link';
import { EARN_PATH } from 'consts/urls';
import { EARN_VAULT_DEPOSIT_SLUG } from 'features/earn/consts';
import { InlineLoader } from '../inline-loader';
import { FormatPercent } from 'shared/formatters/format-percent';
import { VaultTip } from '../vault-tip';
import { FormatLargeAmount } from 'shared/formatters/format-large-amount';
import { FormatToken } from 'shared/formatters/format-token';

type VaultStats = {
  tvl?: number | null;
  apx?: number | null;
  apxLabel: 'APY' | 'APR';
  isLoading?: boolean;
  apxHint?: React.ReactNode;
  compact?: boolean;
};

type VaultPosition = {
  balance?: bigint;
  claimable?: bigint;
  pending?: Array<{ tokenSymbol: string; amount: bigint }>;
  isLoading?: boolean;
  symbol: string;
};

type VaultCardProps = {
  title: string;
  description?: string;
  urlSlug: string;
  stats: VaultStats;
  ctaLabel: string;
  position?: VaultPosition;
  variant?: 'eth' | 'usd' | 'default';
  illustration?: React.ReactNode;
  depositLinkCallback?: () => void;
};

export const VaultCard: React.FC<VaultCardProps> = ({
  title,
  description,
  urlSlug,
  stats,
  position,
  ctaLabel,
  variant = 'default',
  illustration,
  depositLinkCallback,
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
        <StatItem data-testid="apx-value">
          <StatLabel>
            {stats.apxLabel}
            {!stats.isLoading && (
              <VaultTip placement="bottom">{stats.apxHint}</VaultTip>
            )}
          </StatLabel>
          <StatValue $accent>
            <InlineLoader isLoading={stats.isLoading} width={70}>
              <FormatPercent value={stats.apx} decimals="percent" />*
            </InlineLoader>
          </StatValue>
        </StatItem>
        <StatItem data-testid="tvl-value">
          <StatLabel>TVL</StatLabel>
          <StatValue>
            <InlineLoader isLoading={stats.isLoading} width={70}>
              <FormatLargeAmount amount={stats.tvl} />
            </InlineLoader>
          </StatValue>
        </StatItem>
        {position && (
          <StatItem>
            <StatLabel>My position</StatLabel>
            <StatValue>
              <InlineLoader width={32} isLoading={position.isLoading}>
                <FormatToken
                  trimEllipsis
                  symbol={position.symbol}
                  amount={position.balance}
                  fallback="—"
                  data-testid={`${position.symbol}-position-amount`}
                />
              </InlineLoader>
            </StatValue>
          </StatItem>
        )}
      </CardStats>
      <CardCta>
        <LocalLink
          href={`${EARN_PATH}/${urlSlug}/${EARN_VAULT_DEPOSIT_SLUG}`}
          onClick={depositLinkCallback}
        >
          <Button fullwidth variant="translucent">
            {ctaLabel}
          </Button>
        </LocalLink>
      </CardCta>
    </CardWrapper>
  );
};
