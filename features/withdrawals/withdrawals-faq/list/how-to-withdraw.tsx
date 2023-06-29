import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';
import { useWithdrawals } from 'features/withdrawals/contexts/withdrawals-context';
import { LocalLink } from 'shared/components/header/components/navigation/local-link';

export const HowToWithdraw: FC = () => {
  const { requestPath, claimPath } = useWithdrawals();
  return (
    <Accordion summary="How do I withdraw?">
      <p>
        Press the <LocalLink href={requestPath}>Request tab</LocalLink>, choose
        an amount of stETH/wstETH to withdraw, then press ‘Request withdrawal’.
        Confirm the transaction using your wallet and press ‘Claim’ on the{' '}
        <LocalLink href={claimPath}>Claim tab</LocalLink> once it is ready.
      </p>
    </Accordion>
  );
};
