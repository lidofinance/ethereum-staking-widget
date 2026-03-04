import styled from 'styled-components';

export const StrategyContentStyled = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spaceMap.md}px;
  margin-bottom: 90px;

  ${({ theme }) => theme.mediaQueries.md} {
    grid-template-columns: 1fr;
  }
`;

export const StrategyItemStyled = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spaceMap.sm}px;
`;

export const Container = styled.div`
  position: relative;
  display: inline-block;
`;

export const Badge = styled.div`
  position: absolute;
  right: -4px;
  bottom: -4px;
`;

export const Content = styled.div`
  width: 100%;
  height: 100%;
`;
