import { Accordion } from '@lidofinance/lido-ui';

import {
  WITHDRAWAL_REQUEST_PATH,
  WITHDRAWAL_CLAIM_PATH,
} from 'features/withdrawals/withdrawals-constants';
import { LocalLink } from 'shared/components/local-link';

export const ConvertSTETHtoETH: React.FC = () => {
  return (
    <Accordion summary="Can I transform my stETH to ETH?">
      <p>
        Yes. Stakers can transform their stETH to ETH 1:1 using the{' '}
        <LocalLink href={WITHDRAWAL_REQUEST_PATH}>Request</LocalLink> and{' '}
        <LocalLink href={WITHDRAWAL_CLAIM_PATH}>Claim</LocalLink> tabs.
      </p>
    </Accordion>
  );
};
