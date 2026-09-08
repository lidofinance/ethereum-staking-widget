import { FC, useState } from 'react';
import { Tr } from '@lidofinance/lido-ui';

import { FormatPercent } from 'shared/formatters/format-percent';
import { FormatLargeAmount } from 'shared/formatters/format-large-amount';
import { VaultTip } from 'features/earn/shared/vault-tip';
import { ProtocolIcon } from 'features/earn/shared/vault-allocation/protocol-icon';
import { ReactComponent as ChevronIcon } from 'assets/icons/chevron-gray-right.svg';

import { AllocationGroup } from '../types';
import {
  ChevronWrapper,
  GroupTdStyled,
  GroupNameStyled,
  NestedTdWithIconStyled,
  ProtocolNameStyled,
  TdNarrowStyled,
  TrWithShiftStyled,
  ProtocolNamePercent,
} from './styles';

type AllocationGroupRowProps = {
  group: AllocationGroup;
};

export const AllocationGroupRow: FC<AllocationGroupRowProps> = ({ group }) => {
  const [open, setOpen] = useState(true);
  const isExpandable = group.items.length > 0;

  return (
    <>
      <Tr onClick={isExpandable ? () => setOpen((v) => !v) : undefined}>
        <GroupTdStyled $expandable={isExpandable}>
          <GroupNameStyled>
            {isExpandable && (
              <ChevronWrapper $open={open}>
                <ChevronIcon />
              </ChevronWrapper>
            )}
            <ProtocolNameStyled>
              <ProtocolNamePercent>
                <FormatPercent value={group.allocation} decimals="percent" />
              </ProtocolNamePercent>
              {group.name}
              {group.info && (
                <VaultTip placement="right">{group.info}</VaultTip>
              )}
            </ProtocolNameStyled>
          </GroupNameStyled>
        </GroupTdStyled>
        <TdNarrowStyled align="right"></TdNarrowStyled>
        <TdNarrowStyled align="right">
          <FormatLargeAmount amount={group.tvlUSD} />
        </TdNarrowStyled>
      </Tr>
      {isExpandable &&
        open &&
        group.items.map((item, index) => (
          <TrWithShiftStyled
            key={`${item.id}-${item.chain}`}
            $isLast={index === group.items.length - 1}
          >
            <NestedTdWithIconStyled>
              <ProtocolIcon
                mainIcon={item.icon ? <item.icon /> : null}
                badge={item.chain}
              />
              <ProtocolNameStyled>{item.label}</ProtocolNameStyled>
            </NestedTdWithIconStyled>
            <TdNarrowStyled align="right">
              <FormatPercent value={item.allocation} decimals="percent" />
            </TdNarrowStyled>
            <TdNarrowStyled align="right">
              <FormatLargeAmount amount={item.tvlUSD} />
            </TdNarrowStyled>
          </TrWithShiftStyled>
        ))}
    </>
  );
};
