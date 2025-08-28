import styled from 'styled-components';

export const LegalParagraph = styled.div`
  font-size: 12px;
  font-weight: 400;
  line-height: 20px;
  color: var(--lido-color-textSecondary);
`;

export const VaultDisclaimerBlock = styled.section`
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
