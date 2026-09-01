import { useStableToUsd } from 'shared/hooks/use-stable-to-usd';
import { getTokenSymbol } from 'utils/get-token-symbol';
import { getTokenIcon } from 'utils/get-token-icon';
import { getTokenDecimals } from 'utils/token-decimals';
import { Request } from 'modules/mellow-meta-vaults/components/request';
import type { UsdVaultWithdrawRequest } from '../types';

export const UsdVaultWithdrawRequestClaimable = ({
  request,
  claim,
  isClaiming,
}: {
  request: UsdVaultWithdrawRequest;
  claim: () => Promise<boolean>;
  isClaiming: boolean;
}) => {
  const symbol = getTokenSymbol(request.token);
  const { usdAmount } = useStableToUsd(
    request.assets,
    getTokenDecimals(symbol),
  );

  return (
    <Request
      tokenLogo={getTokenIcon(request.token)}
      tokenAmount={request.assets}
      tokenName={symbol}
      tokenAmountUSD={usdAmount}
      actionText="Claim"
      actionCallback={claim}
      actionLoading={isClaiming}
    />
  );
};
