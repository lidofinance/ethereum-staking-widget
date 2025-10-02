import { Request } from '../../withdraw/stg-withdraw-request';
import {
  TokenEthIcon32,
  TokenWethIcon32,
  TokenWstethIcon32,
} from 'assets/earn';
import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import { DepositRequestData } from '../hooks/use-stg-deposit-request-data';

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

export const STGDepositPendingRequest = ({
  depositRequestData,
  onCancel = () => void 0,
  isLoading = false,
}: {
  depositRequestData: DepositRequestData;
  onCancel?: () => void;
  isLoading?: boolean;
}) => {
  const {
    depositRequest,
    assets,
    usdAmount,
    token: tokenType,
    isPushedToVault,
  } = depositRequestData;

  // We don't want to show requests that are already pushed to the vault
  if (!depositRequest || isPushedToVault) {
    return null;
  }

  return (
    <Request
      key={depositRequest.timestamp}
      tokenLogo={getTokenIcon(tokenType)}
      tokenAmount={assets}
      tokenName={getTokenDisplayName(tokenType)}
      tokenAmountUSD={usdAmount ?? 0}
      createdDateTimestamp={depositRequest.timestamp}
      actionText="Cancel"
      actionCallback={onCancel}
      actionLoading={isLoading}
      actionButtonVariant="link-alike"
    />
  );
};
