import Link from 'next/link';

import { InfoBoxStyled } from 'features/withdrawals/shared';
import { useWithdrawals } from 'features/withdrawals/hooks';

import { LinkWrapperStyled } from './styles';

export const Info = () => {
  const { claimPath } = useWithdrawals();

  return (
    <InfoBoxStyled>
      Most often withdrawal period takes 1-5 days to process. After that you can
      claim your rewards in{' '}
      <LinkWrapperStyled>
        <Link href={claimPath}>Claim tab</Link>
      </LinkWrapperStyled>
      . Please note, that tokens in the withdrawal request will not generate
      rewards and if slashing will happen, the amount of rewards can be lower.
    </InfoBoxStyled>
  );
};
