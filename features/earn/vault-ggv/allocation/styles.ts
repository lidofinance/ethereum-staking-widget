import { DataTable, DataTableRow } from '@lidofinance/lido-ui';
import styled from 'styled-components';

export const AllocationLegendContainer = styled.div`
  margin-top: 20px;
  display: flex;
  gap: 4px 12px;
  flex-wrap: wrap;
`;

export const AllocationLegendCircle = styled.div`
  border-radius: 50%;
  width: 12px;
  height: 12px;
`;

export const AllocationLegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const DataTableStyled = styled(DataTable)`
  margin-top: 8px;
`;

export const DataTableRowStyled = styled(DataTableRow)`
  line-height: 24px;
  font-size: ${({ theme }) => theme.fontSizesMap.xs}px;
  font-weight: 700;
`;
