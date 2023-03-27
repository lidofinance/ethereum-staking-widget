import Link from 'next/link';
import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';
import { useWithdrawals } from 'features/withdrawals/hooks';

export const ConvertWSTETHtoETH: FC = () => {
  const { requestPath, claimPath } = useWithdrawals();
  return (
    <Accordion summary="Can I convert my wstETH to ETH?">
      <p>
        Yes. Convert your wstETH to ETH using the{' '}
        <Link href={requestPath}>Request</Link> and{' '}
        <Link href={claimPath}>Claim</Link> tabs.
      </p>
    </Accordion>
  );
};
