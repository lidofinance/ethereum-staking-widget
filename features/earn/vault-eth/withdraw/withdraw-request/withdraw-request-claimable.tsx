import { TokenWstethScalableIcon } from 'assets/earn';
import { getTokenSymbol } from 'utils/get-token-symbol';
import { useWstethUsd } from 'shared/hooks/use-wsteth-usd';
import { Request } from 'modules/mellow-meta-vaults/components/request';
import type { WithdrawRequestData } from 'modules/mellow-meta-vaults/types/withdraw-request-data';

export const EthVaultWithdrawRequestClaimable = ({
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
    <Request
      key={request.timestamp}
      tokenLogo={<TokenWstethScalableIcon />}
      tokenAmount={request.assets}
      tokenName={getTokenSymbol('wsteth')}
      tokenAmountUSD={usdAmount}
      createdDateTimestamp={request.timestamp}
      actionText="Claim"
      actionCallback={claim}
      actionLoading={isClaiming}
    />
  );
};
