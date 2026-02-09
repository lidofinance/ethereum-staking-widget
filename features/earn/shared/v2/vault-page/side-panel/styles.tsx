import styled from 'styled-components';

export const SidePanelStyled = styled.div`
  min-width: 358px;
  max-width: 396px;
  width: 100%;
  position: relative;
`;

export const FixedBlock = styled.div`
  position: sticky;
  top: 0;
  gap: ${({ theme }) => theme.spaceMap.md}px;
`;

export const SidePanelContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spaceMap.md}px;
`;
