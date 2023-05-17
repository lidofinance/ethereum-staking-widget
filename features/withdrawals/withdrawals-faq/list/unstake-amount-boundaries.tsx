import { useWithdrawalsBaseData } from 'features/withdrawals/hooks';

import { Accordion } from '@lidofinance/lido-ui';

import { weiToEth } from 'utils';
import { LOCALE } from 'config';

const formatAmount = (value: number | undefined) =>
  value ? value.toLocaleString(LOCALE, { maximumFractionDigits: 18 }) : '...';

export const UnstakeAmountBoundaries: React.FC = () => {
  const wqBaseData = useWithdrawalsBaseData();
  const { maxAmount, minAmount } = wqBaseData.data ?? {};

  const minAmountDisplay = formatAmount(Number(minAmount));
  const maxAmountDisplay = formatAmount(maxAmount && weiToEth(maxAmount));

  return (
    <Accordion summary="Is there any minimum or maximum amount of stETH/wstETH I can withdraw?">
      <p>
        Request size should be at least {minAmountDisplay} wei (in stETH), and
        at most {maxAmountDisplay} stETH.
      </p>
      <p>
        If you want to withdraw more than {maxAmountDisplay} stETH, your
        withdrawal request will be split into several requests, but you will
        still only pay one transaction fee.
      </p>
    </Accordion>
  );
};
