import { STGRequest } from '../../components/stg-request/stg-request';
import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import { DepositRequest } from '../hooks/use-stg-deposit-requests';
import { getTokenIcon } from 'utils/get-token-icon';

export type STGDepositPendingRequestProps = {
  request: DepositRequest;
  usdAmount: number;
  isLoading?: boolean;
  onCancel?: () => void;
};

export const STGDepositPendingRequest = ({
  request,
  usdAmount,
  isLoading = false,
  onCancel = () => void 0,
}: STGDepositPendingRequestProps) => {
  const { assets, token, isClaimable } = request;

  // We don't want to show claimable requests
  if (!request || isClaimable) {
    return null;
  }

  return (
    <STGRequest
      key={token}
      tokenLogo={getTokenIcon(token)}
      tokenAmount={assets}
      tokenName={getTokenDisplayName(token)}
      tokenAmountUSD={usdAmount}
      createdDateTimestamp={request.createdTimestamp}
      actionText="Cancel"
      actionCallback={onCancel}
      actionLoading={isLoading}
      actionButtonVariant="link-alike"
    />
  );
};
