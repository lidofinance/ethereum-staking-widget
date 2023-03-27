import Link from 'next/link';
import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';
import { useWithdrawals } from 'features/withdrawals/hooks';

export const HowToWithdraw: FC = () => {
  const { requestPath, claimPath } = useWithdrawals();
  return (
    <Accordion summary="How do I withdraw?">
      <p>
        Press the <Link href={requestPath}>Request tab</Link>, choose the amount
        of stETH to withdraw and press confirm. Confirm the transaction using
        your wallet and press <Link href={claimPath}>Claim tab</Link> once
        ready.
      </p>
    </Accordion>
  );
};
