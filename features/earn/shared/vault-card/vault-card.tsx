import React from 'react';
import { Button } from '@lidofinance/lido-ui';

import { EARN_PATH } from 'consts/urls';
import { FormatToken } from 'shared/formatters';

import { EARN_VAULT_DEPOSIT_SLUG, EarnVaultKey } from '../../consts';
import { VaultHeader } from '../vault-header';
import { VaultStats } from '../vault-stats';
import { VaultDescription } from '../vault-description';
import { InlineLoader } from '../inline-loader';

import {
  VaultCardMyPosition,
  VaultCardMyPositionLabel,
  VaultCardMyPositionValue,
  VaultCardWrapper,
  VaultCardCTALink,
  VaultCardMyPositionRow,
} from './styles';

import type { VaultPartnerType } from '../types';

type VaultCardProps = {
  title: string;
  description?: string;
  urlSlug: string;
  logo: React.ReactNode;
  partners?: VaultPartnerType[];
  stats: React.ComponentProps<typeof VaultStats>;
  tokens: Array<{ name: string; logo: React.ReactNode }>;
  position?: {
    balance?: bigint;
    toBeClaimed?: bigint;
    isLoading?: boolean;
    symbol: string;
    logo: React.ReactNode;
  };
  depositLinkCallback?: () => void;
};

export const VaultCard: React.FC<VaultCardProps> = ({
  title,
  logo,
  description,
  partners,
  tokens,
  stats,
  urlSlug,
  position,
  depositLinkCallback,
}) => (
  <VaultCardWrapper data-testid={`${urlSlug}-vault-card`}>
    <VaultHeader
      compact
      title={title}
      vaultName={urlSlug as EarnVaultKey}
      partners={partners}
      logo={logo}
    />
    <VaultStats {...stats} />
    <VaultDescription description={description} tokens={tokens} />
    {position && (
      <>
        <VaultCardMyPosition>
          <VaultCardMyPositionRow>
            <VaultCardMyPositionLabel>My position</VaultCardMyPositionLabel>
            <VaultCardMyPositionValue>
              <InlineLoader width={32} isLoading={position.isLoading}>
                <FormatToken
                  trimEllipsis
                  symbol={position.symbol}
                  amount={position.balance}
                  fallback="—"
                  data-testid={`${position.symbol}-position-amount`}
                />
                {position.logo}
              </InlineLoader>
            </VaultCardMyPositionValue>
          </VaultCardMyPositionRow>
          <VaultCardMyPositionRow>
            {Boolean(position.toBeClaimed) && (
              <>
                <VaultCardMyPositionLabel>
                  To be claimed
                </VaultCardMyPositionLabel>
                <VaultCardMyPositionValue>
                  <FormatToken
                    trimEllipsis
                    symbol={position.symbol}
                    amount={position.toBeClaimed}
                  />
                  {position.logo}
                </VaultCardMyPositionValue>
              </>
            )}
          </VaultCardMyPositionRow>
        </VaultCardMyPosition>
      </>
    )}
    <VaultCardCTALink
      href={`${EARN_PATH}/${urlSlug}/${EARN_VAULT_DEPOSIT_SLUG}`}
      onClick={depositLinkCallback}
    >
      <Button fullwidth size="sm" data-testid="open-vault-btn">
        {position?.balance && position.balance > 0n ? 'Manage' : 'Deposit'}
      </Button>
    </VaultCardCTALink>
  </VaultCardWrapper>
);
