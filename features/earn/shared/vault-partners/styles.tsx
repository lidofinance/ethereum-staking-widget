import styled from 'styled-components';

export const VaultPartnersWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spaceMap.xs}px
    ${({ theme }) => theme.spaceMap.md}px;
  flex-wrap: wrap;
`;

export const VaultPartner = styled.div`
  display: flex;
  height: 20px;
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
