import styled from 'styled-components';

export const RightOptionsWrapper = styled.div`
  display: flex;

  ${({ theme }) => theme.mediaQueries.lg} {
    margin-top: 24px;
  }
`;

export const ExportWrapper = styled.div`
  margin-left: 10px;
`;
