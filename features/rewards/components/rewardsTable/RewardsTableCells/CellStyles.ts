import styled from 'styled-components';

export const TypeCellValueWrapper = styled.div`
  display: flex;
  white-space: nowrap;
`;

export const ChangeCellValueWrapper = styled.div<{ negative: boolean }>`
  color: ${({ negative, theme }) =>
    negative ? theme.colors.error : theme.colors.success};
`;

export const OnlyMobileCellValueWrapper = styled.div`
  display: none;
  ${({ theme }) => theme.mediaQueries.lg} {
    display: block;
  }
`;

export const OnlyMobileChangeCellValueWrapper = styled.div<{
  negative: boolean;
}>`
  display: none;
  color: ${({ negative, theme }) =>
    negative ? theme.colors.error : theme.colors.success};
  ${({ theme }) => theme.mediaQueries.lg} {
    display: block;
  }
`;
