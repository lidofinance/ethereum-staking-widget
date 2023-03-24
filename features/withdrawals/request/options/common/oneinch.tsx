import { FC } from 'react';
import { Text } from '@lidofinance/lido-ui';
import { FormatToken } from 'shared/formatters';
import { parseEther } from '@ethersproject/units';
import { BigNumber } from 'ethers';

import { Option, OptionProps } from '../option';

import { FormatTokenStyled } from './styles';

type OneinchProps = Pick<OptionProps, 'selected' | 'onClick'> & {
  inputValue?: string;
};

export const Oneinch: FC<OneinchProps> = (props) => {
  const { selected, inputValue, ...rest } = props;

  const amount = (
    <>
      <FormatTokenStyled
        amount={
          !isNaN(Number(inputValue))
            ? parseEther(inputValue || '0')
            : BigNumber.from(0)
        }
        symbol="ETH"
      />
      <Text size={'xxs'} color={'secondary'}>
        ~ $
        <FormatToken
          amount={
            !isNaN(Number(inputValue))
              ? parseEther(inputValue || '0')
              : BigNumber.from(0)
          }
          symbol=""
        />
      </Text>
    </>
  );

  return (
    <Option
      type="oneinch"
      title="1inch"
      timeRange="1 minute"
      selected={selected}
      {...rest}
    >
      {amount}
    </Option>
  );
};
