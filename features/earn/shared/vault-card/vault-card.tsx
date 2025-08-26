import React from 'react';
import { Button, InlineLoader } from '@lidofinance/lido-ui';

import { EARN_PATH } from 'consts/urls';
import { FormatToken } from 'shared/formatters';

import { EARN_VAULT_DEPOSIT_SLUG } from '../../consts';
import { VaultHeader } from '../vault-header';
import { VaultStats } from '../vault-stats';
import { VaultDescription } from '../vault-description';

import {
  VaultCardMyPosition,
  VaultCardMyPositionLabel,
  VaultCardMyPositionValue,
  VaultCardWrapper,
  VaultCardCTALink,
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
    isLoading?: boolean;
    symbol: string;
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
  <VaultCardWrapper>
    <VaultHeader compact title={title} partners={partners} logo={logo} />
    <VaultStats {...stats} />
    <VaultDescription description={description} tokens={tokens} />
    {position && (
      <VaultCardMyPosition>
        <VaultCardMyPositionLabel>My position</VaultCardMyPositionLabel>
        <VaultCardMyPositionValue>
          {position.isLoading ? (
            <InlineLoader />
          ) : (
            <FormatToken
              trimEllipsis
              symbol={position.symbol}
              amount={position.balance}
              fallback="—"
            />
          )}
        </VaultCardMyPositionValue>
      </VaultCardMyPosition>
    )}
    <VaultCardCTALink
      href={`${EARN_PATH}/${urlSlug}/${EARN_VAULT_DEPOSIT_SLUG}`}
      onClick={depositLinkCallback}
    >
      <Button fullwidth size="sm">
        {position?.balance && position.balance > 0n ? 'Manage' : 'Deposit'}
      </Button>
    </VaultCardCTALink>
  </VaultCardWrapper>
);
