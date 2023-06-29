import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';
import { useWithdrawals } from 'features/withdrawals/contexts/withdrawals-context';
import { LocalLink } from 'shared/components/header/components/navigation/local-link';

export const ConvertWSTETHtoETH: FC = () => {
  const { requestPath, claimPath } = useWithdrawals();
  return (
    <Accordion summary="Can I transform my wstETH to ETH?">
      <p>
        Yes. You can transform your wstETH to ETH using the{' '}
        <LocalLink href={requestPath}>Request</LocalLink> and{' '}
        <LocalLink href={claimPath}>Claim</LocalLink> tabs. Note that, under the
        hood, wstETH will unwrap to stETH first, so your request will be
        denominated in stETH.
      </p>
    </Accordion>
  );
};
