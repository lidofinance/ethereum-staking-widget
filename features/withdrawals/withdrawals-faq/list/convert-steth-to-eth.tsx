import { Accordion } from '@lidofinance/lido-ui';

import { useWithdrawals } from 'features/withdrawals/contexts/withdrawals-context';
import { LocalLink } from 'shared/components/header/components/navigation/local-link';

export const ConvertSTETHtoETH: React.FC = () => {
  const { requestPath, claimPath } = useWithdrawals();
  return (
    <Accordion summary="Can I transform my stETH to ETH?">
      <p>
        Yes. Stakers can transform their stETH to ETH 1:1 using the{' '}
        <LocalLink href={requestPath}>Request</LocalLink> and{' '}
        <LocalLink href={claimPath}>Claim</LocalLink> tabs.
      </p>
    </Accordion>
  );
};
