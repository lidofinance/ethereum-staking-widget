import { BigNumber } from 'ethers';
import { Accordion } from '@lidofinance/lido-ui';

import { config } from 'config';
import { useWithdrawals } from 'features/withdrawals/contexts/withdrawals-context';
import { weiToEth } from 'utils';

const formatAmount = (value: number | undefined) =>
  value
    ? value.toLocaleString(config.LOCALE, { maximumFractionDigits: 18 })
    : '...';

export const UnstakeAmountBoundaries: React.FC = () => {
  const { maxAmount, minAmount } = useWithdrawals();
  const minAmountDisplay = formatAmount(Number(minAmount));
  // TODO: NEW SDK
  const maxAmountDisplay = formatAmount(
    maxAmount ? Number(weiToEth(BigNumber.from(maxAmount))) : undefined,
  );

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
