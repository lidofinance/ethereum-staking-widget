import {
  TokenEthIcon32,
  TokenWethIcon32,
  TokenWstethIcon32,
} from 'assets/earn';
import type { DepositRequest } from 'modules/mellow-meta-vaults/hooks/use-deposit-requests';
import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import { EthVaultRequest } from '../../components/request/request';

const getTokenIcon = (tokenType: string) => {
  switch (tokenType) {
    case 'ETH':
      return <TokenEthIcon32 />;
    case 'wETH':
      return <TokenWethIcon32 />;
    case 'wstETH':
      return <TokenWstethIcon32 />;
    default:
      return <TokenEthIcon32 />;
  }
};

export type DepositPendingRequestProps = {
  request: DepositRequest;
  usdAmount: number;
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

  // We don't want to show claimable requests
  if (!request || isClaimable) {
    return null;
  }

  return (
    <EthVaultRequest
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
