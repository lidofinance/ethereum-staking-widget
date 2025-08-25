import styled from 'styled-components';

export const VaultPartnersWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spaceMap.xs}px 12px;
  flex-wrap: wrap;

  ${({ theme }) => theme.mediaQueries.md} {
    font-size: ${({ theme }) => theme.fontSizesMap.xxs}px;
  }
`;

export const VaultPartner = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spaceMap.xs}px;
  height: 20px;
`;

export const VaultPartnerRole = styled.div`
  color: var(--lido-color-textSecondary);
`;

export const VaultPartnerText = styled.div`
  color: var(--lido-color-text);
`;
