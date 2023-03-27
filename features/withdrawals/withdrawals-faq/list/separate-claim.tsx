import Link from 'next/link';
import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';
import { useWithdrawals } from 'features/withdrawals/hooks';

export const SeparateClaim: FC = () => {
  const { claimPath } = useWithdrawals();
  return (
    <Accordion summary="If I have several requests, can I claim them separately?">
      <p>
        Yes. You can choose the requests you want to claim in the Request List
        on the ’<Link href={claimPath}>Claim</Link>’ tab.
      </p>
    </Accordion>
  );
};
