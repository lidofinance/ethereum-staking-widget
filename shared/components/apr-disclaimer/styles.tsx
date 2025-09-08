import styled from 'styled-components';

export const AprDisclaimerBlock = styled.section`
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
