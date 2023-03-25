import { FC } from 'react';
import { Text } from '@lidofinance/lido-ui';
import { useEthPrice } from '@lido-sdk/react';
import { parseEther } from '@ethersproject/units';
import { BigNumber } from 'ethers';

import { weiToEth, isValidEtherValue } from 'utils';
import {
  useCurrentStethEthPrice,
  useWithdrawals,
} from 'features/withdrawals/hooks';

import { Option, OptionProps } from '../option';
import { TooltipWithdrawalAmount } from './lido-tooltip-withdrawal-amount';
import { OptionAmountWrap, OptionAmountRow } from '../styles';

import { FormatTokenStyled } from './styles';

type LidoProps = Pick<OptionProps, 'selected' | 'onClick'> & {
  inputValue?: string;
};

export const Lido: FC<LidoProps> = (props) => {
  const { selected, inputValue, ...rest } = props;
  const { isBunkerMode } = useWithdrawals();
  const { data } = useEthPrice();
  const stethEthPrice = useCurrentStethEthPrice();

  const isValidValue = inputValue && isValidEtherValue(inputValue);

  const usdPrice =
    isValidValue && data && !isNaN(Number(inputValue))
      ? data * weiToEth(parseEther(inputValue || '0'))
      : 0;

  const ethAmount = (stethEthPrice || BigNumber.from(1))?.mul(
    isValidValue && !isNaN(Number(inputValue))
      ? parseEther(inputValue || '0')
      : BigNumber.from(0),
  );

  const timeRange = isBunkerMode ? 'From 18 days' : '1 - 5 day(s)';

  const amount = (
    <OptionAmountWrap>
      <OptionAmountRow>
        <div>~&nbsp;</div>
        <FormatTokenStyled amount={ethAmount} symbol="ETH" />{' '}
        <TooltipWithdrawalAmount />
      </OptionAmountRow>
      <Text size={'xxs'} color={'secondary'}>
        ~ ${usdPrice.toLocaleString('en-EN')}
      </Text>
    </OptionAmountWrap>
  );

  return (
    <Option
      type="lido"
      title="Lido"
      timeRange={timeRange}
      selected={selected}
      {...rest}
    >
      {amount}
    </Option>
  );
};
