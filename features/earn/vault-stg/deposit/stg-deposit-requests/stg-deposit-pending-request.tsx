import {
  TokenEthIcon32,
  TokenWethIcon32,
  TokenWstethIcon32,
} from 'assets/earn';
import { STGRequest } from '../../components/stg-request/stg-request';
import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import { DepositRequest } from '../hooks/use-stg-deposit-requests';

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
