import { Accordion } from '@lidofinance/lido-ui';
import { WITHDRAWAL_PERIOD_PATH } from '../../withdrawals-constants';
import Link from 'next/link';

export const WhyWaitingTimeChanged: React.FC = () => {
  return (
    <Accordion summary="Why my waiting time changed after I submitted the withdrawal request?">
      <p>
        The waiting time could be changed due to{' '}
        <Link href={WITHDRAWAL_PERIOD_PATH}>several&nbsp;factors</Link>{' '}
        affecting waiting time. That&apos;s why it may either increase or
        decrease.
      </p>
    </Accordion>
  );
};
