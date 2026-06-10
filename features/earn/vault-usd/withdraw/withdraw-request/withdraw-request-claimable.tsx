import { TokenUsdcIcon } from 'assets/earn-v2';
import { useUsdcToUsd } from 'shared/hooks/use-usdc-to-usd';
import type { WithdrawRequestData } from 'modules/mellow-meta-vaults/types/withdraw-request-data';
import { getTokenSymbol } from 'utils/get-token-symbol';
import { Request } from 'modules/mellow-meta-vaults/components/request';

export const UsdVaultWithdrawRequestClaimable = ({
  request,
  claim,
  isClaiming,
}: {
  request: WithdrawRequestData;
  claim: () => Promise<boolean>;
  isClaiming: boolean;
}) => {
  const { usdAmount } = useUsdcToUsd(request.assets);

  return (
    <Request
      key={request.timestamp}
      tokenLogo={<TokenUsdcIcon />}
      tokenAmount={request.assets}
      tokenName={getTokenSymbol('usdc')}
      tokenAmountUSD={usdAmount}
      actionText="Claim"
      actionCallback={claim}
      actionLoading={isClaiming}
    />
  );
};
