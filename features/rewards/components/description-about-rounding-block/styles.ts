import styled from 'styled-components';

export const DescriptionAboutRoundingBlockStyled = styled.div`
  flex: 1;
  padding: ${({ theme }) => theme.spaceMap.sm}px;
  margin-top: ${({ theme }) => theme.spaceMap.md}px;

  border-radius: ${({ theme }) => theme.spaceMap.sm}px;

  background-color: rgb(255, 172, 47, 0.1);
  color: #ffac2f;
  text-align: center;

  ${({ theme }) => theme.mediaQueries.md} {
    margin-top: ${({ theme }) => theme.spaceMap.xl}px;
  }
`;
