import { useWithdrawals } from 'features/withdrawals/contexts/withdrawals-context';

import Link from 'next/link';
import { Accordion } from '@lidofinance/lido-ui';

export const SeparateClaim: React.FC = () => {
  const { claimPath } = useWithdrawals();
  return (
    <Accordion summary="If I have several requests, can I claim them separately?">
      <p>
        Yes. You can choose the requests you want to claim in the ‘Request List’
        on the <Link href={claimPath}>Claim tab</Link>.
      </p>
    </Accordion>
  );
};
