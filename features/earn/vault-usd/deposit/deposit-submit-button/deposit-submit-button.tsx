import { asToken } from 'utils/as-token';
import { VaultDepositSubmitButton } from 'features/earn/shared/v2/vault-deposit-submit-button';
import { useUsdVaultAvailable } from '../../hooks/use-vault-available';
import { useUSDDepositForm } from '../form-context';
import { useUsdVaultDepositRequest } from '../hooks';

export const UsdVaultDepositSubmitButton = () => {
  const { isDepositLockedForCurrentToken, token: tokenSymbol } =
    useUSDDepositForm();
  const depositRequest = useUsdVaultDepositRequest({
    token: asToken(tokenSymbol),
  });
  const { isUsdVaultAvailable } = useUsdVaultAvailable();

  return (
    <VaultDepositSubmitButton
      isVaultAvailable={isUsdVaultAvailable}
      isDepositLockedForCurrentToken={isDepositLockedForCurrentToken}
      tokenDisplayName={tokenSymbol}
      isClaimable={depositRequest?.isClaimable ?? false}
    />
  );
};
