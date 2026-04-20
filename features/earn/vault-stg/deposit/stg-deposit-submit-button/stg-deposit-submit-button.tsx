import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import { VaultDepositSubmitButton } from 'features/earn/shared/v2/vault-deposit-submit-button';
import { useSTGAvailable } from '../../hooks/use-stg-available';
import { useSTGDepositForm } from '../form-context';
import { useDepositRequest } from '../hooks';

export const STGDepositSubmitButton = () => {
  const { isDepositLockedForCurrentToken, token } = useSTGDepositForm();
  const depositRequest = useDepositRequest(token);
  const { isSTGAvailable } = useSTGAvailable();

  return (
    <VaultDepositSubmitButton
      isVaultAvailable={isSTGAvailable}
      isDepositLockedForCurrentToken={isDepositLockedForCurrentToken}
      tokenDisplayName={getTokenDisplayName(token)}
      isClaimable={depositRequest?.isClaimable ?? false}
    />
  );
};
