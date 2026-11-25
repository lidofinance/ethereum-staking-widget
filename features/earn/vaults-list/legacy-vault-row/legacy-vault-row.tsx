import type { ReactNode } from 'react';
import {
  IconArrowRight,
  IconButton,
  Skeleton,
  Tag,
  Tooltip,
  Typography,
} from '@lidofinance/lido-app-ui';

import { LocalLink } from 'shared/components/local-link';
import { EARN_PATH } from 'consts/urls';
import { EARN_VAULT_DEPOSIT_SLUG } from 'features/earn/consts';
import { FormatLargeAmount } from 'shared/formatters/format-large-amount';

import {
  RowRoot,
  RowOverlayLink,
  RowMain,
  RowIcon,
  RowText,
  RowHeader,
  RowTitle,
  RowInteractive,
  RowTvl,
} from './styles';

const UPGRADING_TOOLTIP =
  'Vault users can upgrade their tokens to the new unified EarnETH vault without withdrawal or downtime in rewards.';

type LegacyVaultRowProps = {
  title: string;
  description?: string;
  urlSlug: string;
  tvl?: number | null;
  isLoading?: boolean;
  illustration?: ReactNode;
  linkCallback?: () => void;
  // false when EarnETH does not accept the vault token any more
  isUpgradable?: boolean;
};

export const LegacyVaultRow = ({
  title,
  description,
  urlSlug,
  tvl,
  isLoading,
  illustration,
  linkCallback,
  isUpgradable = true,
}: LegacyVaultRowProps) => {
  const href = `${EARN_PATH}/${urlSlug}/${EARN_VAULT_DEPOSIT_SLUG}`;

  return (
    <RowRoot data-testid={`${urlSlug}-vault-card`}>
      <RowOverlayLink
        as={LocalLink}
        href={href}
        onClick={linkCallback}
        data-testid="open-vault-btn"
        aria-label={title}
      />
      <RowMain>
        {illustration && <RowIcon aria-hidden="true">{illustration}</RowIcon>}
        <RowText>
          <RowHeader>
            <RowTitle>
              <Typography
                variant="bodyLarge"
                weight="semibold"
                data-testid="vaultTitle"
              >
                {title}
              </Typography>
              {isUpgradable && (
                <Tooltip content={UPGRADING_TOOLTIP} width={300}>
                  <RowInteractive tabIndex={0}>
                    <Tag data-testid="upgrading-badge">Upgrading</Tag>
                  </RowInteractive>
                </Tooltip>
              )}
            </RowTitle>
            {description && (
              <Typography
                variant="description"
                color="secondary"
                data-testid="vault-description"
              >
                {description}
              </Typography>
            )}
          </RowHeader>
          <RowTvl data-testid="tvl">
            <Typography as="span" variant="bodyLarge" color="secondary">
              TVL
            </Typography>
            <Typography
              as="span"
              variant="bodyLarge"
              weight="semibold"
              data-testid="tvl-amount"
            >
              {isLoading ? (
                <Skeleton variant="text" width="4em" />
              ) : (
                <FormatLargeAmount amount={tvl} />
              )}
            </Typography>
          </RowTvl>
        </RowText>
      </RowMain>
      <RowInteractive data-testid="vault-button">
        <IconButton
          href={href}
          onClick={linkCallback}
          variant="outline"
          icon={<IconArrowRight />}
          aria-label={`Open ${title}`}
          tabIndex={-1}
        />
      </RowInteractive>
    </RowRoot>
  );
};
