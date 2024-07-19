import styled from 'styled-components';

export const WrapperStyle = styled.div`
  flex: 1;
  padding: ${({ theme }) => theme.spaceMap.sm}px;
  margin-right: ${({ theme }) => theme.spaceMap.xl}px;

  border-radius: ${({ theme }) => theme.spaceMap.sm}px;

  background-color: rgb(255, 172, 47, 0.1);
  color: #ffac2f;
  text-align: center;

  ${({ theme }) => theme.mediaQueries.md} {
    margin-right: 0;
    margin-top: ${({ theme }) => theme.spaceMap.xl}px;
  }
`;
