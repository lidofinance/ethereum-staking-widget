import styled from 'styled-components';
import { DataTable } from '@lidofinance/lido-ui';

export const StatsDataTable = styled(DataTable)`
  margin-top: ${({ theme }) => theme.spaceMap.xl}px;
`;

export const InputWrap = styled.div`
  margin-bottom: ${({ theme }) => theme.spaceMap.md}px;
`;
