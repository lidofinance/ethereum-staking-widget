import Link from 'next/link';
import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';
import { useWithdrawals } from 'features/withdrawals/contexts/withdrawals-context';

export const HowToWithdraw: FC = () => {
  const { requestPath, claimPath } = useWithdrawals();
  return (
    <Accordion summary="How do I withdraw?">
      <p>
        Press the <Link href={requestPath}>Request tab</Link>, choose an amount
        of stETH/wstETH to withdraw, then press ‘Request withdrawal’. Confirm
        the transaction using your wallet and press ‘Claim’ on the{' '}
        <Link href={claimPath}>Claim tab</Link> once it is ready.
      </p>
    </Accordion>
  );
};
