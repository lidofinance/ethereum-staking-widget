import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';
import { LocalLink } from 'shared/components/local-link';
import {
  WITHDRAWAL_CLAIM_PATH,
  WITHDRAWAL_REQUEST_PATH,
} from 'features/withdrawals/withdrawals-constants';

export const HowToWithdraw: FC = () => {
  return (
    <Accordion summary="How do I withdraw?">
      <p>
        Press the{' '}
        <LocalLink href={WITHDRAWAL_REQUEST_PATH}>Request tab</LocalLink>,
        choose an amount of stETH/wstETH to withdraw, then press ‘Request
        withdrawal’. Confirm the transaction using your wallet and press ‘Claim’
        on the <LocalLink href={WITHDRAWAL_CLAIM_PATH}>Claim tab</LocalLink>{' '}
        once it is ready.
      </p>
    </Accordion>
  );
};
