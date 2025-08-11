import { FC } from 'react';
import {
  VaultCardWrapper,
  VaultHeaderColumn,
  VaultHeaderTitle,
  VaultLogoWrapper,
} from './styles';
import { VaultPartners } from '../vault-partners';
import { VaultPartnerType } from '../types';

type VaultHeaderProps = {
  title: string;
  partners?: VaultPartnerType[];
  logo: React.ReactNode;
};

export const VaultHeader: FC<VaultHeaderProps> = ({
  title,
  partners,
  logo,
}) => {
  return (
    <VaultCardWrapper>
      <VaultHeaderColumn>
        <VaultLogoWrapper>{logo}</VaultLogoWrapper>
      </VaultHeaderColumn>
      <VaultHeaderColumn>
        <VaultHeaderTitle>{title}</VaultHeaderTitle>
        <VaultPartners partners={partners} />
      </VaultHeaderColumn>
    </VaultCardWrapper>
  );
};
