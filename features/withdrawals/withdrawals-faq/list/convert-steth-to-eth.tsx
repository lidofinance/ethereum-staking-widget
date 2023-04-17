import { useWithdrawals } from 'features/withdrawals/contexts/withdrawals-context';

import Link from 'next/link';
import { Accordion } from '@lidofinance/lido-ui';

export const ConvertSTETHtoETH: React.FC = () => {
  const { requestPath, claimPath } = useWithdrawals();
  return (
    <Accordion summary="Can I transform my stETH to ETH?">
      <p>
        Yes. Stakers can transform their stETH to ETH 1:1 using the{' '}
        <Link href={requestPath}>Request</Link> and{' '}
        <Link href={claimPath}>Claim</Link> tabs.
      </p>
    </Accordion>
  );
};
