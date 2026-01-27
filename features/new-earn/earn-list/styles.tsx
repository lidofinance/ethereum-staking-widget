import styled from 'styled-components';

export const ListWrapper = styled.div`
  max-width: 680px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spaceMap.xl}px;

  ${({ theme }) => theme.mediaQueries.sm} {
    gap: ${({ theme }) => theme.spaceMap.lg}px;
  }
`;

export const CardsStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spaceMap.lg}px;
`;
