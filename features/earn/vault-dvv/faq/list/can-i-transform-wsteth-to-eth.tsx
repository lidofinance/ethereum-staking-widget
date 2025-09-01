import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';
import { WITHDRAWALS_CLAIM_PATH, WITHDRAWALS_REQUEST_PATH } from 'consts/urls';
import { LocalLink } from 'shared/components/local-link';

export const CanITransformWstethToEth: FC = () => {
  return (
    <Accordion summary="Can I transform my wstETH to ETH?">
      <p>
        Yes. You can transform your wstETH to ETH using the{' '}
        <LocalLink href={WITHDRAWALS_REQUEST_PATH}>Request</LocalLink> and{' '}
        <LocalLink href={WITHDRAWALS_CLAIM_PATH}>Claim</LocalLink> tabs, trading
        platforms on{' '}
        <LocalLink href={WITHDRAWALS_REQUEST_PATH}>
          Lido Withdrawal tab
        </LocalLink>
        , or any other aggregator.
      </p>
    </Accordion>
  );
};
