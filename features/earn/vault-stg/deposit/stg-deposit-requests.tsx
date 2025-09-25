import { useSTGCollect } from '../hooks/use-stg-collect';
import {
  ActionableTitle,
  RequestsContainer,
  Request,
} from '../withdraw/stg-withdraw-request';
import { TokenEthIcon32 } from 'assets/earn';
import { getTokenDisplayName } from 'utils/getTokenDisplayName';

export const STGDepositRequests = () => {
  const { data } = useSTGCollect();
  const deposits = data?.deposits;

  if (!deposits || deposits.length === 0) return null;

  return (
    <RequestsContainer>
      <ActionableTitle>Pending deposit request</ActionableTitle>
      {deposits.map((deposit) => (
        <Request
          key={deposit.eta}
          tokenLogo={<TokenEthIcon32 />}
          tokenAmount={deposit.assets}
          tokenName={getTokenDisplayName('ETH')}
          tokenAmountUSD={0}
          createdDateTimestamp={deposit.eta}
          actionText="Cancel"
          actionCallback={() => void 0}
        />
      ))}
    </RequestsContainer>
  );
};
