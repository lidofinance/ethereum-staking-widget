import styled from 'styled-components';

export const VaultPartnersWrapper = styled.div`
  display: flex;
  margin-top: ${({ theme }) => theme.spaceMap.xs}px;
`;

export const VaultPartner = styled.div`
  display: flex;
  margin-right: ${({ theme }) => theme.spaceMap.md}px;
`;

export const VaultPartnerRole = styled.div`
  color: var(--lido-color-textSecondary);
  margin-right: ${({ theme }) => theme.spaceMap.sm}px;
`;

export const VaultPartnerIcon = styled.div`
  margin-right: ${({ theme }) => theme.spaceMap.xs}px;
`;

export const VaultPartnerText = styled.div`
  color: var(--lido-color-text);
`;
