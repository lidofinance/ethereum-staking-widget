import { FC } from 'react';
import {
  VaultCardWrapper,
  VaultHeaderColumn,
  VaultHeaderTitle,
} from './styles';
import { VaultPartners } from '../vault-partners';
import { VaultPartnerType } from '../types';

type VaultHeaderProps = {
  title: string;
  partners?: VaultPartnerType[];
  logo: React.ReactNode;
  compact?: boolean;
};

export const VaultHeader: FC<VaultHeaderProps> = ({
  title,
  partners,
  logo,
  compact,
}) => {
  return (
    <VaultCardWrapper>
      {logo}
      <VaultHeaderColumn>
        <VaultHeaderTitle compact={compact} data-testid="vault-title">
          {title}
        </VaultHeaderTitle>
        <VaultPartners partners={partners} />
      </VaultHeaderColumn>
    </VaultCardWrapper>
  );
};
