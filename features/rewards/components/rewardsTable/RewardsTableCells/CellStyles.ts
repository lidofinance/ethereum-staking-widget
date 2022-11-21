import styled from 'styled-components';

export const TypeCellValueWrapper = styled.div`
  display: flex;
  white-space: nowrap;
`;

export const ChangeCellValueWrapper = styled.div<{ negative: boolean }>`
  color: ${({ negative, theme }) =>
    negative ? theme.colors.error : theme.colors.success};
`;
