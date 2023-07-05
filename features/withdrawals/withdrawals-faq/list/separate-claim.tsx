import { Accordion } from '@lidofinance/lido-ui';
import { LocalLink } from 'shared/components/local-link';
import { WITHDRAWAL_CLAIM_PATH } from 'features/withdrawals/withdrawals-constants';

export const SeparateClaim: React.FC = () => {
  return (
    <Accordion summary="If I have several requests, can I claim them separately?">
      <p>
        Yes. You can choose the requests you want to claim in the ‘Request List’
        on the <LocalLink href={WITHDRAWAL_CLAIM_PATH}>Claim tab</LocalLink>.
      </p>
    </Accordion>
  );
};
