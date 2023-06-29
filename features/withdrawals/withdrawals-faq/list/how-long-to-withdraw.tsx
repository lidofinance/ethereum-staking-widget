import { useWithdrawals } from 'features/withdrawals/contexts/withdrawals-context';

import { NoBr } from '../styles';
import { Accordion } from '@lidofinance/lido-ui';
import { LocalLink } from 'shared/components/header/components/navigation/local-link';

export const HowLongToWithdraw: React.FC = () => {
  const { claimPath } = useWithdrawals();
  return (
    <Accordion summary="How long does it take to withdraw?">
      <p>
        Under normal circumstances, the stETH/wstETH withdrawal period can take
        anywhere between <NoBr>1-5 days</NoBr>. After that, you can claim your
        ETH using the&nbsp;
        <LocalLink href={claimPath}>Claim&nbsp;tab</LocalLink>.
      </p>
    </Accordion>
  );
};
