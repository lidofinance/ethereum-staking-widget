import { parseEther } from '@ethersproject/units';
import { BigNumber } from 'ethers';

import { Option, OptionProps } from '../option';

import { FormatTokenStyled } from './styles';

type OneinchProps = Pick<OptionProps, 'selected' | 'onClick'> & {
  inputValue?: string;
};

export const Oneinch: React.FC<OneinchProps> = ({
  selected,
  inputValue,
  ...rest
}: OneinchProps) => {
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
