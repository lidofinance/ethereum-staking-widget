import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';
import { useWithdrawalsConstants } from 'features/withdrawals/hooks';
import { formatEther } from '@ethersproject/units';

export const UnstakeAmountBoundaries: FC = () => {
  const { minAmount, maxAmount } = useWithdrawalsConstants();
  return (
    <Accordion summary="Is there any minimum or maximum amount of stETH I can unstake?">
      <p>
        The minimum amount to withdraw is{' '}
        {minAmount ? formatEther(minAmount) : '...'} stETH, and the maximum
        amount is 1000 stETH.
      </p>
      <p>
        If you want to withdraw more than{' '}
        {maxAmount ? formatEther(maxAmount) : '...'} stETH, your request
        withdrawal will be divided into several requests (you will still only
        pay one transaction fee).
      </p>
    </Accordion>
  );
};
