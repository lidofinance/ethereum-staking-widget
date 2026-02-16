import { TokenWstethIcon } from 'assets/earn';
import { getTokenSymbol } from 'utils/getTokenSymbol';
import { useWstethUsd } from 'shared/hooks/use-wsteth-usd';
import { EthVaultRequest } from '../../components/request/request';
import { WithdrawRequestData } from '../types';

export const EthVaultWithdrawRequestClaimable = ({
  request,
  claim,
  isClaiming,
}: {
  request: WithdrawRequestData;
  claim: () => Promise<boolean>;
  isClaiming: boolean;
}) => {
  const { usdAmount } = useWstethUsd(request.assets);

  return (
    <EthVaultRequest
      key={request.timestamp}
      tokenLogo={<TokenWstethIcon />}
      tokenAmount={request.assets}
      tokenName={getTokenSymbol('wsteth')}
      tokenAmountUSD={usdAmount ?? 0}
      createdDateTimestamp={request.timestamp}
      actionText="Claim"
      actionCallback={claim}
      actionLoading={isClaiming}
    />
  );
};
