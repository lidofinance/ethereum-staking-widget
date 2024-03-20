import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

import { WITHDRAWALS_CLAIM_PATH, WITHDRAWALS_REQUEST_PATH } from 'consts/urls';
import { LocalLink } from 'shared/components/local-link';

export const HowToWithdraw: FC = () => {
  return (
    <Accordion summary="How do I withdraw?">
      <p>
        Press the{' '}
        <LocalLink href={WITHDRAWALS_REQUEST_PATH}>Request tab</LocalLink>,
        choose an amount of stETH/wstETH to withdraw, then press ‘Request
        withdrawal’. Confirm the transaction using your wallet and press ‘Claim’
        on the <LocalLink href={WITHDRAWALS_CLAIM_PATH}>Claim tab</LocalLink>{' '}
        once it is ready.
      </p>
    </Accordion>
  );
};
