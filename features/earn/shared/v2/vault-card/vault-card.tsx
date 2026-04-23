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
  StatValueIcon,
  StyledTooltip,
  BadgeStyled,
  TitleTextStyled,
  VaultWarning,
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
  compact?: boolean;
};

type VaultPosition = {
  balance?: bigint;
  claimable?: bigint;
  pending?: Array<{ tokenSymbol: string; amount: bigint }>;
  isLoading?: boolean;
  symbol: string;
  icon?: React.ReactNode;
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
  protectedBadgeTooltipText?: React.ReactNode;
  warning?: React.ReactNode;
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
  protectedBadgeTooltipText,
  warning,
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
            <TitleTextStyled data-testid={'vaultTitle'}>
              {title}
            </TitleTextStyled>
            {protectedBadgeTooltipText && (
              <BadgeStyled data-testid={'protectedBadge'}>
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
                <CardTitleBadge
                  variant="gradient"
                  icon={<ChevronsUpIcon />}
                  data-testid={'upgradingBadge'}
                >
                  {' '}
                  Upgrading
                </CardTitleBadge>
              </StyledTooltip>
            )}
          </CardTitle>
          <CardDescription data-testid={'vaultDescription'}>
            {description}
          </CardDescription>
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
        {!!position?.balance && (
          <StatItem>
            <StatLabel>My position</StatLabel>
            <StatValue>
              <InlineLoader width={32} isLoading={position.isLoading}>
                <FormatToken
                  trimEllipsis
                  symbol={position.symbol}
                  decimals={getTokenDecimals(position.symbol)}
                  amount={position.balance}
                  fallback="—"
                  data-testid={`${position.symbol}-position-amount`}
                />
                {position.icon && (
                  <StatValueIcon>{position.icon}</StatValueIcon>
                )}
              </InlineLoader>
            </StatValue>
          </StatItem>
        )}
      </CardStats>
      {warning && <VaultWarning>{warning}</VaultWarning>}
      <CardCta data-testid={'vaultButton'}>
        <LocalLink href={depositHref} onClick={depositLinkCallback}>
          <Button fullwidth variant="translucent">
            {ctaLabel}
          </Button>
        </LocalLink>
      </CardCta>
    </CardWrapper>
  );
};
