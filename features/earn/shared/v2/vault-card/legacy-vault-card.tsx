import React from 'react';
import { Button } from '@lidofinance/lido-ui';

import {
  CardWrapper,
  CardOverlayLink,
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
  CardTitleBadge,
  ChevronsUpIcon,
  StyledTooltip,
  BadgeStyled,
  TitleTextStyled,
} from './styles';
import { LocalLink } from 'shared/components/local-link';
import { EARN_PATH } from 'consts/urls';
import { EARN_VAULT_DEPOSIT_SLUG } from 'features/earn/consts';
import { FormatPercent } from 'shared/formatters/format-percent';
import { FormatLargeAmount } from 'shared/formatters/format-large-amount';
import { FormatToken } from 'shared/formatters/format-token';
import { Badge } from 'features/earn/shared/badge';
import { getTokenDecimals } from 'utils/token-decimals';
import { useConfig } from 'config/use-config';
import { InlineLoader } from '../../inline-loader';
import { VaultTip } from '../../vault-tip';

type VaultStats = {
  tvl?: number | null;
  apx?: number | null;
  apxLabel: string;
  isLoading?: boolean;
  apxHint?: React.ReactNode;
};

type LegacyVaultPosition = {
  sharesBalance?: bigint;
  sharesSymbol: string;
  isLoading?: boolean;
};

type LegacyVaultCardProps = {
  title: string;
  description?: string;
  urlSlug: string;
  stats: VaultStats;
  ctaLabel: string;
  position?: LegacyVaultPosition;
  variant?: 'eth' | 'usd' | 'default';
  illustration?: React.ReactNode;
  depositLinkCallback?: () => void;
  protectedBadgeTooltipText?: React.ReactNode;
};

export const LegacyVaultCard: React.FC<LegacyVaultCardProps> = ({
  title,
  description,
  urlSlug,
  stats,
  position,
  ctaLabel,
  variant = 'default',
  illustration,
  depositLinkCallback,
  protectedBadgeTooltipText,
}) => {
  const isDeprecated = useConfig().externalConfig.earnVaults.find(
    (vault) => vault.name === urlSlug,
  )?.deprecated;

  const depositHref = `${EARN_PATH}/${urlSlug}/${EARN_VAULT_DEPOSIT_SLUG}`;

  return (
    <CardWrapper $variant={variant} data-testid={`${urlSlug}-vault-card`}>
      <CardOverlayLink
        as={LocalLink}
        href={depositHref}
        onClick={depositLinkCallback}
        data-testid={'open-vault-btn'}
        aria-label={title}
      />
      <CardHeader>
        <CardHeaderContent>
          <CardTitle>
            <TitleTextStyled>{title}</TitleTextStyled>
            {protectedBadgeTooltipText && (
              <BadgeStyled>
                <Badge
                  text="PROTECTED"
                  tooltipText={protectedBadgeTooltipText}
                />
              </BadgeStyled>
            )}
            {isDeprecated && (
              <StyledTooltip
                title="Vault users can upgrade their tokens to the new unified EarnETH vault without withdrawal or downtime in rewards."
                placement="bottom"
              >
                <CardTitleBadge variant="gradient" icon={<ChevronsUpIcon />}>
                  {' '}
                  Upgrading
                </CardTitleBadge>
              </StyledTooltip>
            )}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeaderContent>
        <VaultIconWrapper>{illustration}</VaultIconWrapper>
      </CardHeader>
      <CardDivider />
      <CardStats>
        <StatItem data-testid="apx-value">
          <StatLabel>
            {stats.apxLabel}
            <VaultTip
              placement="bottom"
              style={{ position: 'relative', zIndex: 2 }}
            >
              {stats.apxHint}
            </VaultTip>
          </StatLabel>
          <StatValue $accent>
            <InlineLoader isLoading={stats.isLoading} width={70}>
              <FormatPercent value={stats.apx} decimals="percent" />
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
        {!!position?.sharesBalance && (
          <StatItem>
            <StatLabel>
              My balance
              <VaultTip
                placement="bottom"
                style={{ position: 'relative', zIndex: 2 }}
              >
                You hold{' '}
                <FormatToken
                  trimEllipsis
                  amount={position.sharesBalance}
                  symbol={position.sharesSymbol}
                  decimals={getTokenDecimals(position.sharesSymbol)}
                />
                .{' '}
                {`Shown in ${position.sharesSymbol} at current conversion rates.`}
              </VaultTip>
            </StatLabel>
            <StatValue>
              <InlineLoader width={32} isLoading={position.isLoading}>
                <FormatToken
                  trimEllipsis
                  symbol={position.sharesSymbol}
                  decimals={getTokenDecimals(position.sharesSymbol)}
                  amount={position.sharesBalance}
                  fallback="—"
                />
              </InlineLoader>
            </StatValue>
          </StatItem>
        )}
      </CardStats>
      <CardCta>
        <LocalLink href={depositHref} onClick={depositLinkCallback}>
          <Button fullwidth variant="translucent">
            {ctaLabel}
          </Button>
        </LocalLink>
      </CardCta>
    </CardWrapper>
  );
};
