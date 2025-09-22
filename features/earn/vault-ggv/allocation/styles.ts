import { DataTable, DataTableRow } from '@lidofinance/lido-ui';
import styled from 'styled-components';

import { FormatToken } from 'shared/formatters';

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
  margin-bottom: 0px;
  margin-top: 8px;

  & > div:first-child {
    color: ${({ theme }) => theme.colors.text};
  }
`;

export const FormatTokenStyled = styled(FormatToken)`
  font-size: ${({ theme }) => theme.fontSizesMap.xxs}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 400;
  line-height: 20px;
`;
