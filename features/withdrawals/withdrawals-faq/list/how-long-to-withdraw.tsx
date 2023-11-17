import { NoBr } from '../styles';
import { Accordion } from '@lidofinance/lido-ui';
import { LocalLink } from 'shared/components/local-link';
import {
  WITHDRAWAL_CLAIM_PATH,
  WITHDRAWAL_PERIOD_PATH,
  WITHDRAWAL_REQUEST_PATH,
} from 'features/withdrawals/withdrawals-constants';

export const HowLongToWithdraw: React.FC = () => {
  return (
    <Accordion summary="How long does it take to withdraw?">
      <p>
        Under normal circumstances, the stETH/wstETH withdrawal period can take
        anywhere between <NoBr>1-5 days</NoBr>. After that, you can claim your
        ETH using the&nbsp;
        <LocalLink href={WITHDRAWAL_CLAIM_PATH}>Claim&nbsp;tab</LocalLink>. On{' '}
        <LocalLink href={WITHDRAWAL_REQUEST_PATH}>
          Request&nbsp;tabtab
        </LocalLink>{' '}
        interface, you can see the current estimation of the withdrawal waiting
        time for new requests. The withdrawal request time depends on the
        requested amount, the overall amount of stETH in the queue, and{' '}
        <LocalLink href={WITHDRAWAL_PERIOD_PATH}>other&nbsp;factors</LocalLink>.
      </p>
    </Accordion>
  );
};
