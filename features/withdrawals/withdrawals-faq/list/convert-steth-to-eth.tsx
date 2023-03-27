import Link from 'next/link';
import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';
import { useWithdrawals } from 'features/withdrawals/hooks';

export const ConvertSTETHtoETH: FC = () => {
  const { requestPath, claimPath } = useWithdrawals();
  return (
    <Accordion summary="Can I convert my stETH to ETH?">
      <p>
        Yes. Stakers can convert their stETH to ETH 1:1 using the ‘
        <Link href={requestPath}>Request</Link>’ and ‘
        <Link href={claimPath}>Claim</Link>’ tabs.
      </p>
    </Accordion>
  );
};
