import { FC, useState } from 'react';
import { Tr } from '@lidofinance/lido-ui';

import { FormatPercent } from 'shared/formatters/format-percent';
import { FormatLargeAmount } from 'shared/formatters/format-large-amount';
import { VaultTip } from 'features/earn/shared/vault-tip';
import { ProtocolIcon } from 'features/earn/shared/vault-allocation/protocol-icon';

import { AllocationGroup } from '../types';
import {
  ChevronStyled,
  GroupTdStyled,
  GroupNameStyled,
  ProtocolNameStyled,
  TdNarrowStyled,
  TdWithIconStyled,
} from './styles';

type AllocationGroupRowProps = {
  group: AllocationGroup;
};

export const AllocationGroupRow: FC<AllocationGroupRowProps> = ({ group }) => {
  const [open, setOpen] = useState(true);

  return (
    <>
      <Tr onClick={() => setOpen((v) => !v)}>
        <GroupTdStyled>
          <GroupNameStyled>
            <ChevronStyled $open={open} />
            <ProtocolNameStyled>
              {group.name}
              {group.info && <VaultTip>{group.info}</VaultTip>}
            </ProtocolNameStyled>
          </GroupNameStyled>
        </GroupTdStyled>
        <TdNarrowStyled align="right">
          <FormatPercent value={group.allocation} decimals="percent" />
        </TdNarrowStyled>
        <TdNarrowStyled align="right">
          <FormatLargeAmount amount={group.tvlUSD} />
        </TdNarrowStyled>
      </Tr>
      {open &&
        group.items.map((item) => (
          <Tr key={`${item.id}-${item.chain}`}>
            <TdWithIconStyled>
              <ProtocolIcon
                mainIcon={item.icon ? <item.icon /> : null}
                badge={item.chain}
              />
              <ProtocolNameStyled>{item.label}</ProtocolNameStyled>
            </TdWithIconStyled>
            <TdNarrowStyled align="right">
              <FormatPercent value={item.allocation} decimals="percent" />
            </TdNarrowStyled>
            <TdNarrowStyled align="right">
              <FormatLargeAmount amount={item.tvlUSD} />
            </TdNarrowStyled>
          </Tr>
        ))}
    </>
  );
};
