import { FC } from 'react';
import {
  VaultCardWrapper,
  VaultHeaderColumn,
  VaultHeaderTitle,
  VaultHeaderNewTag,
} from './styles';
import { VaultPartners } from '../vault-partners';
import { VaultPartnerType } from '../types';
import { useConfig } from 'config/use-config';

type VaultHeaderProps = {
  title: string;
  vaultName?: string;
  partners?: VaultPartnerType[];
  logo: React.ReactNode;
  compact?: boolean;
};

export const VaultHeader: FC<VaultHeaderProps> = ({
  title,
  vaultName = '',
  partners,
  logo,
  compact,
}) => {
  const showNew = useConfig().externalConfig.earnVaults.find(
    (vault) => vault.name === vaultName,
  )?.showNew;

  return (
    <VaultCardWrapper>
      {logo}
      <VaultHeaderColumn>
        <VaultHeaderTitle compact={compact} data-testid="vault-title">
          {title} {showNew && <VaultHeaderNewTag>New</VaultHeaderNewTag>}
        </VaultHeaderTitle>
        <VaultPartners partners={partners} />
      </VaultHeaderColumn>
    </VaultCardWrapper>
  );
};
