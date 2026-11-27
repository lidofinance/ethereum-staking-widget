import { Fragment, type ReactNode } from 'react';
import { Tag } from '@lidofinance/lido-app-ui';

import { VaultEthIcon } from 'assets/earn';

import {
  TableWrapper,
  TableTitle,
  Table,
  HeaderCell,
  HeaderTitle,
  AfterUpgradeTag,
} from './styles';

type Cell = string | string[];

const ROWS: [label: string, before: Cell, after: Cell][] = [
  [
    'Vault Token',
    'strETH tokens, representing shares in the specific vault',
    'earnETH, representing shares in the ETH meta-vault',
  ],
  [
    'Reward Strategy',
    'Earning rewards in a specific strategy/vault',
    'Keep earning rewards while we optimize for the best available strategy',
  ],
  [
    'Vault Selection',
    'Manual vault choice',
    'Constant optimization between strategies',
  ],
  [
    'Curator Model',
    'Lock-in to a specific curator',
    'An evolving set of curators working on the risk/rewards optimization',
  ],
  [
    'Fees',
    ['1 % platform (AUM) fee', '10 % performance fee'],
    ['flexible, capped at:', '0.5 % AUM fee', '20 % performance fee'],
  ],
];

const renderCell = (cell: Cell): ReactNode =>
  Array.isArray(cell)
    ? cell.map((line, index) => (
        <Fragment key={line}>
          {index > 0 && <br />}
          {line}
        </Fragment>
      ))
    : cell;

export const DrawerTable = () => (
  <TableWrapper>
    <TableTitle data-testid="table-title">
      Comparison between stRATEGY and the EarnETH Vault
    </TableTitle>
    <Table>
      <colgroup>
        <col />
        <col />
        <col />
      </colgroup>
      <thead>
        <tr>
          <th aria-label="Parameter" />
          <th>
            <HeaderCell>
              <Tag variant="neutral">Before upgrade</Tag>
              <HeaderTitle>Single vault</HeaderTitle>
            </HeaderCell>
          </th>
          <th>
            <HeaderCell>
              <AfterUpgradeTag variant="custom">After upgrade</AfterUpgradeTag>
              <HeaderTitle>
                <VaultEthIcon width={28} height={28} aria-hidden="true" />
                EarnETH
              </HeaderTitle>
            </HeaderCell>
          </th>
        </tr>
      </thead>
      <tbody>
        {ROWS.map(([label, before, after]) => (
          <tr key={label}>
            <td>{label}</td>
            <td>{renderCell(before)}</td>
            <td>{renderCell(after)}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  </TableWrapper>
);
