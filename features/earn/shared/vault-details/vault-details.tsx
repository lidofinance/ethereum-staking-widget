import React, { FC } from 'react';
import {
  Block,
  DataTable,
  DataTableRow,
  Question,
  Tooltip,
} from '@lidofinance/lido-ui';
import { VaultDetailsTitle } from './styles';

export const VaultDetails: FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <Block>
      <DataTable>{children}</DataTable>
    </Block>
  );
};

export const VaultDetailsItem: FC<{
  title: React.ReactNode;
  tooltipText?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, tooltipText, children }) => {
  return (
    <DataTableRow
      title={
        <VaultDetailsTitle>
          {title}
          <Tooltip title={tooltipText}>
            <Question />
          </Tooltip>
        </VaultDetailsTitle>
      }
    >
      {children}
    </DataTableRow>
  );
};
