import {
  ActionableTitle,
  RequestsContainer,
  Request,
} from '../withdraw/stg-withdraw-request';
import {
  TokenEthIcon32,
  TokenStrethIcon,
  TokenWethIcon32,
  TokenWstethIcon32,
} from 'assets/earn';
import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import { useSTGDepositRequest } from './hooks/use-stg-deposit-request';
import { useWstethUsd } from 'shared/hooks/use-wsteth-usd';
import { useEthUsd } from 'shared/hooks/use-eth-usd';

export const STGDepositRequests = () => {
  const {
    depositRequest: depositRequestETH,
    claimableShares: claimableSharesETH,
  } = useSTGDepositRequest('ETH');
  const {
    depositRequest: depositRequestWETH,
    claimableShares: claimableSharesWETH,
  } = useSTGDepositRequest('wETH');
  const {
    depositRequest: depositRequestWSTETH,
    claimableShares: claimableSharesWSTETH,
  } = useSTGDepositRequest('wstETH');

  const assetsETH = depositRequestETH?.assets ?? 0n;
  const assetsWETH = depositRequestWETH?.assets ?? 0n;
  const assetsWSTETH = depositRequestWSTETH?.assets ?? 0n;

  const ethUsdQuery = useEthUsd(assetsETH);
  const wethUsdQuery = useEthUsd(assetsWETH);
  const wstethUsdQuery = useWstethUsd(assetsWSTETH);

  const claimableShares =
    claimableSharesETH + claimableSharesWETH + claimableSharesWSTETH;

  if (!depositRequestETH && !depositRequestWETH && !depositRequestWSTETH)
    return null;

  return (
    <RequestsContainer>
      <ActionableTitle>Pending deposit request</ActionableTitle>
      {depositRequestETH && (
        <Request
          key={depositRequestETH.timestamp}
          tokenLogo={<TokenEthIcon32 />}
          tokenAmount={depositRequestETH.assets}
          tokenName={getTokenDisplayName('ETH')}
          tokenAmountUSD={ethUsdQuery.usdAmount ?? 0}
          createdDateTimestamp={depositRequestETH.timestamp}
          actionText="Cancel"
          actionCallback={() => void 0}
        />
      )}
      {depositRequestWETH && (
        <Request
          key={depositRequestWETH.timestamp}
          tokenLogo={<TokenWethIcon32 />}
          tokenAmount={depositRequestWETH.assets}
          tokenName={getTokenDisplayName('wETH')}
          tokenAmountUSD={wethUsdQuery.usdAmount ?? 0}
          createdDateTimestamp={depositRequestWETH.timestamp}
          actionText="Cancel"
          actionCallback={() => void 0}
        />
      )}
      {depositRequestWSTETH && (
        <Request
          key={depositRequestWSTETH.timestamp}
          tokenLogo={<TokenWstethIcon32 />}
          tokenAmount={depositRequestWSTETH.assets}
          tokenName={getTokenDisplayName('wstETH')}
          tokenAmountUSD={wstethUsdQuery.usdAmount ?? 0}
          createdDateTimestamp={depositRequestWSTETH.timestamp}
          actionText="Cancel"
          actionCallback={() => void 0}
        />
      )}
      <ActionableTitle>Ready to claim</ActionableTitle>
      {claimableShares > 0 && (
        <Request
          tokenLogo={<TokenStrethIcon />}
          tokenAmount={claimableShares}
          tokenName={getTokenDisplayName('strETH')}
          tokenAmountUSD={0}
          actionText="Claim"
          actionCallback={() => void 0}
        />
      )}
    </RequestsContainer>
  );
};
