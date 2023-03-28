import { FC } from 'react';
import { Text } from '@lidofinance/lido-ui';
import { useEthPrice } from '@lido-sdk/react';
import { BigNumber } from 'ethers';

import { weiToEth } from 'utils';
import {
  useEthAmountByStethWsteth,
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
  const { isBunkerMode, isSteth } = useWithdrawals();
  const { data } = useEthPrice();
  const ethAmount = useEthAmountByStethWsteth({ isSteth, input: inputValue });

  const usdPrice = data ? data * weiToEth(ethAmount || BigNumber.from(0)) : 0;

  const timeRange = isBunkerMode ? 'Not estimated' : '1 - 5 day(s)';

  const amount = (
    <OptionAmountWrap>
      <OptionAmountRow>
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
