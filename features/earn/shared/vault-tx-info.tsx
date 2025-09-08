import { DataTableRow } from '@lidofinance/lido-ui';
import styled from 'styled-components';

export const VaultTxInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spaceMap.sm}px;
`;

export const VaultTxInfoRow = styled(DataTableRow)`
  margin: 0;
`;
