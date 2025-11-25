import { FC } from 'react';
import { Tr } from '@lidofinance/lido-ui';

import { FormatLargeAmount } from 'shared/formatters/format-large-amount';
import { VaultTip } from 'features/earn/shared/vault-tip';
import { FormatPercent } from 'shared/formatters/format-percent';

import { ProtocolIcon } from '../protocol-icon';

import { Allocation } from './allocation-table';
import {
  FormatTokenStyled,
  TdNarrowStyled,
  ProtocolNameStyled,
  TdWithIconStyled,
  DataTableRowContentStyled,
} from './styles';

type AllocationRowProps = {
  data: Allocation;
  protocolIcons: { [key: string]: JSX.Element };
};

const AVAILABLE_TIP =
  'The amount of tokens available for withdrawals, pending allocation to new strategies, and reserved for liquidity needs';
const OTHER_TIP =
  'The amount of a newly allocated position. Detailed data will be provided soon';
const PENDING_TIP =
  'The amount of tokens in the process of being deposited to the vault';

export const AllocationRow: FC<AllocationRowProps> = (props) => {
  const { data, protocolIcons } = props;

  const isAvailable = data.protocol === 'Available';
  const isOther = data.protocol === 'Other allocation';
  const isPending = data.protocol === 'Pending deposits';

  return (
    <Tr>
      <TdWithIconStyled>
        <ProtocolIcon
          main={data.icon ? <data.icon /> : protocolIcons[data.protocol]}
          badge={data.chain}
        />
        <ProtocolNameStyled>
          {data.protocol}
          {isAvailable && <VaultTip>{AVAILABLE_TIP}</VaultTip>}
          {isOther && <VaultTip>{OTHER_TIP}</VaultTip>}
          {isPending && <VaultTip>{PENDING_TIP}</VaultTip>}
        </ProtocolNameStyled>
      </TdWithIconStyled>
      <TdNarrowStyled align="right">
        <FormatPercent
          value={data.allocation}
          decimals="percent"
          fallback="-"
        />
      </TdNarrowStyled>
      <TdNarrowStyled align="right">
        <DataTableRowContentStyled>
          <FormatLargeAmount amount={data.tvlUSD} fallback="-" />
          <FormatTokenStyled
            fallback="-"
            amount={data.tvlETH}
            maxDecimalDigits={2}
            symbol={'ETH'}
            shortened={data.tvlETH >= 10n * 10n ** 18n} // shortened only for >= 10 ETH in wei, looks more accurate
          />
        </DataTableRowContentStyled>
      </TdNarrowStyled>
    </Tr>
  );
};
