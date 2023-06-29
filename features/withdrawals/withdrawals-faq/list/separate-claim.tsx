import { useWithdrawals } from 'features/withdrawals/contexts/withdrawals-context';

import { Accordion } from '@lidofinance/lido-ui';
import { LocalLink } from 'shared/components/header/components/navigation/local-link';

export const SeparateClaim: React.FC = () => {
  const { claimPath } = useWithdrawals();
  return (
    <Accordion summary="If I have several requests, can I claim them separately?">
      <p>
        Yes. You can choose the requests you want to claim in the ‘Request List’
        on the <LocalLink href={claimPath}>Claim tab</LocalLink>.
      </p>
    </Accordion>
  );
};
