import { InlineLoader } from 'features/earn/shared/inline-loader';
import { TokenEarnUsdIcon } from 'assets/earn-v2';
import { UsdVaultRequest } from '../../components/request/request';
import { useUsdVaultPreviewWithdraw } from '../hooks/use-preview-withdraw';
import { USD_VAULT_TOKEN_SYMBOL } from '../../consts';
import type { WithdrawRequestData } from 'modules/mellow-meta-vaults/types/withdraw-request-data';

export const UsdVaultWithdrawRequestPending = ({
  request,
}: {
  request: WithdrawRequestData;
}) => {
  const { data, isLoading } = useUsdVaultPreviewWithdraw({
    shares: request.shares,
  });

  return (
    <InlineLoader isLoading={isLoading} fullWidth>
      <UsdVaultRequest
        key={request.timestamp}
        tokenLogo={<TokenEarnUsdIcon />}
        tokenAmount={request.shares}
        tokenName={USD_VAULT_TOKEN_SYMBOL}
        tokenAmountUSD={data?.usd ?? 0}
        createdDateTimestamp={request.timestamp}
      />
    </InlineLoader>
  );
};
