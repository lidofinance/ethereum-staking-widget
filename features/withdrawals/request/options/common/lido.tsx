import {
  useEthAmountByStethWsteth,
  useWaitingTime,
  useWithdrawals,
  useRequestForm,
} from 'features/withdrawals/hooks';

import { Option, OptionProps } from '../option';
import { TooltipWithdrawalAmount } from './lido-tooltip-withdrawal-amount';
import { OptionAmountRow } from '../styles';

import { FormatTokenStyled } from './styles';

type LidoProps = Pick<OptionProps, 'selected' | 'onClick'>;

export const Lido = ({ selected, ...rest }: LidoProps) => {
  const { inputValue } = useRequestForm();
  const { isSteth } = useWithdrawals();
  const { value } = useWaitingTime(inputValue);
  const ethAmount = useEthAmountByStethWsteth({ isSteth, input: inputValue });

  return (
    <Option
      type="lido"
      title="Lido"
      timeRange={value}
      selected={selected}
      {...rest}
    >
      <OptionAmountRow>
        <FormatTokenStyled amount={ethAmount} symbol="ETH" />{' '}
        <TooltipWithdrawalAmount />
      </OptionAmountRow>
    </Option>
  );
};
