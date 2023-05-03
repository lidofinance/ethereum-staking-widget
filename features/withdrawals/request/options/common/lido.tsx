import {
  useEthAmountByStethWsteth,
  useWaitingTime,
} from 'features/withdrawals/hooks';
import { useWithdrawals } from 'features/withdrawals/contexts/withdrawals-context';
import { useRequestForm } from 'features/withdrawals/contexts/request-form-context';

import { Option, OptionProps } from '../option';
import { TooltipWithdrawalAmount } from './lido-tooltip-withdrawal-amount';
import { OptionAmountRow } from '../styles';

import { FormatTokenStyled } from './styles';

type LidoProps = Pick<OptionProps, 'selected' | 'onClick'>;

export const Lido = ({ selected, ...rest }: LidoProps) => {
  const { isSteth } = useWithdrawals();
  const { inputValue } = useRequestForm();
  const { value, initialLoading } = useWaitingTime(inputValue);
  const ethAmount = useEthAmountByStethWsteth({ isSteth, input: inputValue });

  return (
    <Option
      type="lido"
      title="Lido"
      timeRange={value}
      selected={selected}
      isTimeRangeLoading={initialLoading}
      {...rest}
    >
      <OptionAmountRow>
        <FormatTokenStyled amount={ethAmount} symbol="ETH" />{' '}
        <TooltipWithdrawalAmount />
      </OptionAmountRow>
    </Option>
  );
};
