import styled from 'styled-components';

export const VaultDetailsTitle = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: ${({ theme }) => theme.spaceMap.xs}px;
`;
