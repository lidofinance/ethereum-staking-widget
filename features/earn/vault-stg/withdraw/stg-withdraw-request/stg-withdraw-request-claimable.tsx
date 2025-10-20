import { TokenWstethIcon } from 'assets/earn';
import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import { STGRequest } from '../../components/stg-request/stg-request';
import { WithdrawRequestData } from '../types';
import { useWstethUsd } from 'shared/hooks/use-wsteth-usd';

export const STGWithdrawRequestClaimable = ({
  request,
  claim,
  isClaiming,
}: {
  request: WithdrawRequestData;
  claim: () => Promise<boolean>;
  isClaiming: boolean;
}) => {
  const { usdAmount } = useWstethUsd(request.assets);

  return (
    <STGRequest
      key={request.timestamp}
      tokenLogo={<TokenWstethIcon />}
      tokenAmount={request.assets}
      tokenName={getTokenDisplayName('wstETH')}
      tokenAmountUSD={usdAmount ?? 0}
      createdDateTimestamp={request.timestamp}
      actionText="Claim"
      actionCallback={claim}
      actionLoading={isClaiming}
    />
  );
};
