import { FC } from 'react';
import type { BigNumber } from 'ethers';
import { Accordion } from '@lidofinance/lido-ui';
import { useWithdrawalsConstants } from 'features/withdrawals/hooks';
import { weiToEth } from 'utils';
import { LOCALE } from 'config';

const formatAmount = (value: BigNumber | undefined) =>
  value
    ? weiToEth(value).toLocaleString(LOCALE, {
        maximumFractionDigits: 18,
      })
    : '...';

export const UnstakeAmountBoundaries: FC = () => {
  const { minAmount, maxAmount } = useWithdrawalsConstants();

  const minAmountDisplay = formatAmount(minAmount);
  const maxAmountDisplay = formatAmount(maxAmount);

  return (
    <Accordion summary="Is there any minimum or maximum amount of stETH I can unstake?">
      <p>
        The minimum amount to withdraw is {minAmountDisplay} stETH, and the
        maximum amount is {maxAmountDisplay} stETH.
      </p>
      <p>
        If you want to withdraw more than {maxAmountDisplay} stETH, your request
        withdrawal will be divided into several requests (you will still only
        pay one transaction fee).
      </p>
    </Accordion>
  );
};
