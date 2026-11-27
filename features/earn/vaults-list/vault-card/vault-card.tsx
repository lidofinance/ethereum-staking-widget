import type { ReactNode } from 'react';
import {
  Button,
  DataListRow,
  Hidden,
  Skeleton,
  Tooltip,
  Typography,
} from '@lidofinance/lido-app-ui';

import { useDappStatus } from 'modules/web3';
import { LocalLink } from 'shared/components/local-link';
import { EARN_PATH } from 'consts/urls';
import { EARN_VAULT_DEPOSIT_SLUG } from 'features/earn/consts';
import { FormatPercent } from 'shared/formatters/format-percent';
import { FormatLargeAmount } from 'shared/formatters/format-large-amount';
import { FormatToken } from 'shared/formatters/format-token';
import { getTokenDecimals } from 'utils/token-decimals';
import { VaultCardGeoCta } from './vault-card-geo-cta';
import { shouldShowApxUpdateTooltip } from '../../shared/apy-update-tooltip-text';
import { ProtectedBadge } from '../../shared/protected-badge';
import type { VaultVisualVariant } from '../../shared/vault-visual';

import {
  CardRoot,
  CardOverlayLink,
  CardBody,
  CardContent,
  CardHeader,
  CardTitle,
  CardTitleText,
  Interactive,
  CardStats,
  CardStatItem,
  CardDataList,
  StatValueTrigger,
  CardCta,
  CardWarning,
  CardVisual,
  ICON_SIZE,
  ICON_SIZE_MOBILE,
} from './styles';

type VaultStats = {
  tvl?: number | null;
  apx?: number | null;
  apxLabel: string;
  isLoading?: boolean;
  apxHint?: ReactNode;
  apxUpdateTooltipText?: ReactNode;
  isApxStale?: boolean;
};

type VaultPosition = {
  sharesBalance?: bigint;
  sharesSymbol: string;
  baseAmount?: bigint;
  baseSymbol: string;
  isLoading?: boolean;
};

type VaultCardProps = {
  title: string;
  description?: string;
  urlSlug: string;
  stats: VaultStats;
  ctaLabel: string;
  position?: VaultPosition;
  variant?: VaultVisualVariant;
  illustration?: ReactNode;
  depositLinkCallback?: () => void;
  protectedBadgeTooltipText?: ReactNode;
  warning?: ReactNode;
  // swaps the CTA for the geo notice while the region is unchecked or locked
  isGeoGated?: boolean;
};

type StatKey = 'apx' | 'tvl' | 'position';

type StatEntry = {
  key: StatKey;
  label: string;
  info?: ReactNode;
  value: ReactNode;
  // set on the desktop value only; the mobile copy has no test id
  valueTestId?: string;
  isLoading?: boolean;
};

// the same test ids as the previous card
const STAT_TEST_IDS: Record<StatKey, { root: string; value: string }> = {
  apx: { root: 'apx', value: 'apx-value' },
  tvl: { root: 'tvl', value: 'tvl-amount' },
  position: { root: 'position', value: 'position-amount' },
};

