import styled from 'styled-components';

export const VaultsListWrapper = styled.div`
  margin: ${({ theme }) => theme.spaceMap.lg}px 0;
`;

export const VaultListDisclaimer = styled.p`
  color: var(--lido-color-textSecondary);
  font-size: ${({ theme }) => theme.fontSizesMap.xxs}px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
  margin-top: 20px;

  margin-bottom: 60px;

  ${({ theme }) => theme.mediaQueries.md} {
    margin-bottom: 0px;
  }
`;
