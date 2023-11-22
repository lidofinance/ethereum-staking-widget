import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

import { WITHDRAWALS_CLAIM_PATH } from 'config/urls';
import { LocalLink } from 'shared/components/local-link';

import { NoBr } from '../styles';

export const HowLongToWithdraw: FC = () => {
  return (
    <Accordion summary="How long does it take to withdraw?">
      <p>
        Under normal circumstances, the stETH/wstETH withdrawal period can take
        anywhere between <NoBr>1-5 days</NoBr>. After that, you can claim your
        ETH using the&nbsp;
        <LocalLink href={WITHDRAWALS_CLAIM_PATH}>Claim&nbsp;tab</LocalLink>.
      </p>
    </Accordion>
  );
};
