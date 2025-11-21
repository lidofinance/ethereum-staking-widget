import { FC } from 'react';
import { Tr, Tbody } from '@lidofinance/lido-ui';

import { VaultTip } from 'features/earn/shared/vault-tip';

import { AllocationRow } from './allocation-row';
import { TableStyled, TheadStyled, ThStyled, ThWithTipStyled } from './styles';

export type Allocation = {
  protocol: string;
  chain: string;
  apy: number;
  allocation: number;
  tvlETH: bigint;
  tvlUSD: number;
};
type AllocationProps = {
  allocation: Allocation[];
  protocolIcons: { [key: string]: JSX.Element };
};

const TVL_TIP =
  'TVL of the protocol’s allocated position (separate from the vault’s TVL)';

export const AllocationTable: FC<AllocationProps> = ({
  allocation,
  protocolIcons,
}) => {
  return (
    <TableStyled>
      <TheadStyled>
        <Tr>
          <ThStyled>Protocol</ThStyled>
          <ThStyled align="right">Share</ThStyled>
          <ThWithTipStyled align="right">
            TVL <VaultTip>{TVL_TIP}</VaultTip>
          </ThWithTipStyled>
        </Tr>
      </TheadStyled>
      <Tbody>
        {allocation.map((item) => (
          <AllocationRow
            key={`${item.protocol}-${item.chain}`}
            data={item}
            protocolIcons={protocolIcons}
          />
        ))}
      </Tbody>
    </TableStyled>
  );
};
