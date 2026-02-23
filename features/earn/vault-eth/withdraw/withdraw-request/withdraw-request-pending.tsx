import { InlineLoader } from 'features/earn/shared/inline-loader';
import { TokenEarnEthIcon } from 'assets/earn-v2';
import { Request } from 'modules/mellow-meta-vaults/components/request';
import { useEthVaultPreviewWithdraw } from '../hooks/use-preview-withdraw';
import { ETH_VAULT_TOKEN_SYMBOL } from '../../consts';
import type { WithdrawRequestData } from 'modules/mellow-meta-vaults/types/withdraw-request-data';

export const EthVaultWithdrawRequestPending = ({
  request,
}: {
  request: WithdrawRequestData;
}) => {
  const { data, isLoading } = useEthVaultPreviewWithdraw({
    shares: request.shares,
  });

  return (
    <InlineLoader isLoading={isLoading} fullWidth>
      <Request
        key={request.timestamp}
        tokenLogo={<TokenEarnEthIcon />}
        tokenAmount={request.shares}
        tokenName={ETH_VAULT_TOKEN_SYMBOL}
        tokenAmountUSD={data?.usd}
        createdDateTimestamp={request.timestamp}
      />
    </InlineLoader>
  );
};
