import styled from 'styled-components';
import { Table } from '@lidofinance/lido-ui';

export const RewardsTableWrapperStyle = styled.div`
  position: relative;

  width: calc(100% + ${({ theme }) => 2 * theme.spaceMap.xxl}px);
  margin: 0 ${({ theme }) => -theme.spaceMap.xxl}px;

  ${({ theme }) => theme.mediaQueries.lg} {
    width: calc(100% + ${({ theme }) => 2 * theme.spaceMap.lg}px);
    margin: 0 ${({ theme }) => -theme.spaceMap.lg}px;
    overflow-x: auto;
  }
`;

export const RewardsTableStyle = styled(Table)`
  width: 100%;
`;

export const RewardsTablePaginationWrapperStyle = styled.div`
  margin-top: ${({ theme }) => theme.spaceMap.md}px;
  display: flex;
  justify-content: center;
`;
