import Link from 'next/link';

import { InfoBoxStyled } from 'features/withdrawals/shared';
import { useWithdrawals } from 'features/withdrawals/hooks';
import { LinkWrapperStyled } from './styles';

export const Info = () => {
  const { requestPath } = useWithdrawals();

  return (
    <InfoBoxStyled>
      You will be able to claim your reward after withdrawal request has been
      processed. To withdraw your amount go to{' '}
      <LinkWrapperStyled>
        <Link href={requestPath}>Request tab</Link>
      </LinkWrapperStyled>
    </InfoBoxStyled>
  );
};
