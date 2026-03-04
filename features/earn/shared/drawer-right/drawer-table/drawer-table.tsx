import React from 'react';
import { VaultEthIcon } from 'assets/earn-v2';
import { ReactComponent as ChevronsUp } from 'assets/icons/chevrons-up.svg';
import {
  Table,
  Tr,
  HeaderTr,
  Tbody,
  Td,
  HeaderCell,
  TableHeader,
  MobileCellHeader,
  HeaderTitle,
  DrawerBadge,
} from './styles';

const DATA = [
  {
    header: [
      '',
      <HeaderCell key="lido-single-vault">
        <DrawerBadge>Before upgrade</DrawerBadge>
        <HeaderTitle>Single vault</HeaderTitle>
      </HeaderCell>,
      <HeaderCell key="lido-earn-eth">
        <DrawerBadge
          variant="gradient"
          icon={<ChevronsUp width={20} height={20} />}
        >
          After upgrade
        </DrawerBadge>
        <HeaderTitle>
          <VaultEthIcon width={28} height={28} />
          <HeaderTitle>EarnETH</HeaderTitle>
        </HeaderTitle>
      </HeaderCell>,
    ],
    rows: [
      {
        cells: [
          'Vault Token',
          'GG / strETH tokens, representing shares in the specific vault',
          'earnETH, representing shares in the ETH meta-vault',
        ],
      },
      {
        cells: [
          'Reward Strategy',
          'Earning rewards in a specific strategy/vault',
          'Keep earning rewards while we optimize for the best available strategy',
        ],
      },
      {
        cells: [
          'Vault Selection',
          'Manual vault choice',
          'Constant optimization between strategies',
        ],
      },
      {
        cells: [
          'Curator Model',
          'Lock-in to a specific curator',
          'An evolving set of curators working on the best risk/rewards optimization',
        ],
      },
      {
        cells: [
          'Fees',
          '1 % management fee <br /> 10 % performance fee',
          '1 % management fee <br /> 10 % performance fee',
        ],
      },
    ],
  },
];

export const DrawerTable = () => {
  return (
    <div>
      <TableHeader>
        Comparison between GGV/stRATEGY and the EarnETH Vault
      </TableHeader>
      {DATA.map((item) => (
        <Table key={item.header.join('-')}>
          <thead>
            <HeaderTr>
              {item.header.map((header) => (
                <th key={header.toString()}>{header}</th>
              ))}
            </HeaderTr>
          </thead>
          <Tbody>
            {item.rows.map((row, rowIndex) => (
              <Tr key={rowIndex}>
                {row.cells.map((cell, cellIndex) => (
                  <Td key={cellIndex}>
                    <MobileCellHeader>{row.cells[0]}</MobileCellHeader>
                    {typeof cell === 'string' ? (
                      <span dangerouslySetInnerHTML={{ __html: cell }} />
                    ) : (
                      <>{cell}</>
                    )}
                  </Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      ))}
    </div>
  );
};
