import Link from 'next/link';

import { InfoBoxStyled } from 'features/withdrawals/shared';
import { useWithdrawals } from 'features/withdrawals/hooks';

import { LinkWrapperStyled } from './styles';

export const Info = () => {
  const { claimPath } = useWithdrawals();

  return (
    <InfoBoxStyled>
      Most often withdrawal period takes from 1-5 days to process. Withdrawal
      period depends on several reasons. After that you can claim ETH and
      rewards in{' '}
      <LinkWrapperStyled>
        <Link href={claimPath}>Claim tab</Link>
      </LinkWrapperStyled>
      . Please note that stETH/wstETH while withdrawal period won’t generate
      rewards.
    </InfoBoxStyled>
  );
};
