import React from 'react';
import { Button, InlineLoader } from '@lidofinance/lido-ui';

import { LocalLink } from 'shared/components/local-link';
import { EARN_PATH } from 'consts/urls';
import { VaultHeader } from '../../../shared/vault-header';
import { VaultPartnerType } from '../../../shared/types';
import { VaultStats } from '../../../shared/vault-stats';
import { VaultDescription } from '../../../shared/vault-description';
import { VaultTokens } from '../vault-tokens';
import {
  VaultCardMyPosition,
  VaultCardMyPositionLabel,
  VaultCardMyPositionValue,
  VaultCardWrapper,
} from './styles';
import { FormatToken } from 'shared/formatters';

type VaultCardProps = {
  title: string;
  description?: string;
  urlSlug: string;
  logo: React.ReactNode;
  partners?: VaultPartnerType[];
  stats: {
    tvl?: number;
    apy?: number;
    apr?: number;
    isLoading?: boolean;
  };
  tokens: Array<{ name: string; logo: React.ReactNode }>;
  position?: {
    balance?: bigint;
    isLoading?: boolean;
    symbol: string;
  };
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
}) => (
  <VaultCardWrapper>
    <VaultHeader title={title} partners={partners} logo={logo} />
    <VaultStats
      tvl={stats.tvl}
      apy={stats.apy}
      apr={stats.apr}
      isLoading={stats.isLoading}
    />
    <VaultDescription description={description} />
    <VaultTokens tokens={tokens} />
    {position && (
      <VaultCardMyPosition>
        <VaultCardMyPositionLabel>My position</VaultCardMyPositionLabel>
        <VaultCardMyPositionValue>
          {position.isLoading ? (
            <InlineLoader />
          ) : (
            <FormatToken symbol={position.symbol} amount={position.balance} />
          )}
        </VaultCardMyPositionValue>
      </VaultCardMyPosition>
    )}
    <LocalLink href={`${EARN_PATH}/${urlSlug}/deposit`}>
      <Button fullwidth size="sm">
        Deposit
      </Button>
    </LocalLink>
  </VaultCardWrapper>
);
