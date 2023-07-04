import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';
import { LocalLink } from 'shared/components/header/components/navigation/local-link';
import {
  WITHDRAWAL_CLAIM_PATH,
  WITHDRAWAL_REQUEST_PATH,
} from 'features/withdrawals/withdrawals-constants';

export const ConvertWSTETHtoETH: FC = () => {
  return (
    <Accordion summary="Can I transform my wstETH to ETH?">
      <p>
        Yes. You can transform your wstETH to ETH using the{' '}
        <LocalLink href={WITHDRAWAL_REQUEST_PATH}>Request</LocalLink> and{' '}
        <LocalLink href={WITHDRAWAL_CLAIM_PATH}>Claim</LocalLink> tabs. Note
        that, under the hood, wstETH will unwrap to stETH first, so your request
        will be denominated in stETH.
      </p>
    </Accordion>
  );
};
