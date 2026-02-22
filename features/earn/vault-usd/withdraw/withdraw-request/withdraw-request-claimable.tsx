import { TokenUsdcIcon } from 'assets/earn-v2';
import { useUsdcUsd } from 'shared/hooks/use-usdc-usd';
import type { WithdrawRequestData } from 'modules/mellow-meta-vaults/types/withdraw-request-data';
import { getTokenSymbol } from 'utils/getTokenSymbol';
import { UsdVaultRequest } from '../../components/request/request';

export const UsdVaultWithdrawRequestClaimable = ({
  request,
  claim,
  isClaiming,
}: {
  request: WithdrawRequestData;
  claim: () => Promise<boolean>;
  isClaiming: boolean;
}) => {
  const { usdAmount } = useUsdcUsd(request.assets);

  return (
    <UsdVaultRequest
      key={request.timestamp}
      tokenLogo={<TokenUsdcIcon />}
      tokenAmount={request.assets}
      tokenName={getTokenSymbol('usdc')}
      tokenAmountUSD={usdAmount ?? 0}
      createdDateTimestamp={request.timestamp}
      actionText="Claim"
      actionCallback={claim}
      actionLoading={isClaiming}
    />
  );
};
