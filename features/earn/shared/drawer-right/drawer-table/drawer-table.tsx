import React from 'react';
import { VaultEthIcon } from 'assets/earn-v2';
import {
  Table,
  Tr,
  HeaderTr,
  Tbody,
  Td,
  HeaderWithIcon,
  TableHeader,
  MobileCellHeader,
} from './styles';

const DATA = [
  {
    header: [
      '',
      'Single vault',
      <HeaderWithIcon key="lido-earn-eth">
        <VaultEthIcon width={28} height={28} />
        Lido Earn ETH
      </HeaderWithIcon>,
    ],
    rows: [
      {
        cells: [
          'Vault Token',
          'GG / strETH tokens, represanting shares in the specific vault',
          'earnETH, representing shares in the ETH meta-vault',
        ],
      },
      {
        cells: [
          'Reward Strategy',
          'Earning rewards in a specific strategy/vault',
          'Continue earning rewards, but in a best strategy available without explicit switching',
        ],
      },
      {
        cells: [
          'Vault Selection',
          'Manual vault choice',
          'Constant optimization between best strategies',
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
        Comparison between GGV/stRATEGY and the Lido Earn ETH Vault
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
