import { Question, Tooltip } from '@lidofinance/lido-ui';
import { TokenEarnethIcon } from 'assets/earn-v2';
import {
  ActionableTitle,
  Request,
} from 'modules/mellow-meta-vaults/components/request';
import { useEthVaultDepositClaim } from '../hooks/use-deposit-claim';
import { useEthVaultPreviewWithdraw } from '../../withdraw/hooks/use-preview-withdraw';
import { ETH_VAULT_TOKEN_SYMBOL } from '../../consts';

export const EthVaultDepositClaimableRequest = ({
  claimableShares,
  claim,
  isLoading,
}: {
  claimableShares: bigint;
  claim: ReturnType<typeof useEthVaultDepositClaim>['claim'];
  isLoading: boolean;
}) => {
  const { data: wstEthData } = useEthVaultPreviewWithdraw({
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
          title={`${ETH_VAULT_TOKEN_SYMBOL} can be claimed to be transferred, used in DeFi, or viewed in your wallet. If not claiming, the vault position isn’t affected, your deposited tokens start earning yield as soon as they enter the vault.`}
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
      <Request
        tokenLogo={<TokenEarnethIcon />}
        tokenAmount={claimableShares}
        tokenName={ETH_VAULT_TOKEN_SYMBOL}
        tokenAmountUSD={wstEthData?.usd ?? 0}
        actionText="Claim"
        actionCallback={() => claim(claimableShares)}
        actionLoading={isLoading}
      />
    </>
  );
};
