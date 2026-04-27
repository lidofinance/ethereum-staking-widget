import { TOKEN_SYMBOLS } from 'consts/tokens';
import { VaultDepositSubmitButton } from 'features/earn/shared/v2/vault-deposit-submit-button';
import { useEthVaultAvailable } from '../../hooks/use-vault-available';
import { useETHDepositForm } from '../form-context';
import { useEthVaultDepositRequests } from '../hooks';

export const EthVaultDepositSubmitButton = () => {
  const { isDepositLockedForCurrentToken, token } = useETHDepositForm();
  // stETH deposits go through the wstETH queue, so check wstETH for claimable request state
  const depositRequests = useEthVaultDepositRequests();
  const { isEthVaultAvailable } = useEthVaultAvailable();

  // stETH is wrapped into wstETH on deposit, so clarify that in the tooltip
  const tokenDisplayName =
    token === TOKEN_SYMBOLS.steth
      ? 'stETH (which is wrapped into wstETH)'
      : token;

  return (
    <VaultDepositSubmitButton
      isVaultAvailable={isEthVaultAvailable}
      isDepositLockedForCurrentToken={isDepositLockedForCurrentToken}
      tokenDisplayName={tokenDisplayName}
      isClaimable={depositRequests?.claimableRequests.length > 0}
    />
  );
};
