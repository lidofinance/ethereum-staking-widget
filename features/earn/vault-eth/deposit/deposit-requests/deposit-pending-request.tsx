import invariant from 'tiny-invariant';
import type { DepositRequest } from 'modules/mellow-meta-vaults/hooks/use-deposit-requests';
import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import { Request } from 'modules/mellow-meta-vaults/components/request';
import { getTokenIcon } from 'utils/get-token-icon';

export type DepositPendingRequestProps = {
  request: DepositRequest;
  usdAmount?: number;
  isLoading?: boolean;
  onCancel?: () => void;
};

export const EthVaultDepositPendingRequest = ({
  request,
  usdAmount,
  isLoading = false,
  onCancel = () => void 0,
}: DepositPendingRequestProps) => {
  const { assets, token, isClaimable } = request;
  invariant(
    isClaimable === false,
    'Claimable deposit request should not be displayed as pending',
  );

  return (
    <Request
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
