import React from 'react';
import { Button } from '@lidofinance/lido-ui';

import { LocalLink } from 'shared/components/local-link';
import { EARN_PATH } from 'consts/urls';
import { VaultHeader } from '../../../shared/vault-header';
import { VaultPartnerType } from '../../../shared/types';
import { VaultStats } from '../../../shared/vault-stats';
import { VaultDescription } from '../../../shared/vault-description';
import { VaultTokens } from '../vault-tokens';
import { VaultCardStyled } from './styles';

type VaultCardProps = {
  title: string;
  description?: string;
  urlSlug: string;
  logo: React.ReactNode;
  partners?: VaultPartnerType[];
  stats?: {
    tvl: string;
    apy: string;
  };
  tokens: Array<{ name: string; logo: React.ReactNode }>;
};

export const VaultCard: React.FC<VaultCardProps> = ({
  title,
  logo,
  description,
  partners,
  tokens,
  stats,
  urlSlug,
}) => (
  <VaultCardStyled>
    <VaultHeader title={title} partners={partners} logo={logo} />
    {stats && <VaultStats tvl={stats.tvl} apy={stats.apy} />}
    <VaultDescription description={description} />
    <VaultTokens tokens={tokens} />
    <LocalLink href={`${EARN_PATH}/${urlSlug}/deposit`}>
      <Button fullwidth size="sm">
        Deposit
      </Button>
    </LocalLink>
  </VaultCardStyled>
);
