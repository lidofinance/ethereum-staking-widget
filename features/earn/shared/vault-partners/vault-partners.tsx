import { FC } from 'react';
import {
  VaultPartnersWrapper,
  VaultPartner,
  VaultPartnerRole,
  VaultPartnerText,
} from './styles';
import { VaultPartnerType } from '../types';
import { useThemeToggle } from '@lidofinance/lido-ui';

type VaultPartnersProps = {
  partners?: VaultPartnerType[];
};

export const VaultPartners: FC<VaultPartnersProps> = ({ partners }) => {
  const { themeName } = useThemeToggle();
  const isDarkTheme = themeName === 'dark';

  return (
    <VaultPartnersWrapper data-testid="vault-partners">
      {partners?.map((partner, index) => (
        <VaultPartner key={index}>
          <VaultPartnerRole>{partner.role}</VaultPartnerRole>
          {partner.iconDarkTheme && isDarkTheme
            ? partner.iconDarkTheme
            : partner.icon}
          <VaultPartnerText>{partner.text}</VaultPartnerText>
        </VaultPartner>
      ))}
    </VaultPartnersWrapper>
  );
};
