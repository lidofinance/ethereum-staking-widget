import { FC } from 'react';
import { Accordion, Link } from '@lidofinance/lido-ui';
import { WITHDRAWALS_CLAIM_PATH, WITHDRAWALS_REQUEST_PATH } from 'consts/urls';

export const CanITransformWstethToEth: FC = () => {
  return (
    <Accordion summary="Can I transform my wstETH to ETH?">
      <p>
        Yes. You can transform your wstETH to ETH using the{' '}
        <Link href={WITHDRAWALS_REQUEST_PATH}>Request</Link> and{' '}
        <Link href={WITHDRAWALS_CLAIM_PATH}>Claim</Link> tabs, trading platforms{' '}
        <Link href={WITHDRAWALS_REQUEST_PATH}>on Lido Withdrawal tab</Link>, or
        any other aggregator.
      </p>
    </Accordion>
  );
};
