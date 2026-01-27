import styled from 'styled-components';

export const LeftColumnStyled = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spaceMap.xl}px;
`;
