import { parseEther } from '@ethersproject/units';
import { BigNumber } from 'ethers';
import { useRequestForm } from 'features/withdrawals/contexts/request-form-context';

import { Option, OptionProps } from '../option';

import { FormatTokenStyled } from './styles';

type OneinchProps = Pick<OptionProps, 'selected' | 'onClick'>;

export const Oneinch: React.FC<OneinchProps> = ({
  selected,
  ...rest
}: OneinchProps) => {
  const { inputValue } = useRequestForm();
  const ethAmount = !isNaN(Number(inputValue))
    ? parseEther(inputValue || '0')
    : BigNumber.from(0);

  return (
    <Option
      type="oneinch"
      title="1inch"
      timeRange="1 minute"
      selected={selected}
      {...rest}
    >
      <FormatTokenStyled amount={ethAmount} symbol="ETH" />
    </Option>
  );
};
