import { Question, Tooltip } from '@lidofinance/lido-ui';
import { TokenStrethIcon } from 'assets/earn';
import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import {
  ActionableTitle,
  STGRequest,
} from '../../components/stg-request/stg-request';
import { useSTGPreviewWithdraw } from '../../withdraw/hooks/use-stg-preview-withdraw';
import { useSTGDepositClaim } from '../hooks/use-stg-deposit-claim';

export const STGDepositClaimableRequest = ({
  claimableShares,
  claim,
  isLoading,
}: {
  claimableShares: bigint;
  claim: ReturnType<typeof useSTGDepositClaim>['claim'];
  isLoading: boolean;
}) => {
  const { data: wstEthData } = useSTGPreviewWithdraw({
    shares: claimableShares,
  });
  if (claimableShares <= 0) {
    return null;
  }

  return (
    <>
      <ActionableTitle>
        Ready to claim{' '}
        <Tooltip
          placement="bottomLeft"
          title="strETH can be claimed to be transferred, used in DeFi, or viewed in your wallet. If not claiming, the vault position isn’t affected, your deposited tokens start earning yield as soon as they enter the vault."
        >
          <Question
            style={{
              height: 20,
              width: 20,
              color: 'var(--lido-color-textSecondary)',
            }}
          />
        </Tooltip>
      </ActionableTitle>
      <STGRequest
        tokenLogo={<TokenStrethIcon />}
        tokenAmount={claimableShares}
        tokenName={getTokenDisplayName('strETH')}
        tokenAmountUSD={wstEthData?.usd ?? 0}
        actionText="Claim"
        actionCallback={() => claim(claimableShares)}
        actionLoading={isLoading}
      />
    </>
  );
};
