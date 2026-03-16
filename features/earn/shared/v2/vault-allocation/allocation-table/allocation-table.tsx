import { FC } from 'react';
import { Tr, Tbody } from '@lidofinance/lido-ui';

import { FormatPercent } from 'shared/formatters/format-percent';
import { FormatLargeAmount } from 'shared/formatters/format-large-amount';
import { VaultTip } from 'features/earn/shared/vault-tip';

import { AllocationGroup, FlatAllocationItem } from '../types';
import { AllocationGroupRow } from './allocation-group-row';
import {
  TableStyled,
  TheadStyled,
  ThStyled,
  ThWithTipStyled,
  TdNarrowStyled,
  ProtocolNameStyled,
  TdStyled,
  ProtocolNamePercent,
} from './styles';

type AllocationTableV2Props = {
  groups: AllocationGroup[];
  flatItems?: FlatAllocationItem[];
};

const TVL_TIP =
  "TVL of the protocol's allocated position (separate from the vault's TVL)";

export const AllocationTable: FC<AllocationTableV2Props> = ({
  groups,
  flatItems,
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
        {groups.map((group) => (
          <AllocationGroupRow
            key={`${group.name}-${group.allocation}`}
            group={group}
          />
        ))}
        {flatItems?.map((item) => (
          <Tr key={`${item.name}-${item.allocation}`}>
            <TdStyled>
              <ProtocolNameStyled>
                <ProtocolNamePercent>
                  <FormatPercent value={item.allocation} decimals="percent" />
                </ProtocolNamePercent>
                {item.name}
                {item.info && <VaultTip>{item.info}</VaultTip>}
              </ProtocolNameStyled>
            </TdStyled>
            <TdNarrowStyled align="right"></TdNarrowStyled>
            <TdNarrowStyled align="right">
              <FormatLargeAmount amount={item.tvlUSD} />
            </TdNarrowStyled>
          </Tr>
        ))}
      </Tbody>
    </TableStyled>
  );
};
