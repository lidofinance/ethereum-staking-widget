import styled from 'styled-components';

export const SidePanelStyled = styled.div`
  position: relative;
  grid-column: 2;
  grid-row: 1 / span 2;

  ${({ theme }) => theme.mediaQueries.xl} {
    order: 2;
    grid-column: auto;
    grid-row: auto;
  }
`;

export const FixedBlock = styled.div`
  position: sticky;
  top: ${({ theme }) => theme.spaceMap.md}px;
  gap: ${({ theme }) => theme.spaceMap.md}px;
`;

export const SidePanelContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spaceMap.md}px;
`;
