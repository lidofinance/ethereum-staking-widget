import { TokenWstethIcon } from 'assets/earn';
import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import { Request } from './stg-withdraw-request';
import { WithdrawRequestData } from '../types';
import { useSTGWithdrawClaim } from '../hooks/use-stg-withdraw-claim';
import { useWstethUsd } from 'shared/hooks/use-wsteth-usd';

export const STGWithdrawRequestClaimable = ({
  request,
}: {
  request: WithdrawRequestData;
}) => {
  const { withdrawClaim } = useSTGWithdrawClaim();
  const { usdAmount } = useWstethUsd(request.assets);

  return (
    <Request
      key={request.timestamp}
      tokenLogo={<TokenWstethIcon />}
      tokenAmount={request.assets}
      tokenName={getTokenDisplayName('wstETH')}
      tokenAmountUSD={usdAmount ?? 0}
      createdDateTimestamp={request.timestamp}
      actionText="Claim"
      actionCallback={() =>
        withdrawClaim({
          amount: request.assets,
          timestamp: Number(request.timestamp),
        })
      }
    />
  );
};
