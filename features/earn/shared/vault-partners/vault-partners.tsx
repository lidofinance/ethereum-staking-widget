import { FC } from 'react';
import {
  VaultPartnersWrapper,
  VaultPartner,
  VaultPartnerRole,
  VaultPartnerText,
} from './styles';
import { VaultPartnerType } from '../types';

type VaultPartnersProps = {
  partners?: VaultPartnerType[];
};

export const VaultPartners: FC<VaultPartnersProps> = ({ partners }) => {
  return (
    <VaultPartnersWrapper>
      {partners?.map((partner, index) => (
        <VaultPartner key={index}>
          <VaultPartnerRole>{partner.role}</VaultPartnerRole>
          {partner.icon}
          <VaultPartnerText>{partner.text}</VaultPartnerText>
        </VaultPartner>
      ))}
    </VaultPartnersWrapper>
  );
};
