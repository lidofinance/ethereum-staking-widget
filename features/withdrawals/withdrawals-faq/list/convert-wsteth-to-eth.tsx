import Link from 'next/link';
import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';
import { useWithdrawals } from 'features/withdrawals/hooks';

export const ConvertWSTETHtoETH: FC = () => {
  const { requestPath, claimPath } = useWithdrawals();
  return (
    <Accordion summary="Can I transform my wstETH to ETH?">
      <p>
        Yes. You can transform your wstETH to ETH using the{' '}
        <Link href={requestPath}>Request</Link> and{' '}
        <Link href={claimPath}>Claim</Link> tabs. Note that, under the hood,
        wstETH will unwrap to stETH first, so your request will be denominated
        in stETH.
      </p>
    </Accordion>
  );
};
