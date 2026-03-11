import styled from 'styled-components';

export const SidePanelStyled = styled.div`
  ${({ theme }) => theme.mediaQueries.xl} {
    order: 2;
  }
`;

export const FixedBlock = styled.div`
  position: sticky;
  top: ${({ theme }) => theme.spaceMap.md}px;
`;

export const SidePanelContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spaceMap.md}px;
`;
