import { InlineLoader } from 'features/earn/shared/inline-loader';
import { TokenStrethIcon } from 'assets/earn';
import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import { Request } from './stg-withdraw-request';
import type { WithdrawRequestData } from '../types';
import { useSTGPreviewWithdraw } from '../hooks/use-stg-preview-withdraw';

export const STGWithdrawRequestPending = ({
  request,
}: {
  request: WithdrawRequestData;
}) => {
  const { data, isLoading } = useSTGPreviewWithdraw({ shares: request.shares });

  return (
    <InlineLoader isLoading={isLoading} fullWidth>
      <Request
        key={request.timestamp}
        tokenLogo={<TokenStrethIcon />}
        tokenAmount={request.shares}
        tokenName={getTokenDisplayName('strETH')}
        tokenAmountUSD={data?.usd ?? 0}
        createdDateTimestamp={request.timestamp}
      />
    </InlineLoader>
  );
};
