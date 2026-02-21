import {
  TokenEthIcon32,
  TokenWethIcon32,
  TokenWstethIcon32,
} from 'assets/earn';
import type { DepositRequest } from 'modules/mellow-meta-vaults/hooks/use-deposit-requests';
import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import { UsdVaultRequest } from '../../components/request/request';

const getTokenIcon = (_token: string) => {
  const token = _token.toLowerCase();
  switch (token) {
    case 'eth':
      return <TokenEthIcon32 />;
    case 'weth':
      return <TokenWethIcon32 />;
    case 'wsteth':
      return <TokenWstethIcon32 />;
    default:
      return <></>;
  }
};

export type DepositPendingRequestProps = {
  request: DepositRequest;
  usdAmount: number;
  isLoading?: boolean;
  onCancel?: () => void;
};

export const UsdVaultDepositPendingRequest = ({
  request,
  usdAmount,
  isLoading = false,
  onCancel = () => void 0,
}: DepositPendingRequestProps) => {
  const { assets, token, isClaimable } = request;

  // We don't want to show claimable requests
  if (!request || isClaimable) {
    return null;
  }

  return (
    <UsdVaultRequest
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
