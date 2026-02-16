import { InlineLoader } from 'features/earn/shared/inline-loader';
import { TokenEarnethIcon } from 'assets/earn-v2';
import { EthVaultRequest } from '../../components/request/request';
import { useEthVaultPreviewWithdraw } from '../hooks/use-preview-withdraw';
import { ETH_VAULT_TOKEN_SYMBOL } from '../../consts';
import type { WithdrawRequestData } from '../types';

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
      <EthVaultRequest
        key={request.timestamp}
        tokenLogo={<TokenEarnethIcon />}
        tokenAmount={request.shares}
        tokenName={ETH_VAULT_TOKEN_SYMBOL}
        tokenAmountUSD={data?.usd ?? 0}
        createdDateTimestamp={request.timestamp}
      />
    </InlineLoader>
  );
};
