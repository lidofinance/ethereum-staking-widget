import { TokenStrethIcon } from 'assets/earn';
import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import { ActionableTitle, Request } from '../../withdraw/stg-withdraw-request';
import { useSTGPreviewWithdraw } from '../../withdraw/hooks/use-stg-preview-withdraw';
import { useSTGDepositClaim } from '../hooks/use-stg-deposit-claim';

export const STGDepositClaimableShares = ({
  claimableShares,
}: {
  claimableShares: bigint;
}) => {
  const { data: wstEthData } = useSTGPreviewWithdraw({
    shares: claimableShares,
  });
  const { claim } = useSTGDepositClaim();

  if (claimableShares <= 0) {
    return null;
  }

  return (
    <>
      <ActionableTitle>Ready to claim</ActionableTitle>
      <Request
        tokenLogo={<TokenStrethIcon />}
        tokenAmount={claimableShares}
        tokenName={getTokenDisplayName('strETH')}
        tokenAmountUSD={wstEthData?.usd ?? 0}
        actionText="Claim"
        actionCallback={() => claim(claimableShares)}
      />
    </>
  );
};
