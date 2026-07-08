import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

import { WITHDRAWALS_CLAIM_PATH, WITHDRAWALS_REQUEST_PATH } from 'consts/urls';
import { LocalLink } from 'shared/components/local-link';

export const ConvertWSTETHtoETH: FC = () => {
  return (
    <Accordion summary="Can I transform my wstETH to ETH?">
      <p>Yes, you can:</p>
      <ol>
        <li>
          transform your wstETH to ETH using the{' '}
          <LocalLink href={WITHDRAWALS_REQUEST_PATH}>Request</LocalLink> and{' '}
          <LocalLink href={WITHDRAWALS_CLAIM_PATH}>Claim</LocalLink> tabs. In
          that case note that, under the hood, wstETH will unwrap to stETH
          first, so your request or swap will be denominated in stETH
        </li>
        <li>swap wstETH via CowSwap</li>
      </ol>
    </Accordion>
  );
};
