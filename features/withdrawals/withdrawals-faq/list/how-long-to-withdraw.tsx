import Link from 'next/link';
import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';
import { useWithdrawals } from 'features/withdrawals/hooks';

export const HowLongToWithdraw: FC = () => {
  const { claimPath } = useWithdrawals();
  return (
    <Accordion summary="How long does it take to withdraw?">
      <p>
        Most often, the stETH/wstETH withdrawal period will be 1-5 days. After
        that, you can claim your ETH using the{' '}
        <Link href={claimPath}>Claim</Link> tab.
      </p>
    </Accordion>
  );
};
