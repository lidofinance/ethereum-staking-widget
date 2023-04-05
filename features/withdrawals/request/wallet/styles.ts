import styled from 'styled-components';

export const DataWrapperStyled = styled.div`
  margin-left: auto;
`;

export const QueuInfoStyled = styled.div`
  display: flex;
  margin-top: ${({ theme }) => theme.spaceMap.sm}px;

  &:first-of-type {
    margin-top: ${({ theme }) => theme.spaceMap.md}px;
  }
`;
