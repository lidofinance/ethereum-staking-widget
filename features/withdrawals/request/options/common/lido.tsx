import {
  useEthAmountByStethWsteth,
  useWithdrawals,
} from 'features/withdrawals/hooks';

import { Option, OptionProps } from '../option';
import { TooltipWithdrawalAmount } from './lido-tooltip-withdrawal-amount';
import { OptionAmountRow } from '../styles';

import { FormatTokenStyled } from './styles';

type LidoProps = Pick<OptionProps, 'selected' | 'onClick'> & {
  inputValue?: string;
};

export const Lido: React.FC<LidoProps> = ({
  selected,
  inputValue,
  ...rest
}: LidoProps) => {
  const { isBunkerMode, isSteth, isPaused } = useWithdrawals();
  const ethAmount = useEthAmountByStethWsteth({ isSteth, input: inputValue });
  const timeRange = isPaused
    ? '—'
    : isBunkerMode
    ? 'Not estimated'
    : '1 - 5 day(s)';

  return (
    <Option
      type="lido"
      title="Lido"
      timeRange={timeRange}
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