export const VaultCard = ({
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
  isGeoGated = false,
}: VaultCardProps) => {
  const { isWalletConnected } = useDappStatus();
  const depositHref = `${EARN_PATH}/${urlSlug}/${EARN_VAULT_DEPOSIT_SLUG}`;

  const apxColor = stats.isApxStale ? 'secondary' : 'success';
  const apxText = <FormatPercent value={stats.apx} decimals="percent" />;
  const apxValue = shouldShowApxUpdateTooltip(stats) ? (
    <Tooltip content={stats.apxUpdateTooltipText} position="top-start">
      <StatValueTrigger tabIndex={0}>{apxText}</StatValueTrigger>
    </Tooltip>
  ) : (
    apxText
  );

  const statEntries: StatEntry[] = [
    {
      key: 'apx',
      label: stats.apxLabel,
      info: stats.apxHint,
      value: apxValue,
      isLoading: stats.isLoading,
    },
    {
      key: 'tvl',
      label: 'TVL',
      value: <FormatLargeAmount amount={stats.tvl} />,
      isLoading: stats.isLoading,
    },
  ];

  if (position && isWalletConnected) {
    statEntries.push({
      key: 'position',
      label: 'My position',
      info: position.sharesBalance ? (
        <>
          You hold{' '}
          <FormatToken
            trimEllipsis
            amount={position.sharesBalance}
            symbol={position.sharesSymbol}
            decimals={getTokenDecimals(position.sharesSymbol)}
          />
          . Shown in {position.baseSymbol} at current conversion rates.
        </>
      ) : undefined,
      value: position.sharesBalance ? (
        <FormatToken
          trimEllipsis
          symbol={position.baseSymbol}
          decimals={getTokenDecimals(position.baseSymbol)}
          amount={position.baseAmount}
          fallback="—"
        />
      ) : (
        '—'
      ),
      valueTestId: `${position.sharesSymbol}-position-amount`,
      isLoading: position.isLoading,
    });
  }

  const cta = (
    <CardCta data-testid="vault-button">
      <Button
        href={depositHref}
        onClick={depositLinkCallback}
        size="big"
        variant="primary"
      >
        {ctaLabel}
      </Button>
    </CardCta>
  );

  return (
    <CardRoot padding={0} gap={0} data-testid={`${urlSlug}-vault-card`}>
      <CardOverlayLink
        as={LocalLink}
        href={depositHref}
        onClick={depositLinkCallback}
        data-testid="open-vault-btn"
        aria-label={title}
      />
      <CardBody>
        <CardContent>
          <CardHeader>
            <CardTitle>
              <CardTitleText data-testid="vaultTitle">{title}</CardTitleText>
              {protectedBadgeTooltipText && (
                <Interactive>
                  <ProtectedBadge tooltip={protectedBadgeTooltipText} />
                </Interactive>
              )}
            </CardTitle>
            <Typography variant="bodyLarge" data-testid="vault-description">
              {description}
            </Typography>
          </CardHeader>

          <Hidden below="sm" as="div">
            <CardStats>
              {statEntries.map(
                ({ key, label, info, value, valueTestId, isLoading }) => (
                  <CardStatItem
                    key={key}
                    align="left"
                    size="small"
                    label={label}
                    info={info}
                    loading={isLoading}
                    dataTestId={STAT_TEST_IDS[key]}
                    value={
                      <Typography
                        as="div"
                        variant="h3"
                        weight={key === 'apx' ? 'bold' : 'medium'}
                        color={key === 'apx' ? apxColor : 'default'}
                        data-testid={valueTestId}
                      >
                        {value}
                      </Typography>
                    }
                  />
                ),
              )}
            </CardStats>
          </Hidden>

          <Hidden above="sm" as="div">
            <CardDataList flush>
              {statEntries.map(({ key, label, info, value, isLoading }) => (
                <DataListRow
                  key={key}
                  label={label}
                  info={info}
                  value={
                    isLoading ? (
                      <Skeleton variant="text" width="4em" />
                    ) : (
                      <Typography
                        as="span"
                        variant="body"
                        weight="semibold"
                        color={key === 'apx' ? apxColor : 'default'}
                      >
                        {value}
                      </Typography>
                    )
                  }
                />
              ))}
            </CardDataList>
          </Hidden>

          {warning && <CardWarning>{warning}</CardWarning>}
          {isGeoGated ? <VaultCardGeoCta>{cta}</VaultCardGeoCta> : cta}
        </CardContent>

        {illustration && (
          <CardVisual
            variant={variant}
            iconSize={ICON_SIZE}
            iconSizeMobile={ICON_SIZE_MOBILE}
          >
            {illustration}
          </CardVisual>
        )}
      </CardBody>
    </CardRoot>
  );
};
