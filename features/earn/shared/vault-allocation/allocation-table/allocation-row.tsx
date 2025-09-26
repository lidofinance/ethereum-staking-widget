import { FC } from 'react';
import { Tr } from '@lidofinance/lido-ui';

import { FormatLargeAmount } from 'shared/formatters/format-large-amount';
import { VaultTip } from 'features/earn/shared/vault-tip';

import { ProtocolIcon } from '../protocol-icon';

import { Allocation } from './allocation-Table';
import {
  FormatTokenStyled,
  TdNarrowStyled,
  ProtocolNameStyled,
  TdWithIconStyled,
} from './styles';

type AllocationRowProps = {
  data: Allocation;
};

const AVAILABLE_TIP =
  'The amount of tokens available for withdrawals, pending allocation to new strategies, and reserved for liquidity needs';
const OTHER_TIP =
  'The amount of a newly allocated position. Detailed data will be provided soon';

export const AllocationRow: FC<AllocationRowProps> = (props) => {
  const { data } = props;

  const isAvailable = data.protocol === 'Available';
  const isOther = data.protocol === 'Other allocation';

  return (
    <Tr>
      <TdWithIconStyled>
        <ProtocolIcon main={data.protocol} badge={data.chain} />
        <ProtocolNameStyled>
          {data.protocol} {isAvailable && <VaultTip>{AVAILABLE_TIP}</VaultTip>}
          {isOther && <VaultTip>{OTHER_TIP}</VaultTip>}
        </ProtocolNameStyled>
      </TdWithIconStyled>
      <TdNarrowStyled align="right">{data.allocation}%</TdNarrowStyled>
      <TdNarrowStyled align="right">
        <FormatLargeAmount amount={data.tvlUSD} fallback="-" />
        <br />
        <FormatTokenStyled
          fallback="-"
          amount={data.tvlETH}
          symbol={'ETH'}
          shortened
        />
      </TdNarrowStyled>
    </Tr>
  );
};
