import styled from 'styled-components';
import { DataTableRow } from '@lidofinance/lido-ui';

export const QueueInfoStyled = styled.div`
  margin-top: ${({ theme }) => theme.spaceMap.md}px;
  color: var(--lido-color-accentContrast);
`;

export const DataTableRowStyled = styled(DataTableRow)`
  margin: 0 0;
  div {
    color: var(--lido-color-accentContrast);
    font-size: 10px;
  }

  span {
    --loader-color: var(--lido-color-accentContrast);
  }
`;
