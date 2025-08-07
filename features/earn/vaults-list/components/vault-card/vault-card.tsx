import React from 'react';
import { Button, Link } from '@lidofinance/lido-ui';

import { EARN_PATH } from 'consts/urls';
import { VaultHeader } from '../vault-header';
import { VaultPartnerType } from '../../types';
import { VaultStats } from '../vault-stats';
import { VaultDescription } from '../vault-description';
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
    <Link href={`${EARN_PATH}/${urlSlug}`}>
      <Button fullwidth size="sm">
        Deposit
      </Button>
    </Link>
  </VaultCardStyled>
);
